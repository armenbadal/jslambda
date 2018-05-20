# basic-jsi
JavaScript և Node.js ուսումնասիրություններ

JavaScript-ը հերթական ծրագրավորման լեզուն է, որի ուսումնասիրությամբ որոշեցի
զբաղվել վերջին մի քանի շաբաթների հանգստյան օրերին։ Եվ ինչպես միշտ նոր լեզվի
ուսումնասիրությունը սկսում եմ մի որևէ այլ լեզու _իրականացնելու_ համար։ Այս
անգամ որպես իրականացվող լեզու ընտրել եմ պարզագույն _Լամբդա_ լեզուն։ Ահա դրա
քերականությունը.

```
expression
    = REAL
    | VARIABLE
    | '(' expression ')'
    | BUILTIN expression+
    | 'if' expression 'then' expression 'else' expression
    | 'lambda' IDENT+ ':' expression
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
`{ token: 'IF', value: 'if', rest: ' + a b then a else b'}` օբյեկտը։ Տեքստից
ինձ հետաքրքրող մասը պոկում եմ կանոնավոր արտահայտություների օգնությամբ։
Ահա `scanOne` ֆունկցիան՝ համապատասխան մեկնաբանություններով.

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

Այս երկու ֆունկցիաները կազմում են Լամբդա լեզվի բառային վերլուծիչը։ Հիմա՝
շարահյուսական վերլուծության մասին։

`parse` ֆունկցիան `scanAll` ֆունկցիայով տրոհում է իր արգումենտում ստացված
ծրագիրը և լեքսեմների ցուցակը վերագրում է `lexemes` գլոբալ սիմվոլին։ `index`
գլոբալ հաշվիչին վերագրելով `0` արժեքը՝ նշվում է, որ վերլուծությունը
սկսվելու է ցուցակի առաջին լեքսեմից։ Եվ վերադարձնում է `expression`
ֆունկցիայի կանչի արժեքը, որն ինքը հենց Լամբդա լեզվի վերլուծիչն է։

```JavaScript
// (թոքեն, լեքսեմ) զույգերի ցուցակ
var lexemes = []
// ընթացիկ օգտագործվող տարր ինդեքսը
var index = 0;

// ծրագրի տեքստի վերլուծություն
var parse = function(text) {
    lexemes = scanAll(text)
    index = 0
    return expression()
}
```

Բայց, մինչև `expression`-ին անցնելը, մի քանի օգնական ֆունկցիաների մասին։
`have` ֆունկցիան վերադարձնում է `true`, եթե լեքսեմների ցուցակի `index`-րդ
տարրի պիտակը հավասար է արգումենտում տրված պիտակին կամ պիտակներից որևէ
մեկին։ Այս ֆունկցիայի արգուենտը կարող է լինել ինչպես առանձին պիտակ,
այնպես է պիտակների վեկտոր։

```JavaScript
// ստուգել ցուցակի ընթացիկ տարրը
var have = function(exp) {
    let head = lexemes[index].token

    if( exp instanceof Array )
        return exp.includes(head)

    return head == exp
}
```

Հաջորդ, `next` ֆունկցիան մեկով ավելացնում է լեքսեմների ինդեքոը՝ դիտարկվելի
դարձնելով լեքսեմների ցուցակի հաջորդ տարրը։ Բայց վերադարձնում է ցուցակի
նախորդ տարրի արժեքը՝ `value` սլոթի արժեքը։

```JavaScript
// անցնել հաջորդին, և վերադարձնել նախորդի արժեքը
var next = function() {
    return lexemes[index++].value
}
```

`match` ֆունկցիան համադրում է `have` և `next` ֆունկցիաները. եթե լեքսեմների
ցուցակի հերթական դիտարկվող տարրի պիտակը հավասաար է `match`-ի արգումենտին,
ապա դիտարկելի դարձնել հաջորդ տարրը։ Եթե հավասար չէ, ապա ազդարարվում է
շարահյուսական սխալի մասին։

```JavaScript
// ստուգել և անցնել հաջորդին
var match = function(exp) {
    if( have(exp) )
        return next()
    throw 'Syntax error.'
}
```

`expression` ֆունկցիայի կառուցվածքը ուղղակիորեն արտացոլում է այս գրառման
սկզբում բերված քերականությանը։ Ինչպես քերականությունն աջ մասն է բաղկացած
յոթ այլընտրանքներից (տարբերակներից), այնպես էլ `expression`  ֆունկցիան է
կազմված յոթ տրամաբանական հատվածներից։ Ամեն մի հատվածը ձևավորում ու
վերադարձնում է աբստրակտ քերականական ծառի մի որևէ հանգույց։ Այդ
հանգույցներն ունեն `kind` սլոթը, որով որոշվում է հանգույցի տեսակը։
Ստորև բերված է `expression` ֆունկցիան՝ մանրամասն մեկնաբանություններով.

```JavaScript
// Լամբդա լեզվի արտահայտությունները կարող են սկսվել միայն հետևյալ
// պիտակներով։ Գրականության մեջ այս բազմությունը կոչվում է FIRST.
// FIRST(expression)
const exprFirst = ['REAL', 'IDENT', '(', 'OPER', 'IF', 'LAMBDA', 'APPLY']

// Արտահայտությունների վերլուծությունը
var expression = function() {
    // եթե դիտարկվող լեքսեմը իրական թիվ է,
    // ապա վերադարձնել AST-ի հանգույց, որի
    // տիպը REAL է
    if( have('REAL') ) {
        let vl = next()
        return { kind: 'REAL', value: parseFloat(vl) }
    }

    // եթե լեքսեմը իդենտիֆիկատոր է, ապա կառուցել
    // փոփոխականի (անուն) հղում ներկայացնող հանգույց
    if( have('IDENT') ) {
        let nm = next()
        return { kind: 'VAR', name: nm }
    }

    // եթե լեքսեմը բացվող փակագիծ է, ապա վերադարձնել
    // փակագծերի ներսում գրված արտահայտության ծառը
    if( have('(') ) {
        next()
        let ex = expression()
        match(')')
        return ex
    }

    // Լամբդա լեզվի օգտագործումը մի քիչ ավելի հեշտացնելու
    // համար ես դրանում ավելացրել եմ ներդրված գործողություններ։
    // դրանք պրեֆիքսային են, ինչպես Լիսպում՝ ցուցակի առաջին
    // տարրը գործողության նիշն է, որը կարող է լինել թվաբանական,
    // համեմատման կամ տրամաբանական գործողություն
    if( have('OPER') ) {
        // վերցնել գործողության նիշը
        let op = next()
        // վերլուծել առաջին արտահայտությունը
        let args = [ expression() ]
        // քանի դեռ հերթական լեքսեմը պատկանում է FIRST(expression)
        // բազմությանը, վերլուծել հաջորդ արտահայտությունը
        while( have(exprFirst) )
            args.push(expression())
        // կառուցել լեզվի ներդրված գործողության հանգույցը
        return { kind: 'BUILTIN', operation: op, arguments: args }
    }

    // պայմանական արտահայտությունը բաղկացած է if, then, else
    // ծառայողական բառերով բաժանված երեք արտահայտություններից
    if( have('IF') ) {
        next()
        // վերլուծել պայմանի արտահայտությունը
        let co = expression()
        match('THEN')
        // վերլուծել պայմանի ճիշտ լինելու դեպքում
        // հաշվարկվող արտահայտությունը
        let de = expression()
        match('ELSE')
        // պայմանի կեղծ լինելու դեպքում հաշվարկվող
        // արտահայտությունը
        let al = expression()
        // պայմանակա արտահայտության հանգույցը
        return { kind: 'IF', condition: co, decision: de, alternative: al }
    }

    // անանուն ֆունկցիայի սահմանումը սկսվում է lambda
    // բառով, որին հաջորդում են ֆունկցիայի պարամետրերը,
    // (ֆունկցիան պիտի ունենա գոնե մեկ պարամետր), հետո,
    // «:» նիշից հետո ֆուկցիայի մարմինն է
    if( have('LAMBDA') ) {
        next()
        // պարամետրերը
        let ps = [ match('IDENT') ]
        while( have('IDENT') )
            ps.push(next())
        match(':')
        // մարմինը
        let by = expression()
        // անանուն ֆունկցիայի հանգույցը
        return { kind: 'LAMBDA', parameters: ps, body: by, captures: [] }
    }

    // apply գործողությունը իրեն հաջորդող արտահայտությունը
    // կիրառում է to բառից հետո գրված արտահայտություններին
    if( have('APPLY') ) {
        next()
        // վերլուծել կիրառելի աարտահայտությունը
        let fn = expression()
        match('TO')
        // վերլուծել արգումենտները
        let args = [ expression() ]
        while( have(exprFirst) )
            args.push(expression())
        // ֆունկցիայի կիրառման հանգույցը
        return { kind: 'APPLY', callee: fn, arguments: args }
    }

    // բոլոր այլ դեպքերում ազդարարել շարահյուսական սխալի մասին
    throw 'Syntax error.'
}
```

Վերջում նշեմ, որ Լամբդա լեզվի վերլուծիչն իրականացրել եմ _ռեկուրսիվ վայրէջքի_
եղանակով։ Այդ մասին կարելի է կարդալ ծրագրավորման լեզուների իրականացմանը
նվիրված ցանկացած գրքում։



## Ինտերպրետացիա



## Աղբյուրներ

Ֆունկցիոնալ լեզվի իրականացման հարցերը քննարկվում են շատ գրքերում ու
հոդվածներում։ Ես անհրաժեշտ եմ համարում դրանցից մի քանիսի թվարկումը.

1. Christian Queinnec, _Lisp in Small Pieces_, Cambridge University Press, 2003.
2. Peter Norvig, _Paradigms of Artificial Intelligence Programming: Case Studies in Common Lisp_,  Morgan Kaufmann, 1991.
3. Harold Abelson, Jerald Jay Sussman, Julie Sussman, _Structure and Interpretation of Computer Programs_, 2nd Edition, MIT Press, 1996.
4. Peter Norvig, _[(How to Write a (Lisp) Interpreter (in Python))](http://norvig.com/lispy.html)_ և _[(An ((Even Better) Lisp) Interpreter (in Python))](http://norvig.com/lispy2.html)_.
5. John McCarthy, _[Recursive Functions of Symbolic Expressions and Their Computation by Machine, Part I](http://www-formal.stanford.edu/jmc/recursive/recursive.html)_.
6. Paul Graham, _[The Roots of Lisp](http://www.paulgraham.com/rootsoflisp.html)_.
