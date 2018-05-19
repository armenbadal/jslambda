# basic-jsi
JavaScript և Node.js ուսումնասիրություններ

JavaScript-ը հերթական ծրագրավորման լեզուն է, որի ուսումնասիրությամբ որոշեցի
զբաղվել վերջին մի քանի շաբաթների հանգստյան օրերին։ Եվ ինչպես միշտ նոր լեզվի
ուսումնասիրությունը սկսում եմ մի որևէ այլ լեզու _իրականացնելու_ համար։ Այս
անգամ որպես իրականացվող լեզու ընտրել եմ պարզագույն _Լամբդա_ լեզուն։ Ահա դրա
քերականությունը.

```
expression
    = NUMBER
    | VARIABLE
    | '(' expression ')'
    | BUILTIN expression+
    | 'if' expression 'then' expression 'else' expression
    | 'apply' expression 'to' expression
    .
```

Այստեղ _իրական_ թվերն են, _փոփոխականները_, _խմբավորման_ փակագծերը, լեզվի
_ներդրված_ գործողությունները, _պայմանական_ արտահայտությունը, ինչպես նաև
_աբստրակցիայի_ ու _ապլիկացիայի_ գործողությունները։ Ֆունկցիոնալ ծրագրավորման
տեսությունից հայտնի է, որ այսքանը բավական է Լամբդա լեզուն ոչ միայն որպես
ընդլայնված հաշվարկիչ օգտագործելու, այլ նաև լիարժեք (թվային) ալգորիթմներ
կազմելու համար։


## Վերլուծություն

Լամբդա լեզվով գրված տեքստի վերլուծության `parser.js` մոդուլը արտաքին
աշխարհին տրամադրում է (exports) միակ `parse` ֆունկցիան։ Վերջինս արգումենտում
ստանում է վերլուծվող տեքստը և վերադարձնում է _աբստրակտ քերականական ծառը_։

Նախ՝ տեքստը տրոհվում է _լեքսեմների_ (lexeme) ցուցակի՝ միաժամանակ ամեն մի
լեքսեմին կապելով համապատասխան _պիտակը_ (token)։ Այնուհետև շարահյուսական
վերլուծիչը, օգտագործելով լեքսեմների ցուցակը, կառուցում է աբստրակտ
քերականական ծառը։

Տեքստը լեքսեմների ցուցակի տրոհող `scanOne` և `scanAll` ֆունկցիաները գրել եմ
ֆունկցիոնալ մոտեցմամբ։ `scanOne` ֆունկցիան արգումենտում ստանում է տեքստ, և
վերադարձնում է եռյակ՝ տեքստի սկզբից «պոկված» լեքսեմը, դրա պիտակը և տեքստի
չտրոհված մասը։ Օրինակ, `scanOne('if + a b then a else b)` կանչի արժեքն է
`{ token: 'IF', value: `if`, rest: ' + a b then a else b'}` օբյեկտը։ Ահա այդ
ֆունկցիան՝ համապատասխան մեկնաբանություններով.

```JavaScript
// Լեզվի ծառայողական բառերի ցուցակը
const keywords = ['if', 'then', 'else', 'lambda', 'apply', 'to']

// Տեքստից կարդալ մեկ (թոքեն, լեքսեմ) զույգ
var scanOne = function(text) {
    // տեքստի վերջը
    if( text == '' ) {
        return { token: 'EOS', value:'EOS', rest: '' }
    }

    // անտեսել բացատանիշերը
    let mc = /^[ \n\t\r]+/.exec(text)
    if( mc != null ) {
        return scanOne(text.substring(mc[0].length))
    }

    // ծառայողական բառեր և իդենտիֆիկատորներ
    mc = /^[a-zA-z][0-9a-zA-z]*/.exec(text)
    if( mc != null ) {
        return {
            token: keywords.includes(mc[0]) ? mc[0].toUpperCase() : 'IDENT',
            value: mc[0],
            rest: text.substring(mc[0].length)
        }
    }

    // իրական թվեր
    mc = /^[0-9]+(\.[0-9]+)?/.exec(text)
    if( mc != null ) {
        return {
            token: 'REAL',
            value: mc[0],
            rest: text.substring(mc[0].length)
        }
    }

    // ծառայողական սիմվոլներ (մետասիմվոլներ)
    mc = /^(\(|\)|:)/.exec(text)
    if( mc != null ) {
        return {
            token: mc[0],
            value: mc[0],
            rest: text.substring(mc[0].length)
        }
    }

    // գործողությունների նշաններ
    mc = /^(\+|\-|\*|\/|=|<>|>|>=|<|<=)/.exec(text)
    if( mc != null ) {
        return {
            token: 'OPER',
            value: mc[0],
            rest: text.substring(mc[0].length)
        }
    }

    // չնախատեսված, չսպասված նիշ
    return { token: 'UNKNOWN', value: text[0], rest: text }
}
```

Իսկ `scanAll` ֆունկցիան կանչում է `scanOne` ֆունկցիան այնքան ժամանակ, քանի
դեռ հերթական կանչի արդյունքում չի ստացվել `token == 'EOS'` օբյեկտ։

```JavaScript
// Կարդալ բոլոր (թոքեն, լեքսեմ) զույգերն ու վերադարձնել ցուցակ
var scanAll = function(text) {
    let res = []
    let ec = scanOne(text)
    while( ec.token != 'EOS' ) {
        res.push({token: ec.token, value: ec.value})
        ec = scanOne(ec.rest)
    }
    res.push({token: 'EOS', value: 'EOS'})
    return res
}
```

Այս երկու ֆունկցիաները կազմում են Լամբդա լեզվի բառային վերլուծիչը։ Հիմա
ցույց տամ, թե 


## Ինտերպրետացիա




Ֆունկցիոնալ լեզվի իրականացման հարցերը քննարկվում են շատ գրքերում ու
հոդվածներում։ Ես անհրաժեշտ եմ համարում դրանցից մի քանիսի թվարկումը.

1. Christian Queinnec, _Lisp in Small Pieces_, Cambridge University Press, 2003.
2. Peter Norvig, _Paradigms of Artificial Intelligence Programming: Case Studies in Common Lisp_,  Morgan Kaufmann, 1991.
3. Harold Abelson, Jerald Jay Sussman, Julie Sussman, _Structure and Interpretation of Computer Programs_, 2nd Edition, MIT Press, 1996.
4. Peter Norvig, _[(How to Write a (Lisp) Interpreter (in Python))](http://norvig.com/lispy.html)_ և _[(An ((Even Better) Lisp) Interpreter (in Python))](http://norvig.com/lispy2.html)_.
5. John McCarthy, _[Recursive Functions of Symbolic Expressions and Their Computation by Machine, Part I](http://www-formal.stanford.edu/jmc/recursive/recursive.html)_.
6. Paul Graham, _[The Roots of Lisp](http://www.paulgraham.com/rootsoflisp.html)_.
