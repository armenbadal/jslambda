# Լամբդա լեզվի իրականացում

_Փորձեր JavaScript-ի և Node.js-ի հետ_

ՋավաՍկրիպտը հերթական ծրագրավորման լեզուն է, որի ուսումնասիրությամբ որոշեցի
զբաղվել վերջին մի քանի շաբաթների հանգստյան օրերին։ Քանի որ ինձ մոտ դեռևս
կապակցված պատկերացում չկա WEB տեխնոլոգիաների ու դրանց մեջ նաև ՋավաՍկրիպտի
դերի մասին, ես ընտրեցի [Node.js®](https://nodejs.org/)-ը։ Այն ինձ թույլ 
է տալիս ծրագրերը գրել, փորձարկել, աշխատեցնել որպես ինքնուրույն ծրագրեր։

Եվ ինչպես միշտ՝ նոր լեզվի ուսումնասիրությունը սկսում եմ մի որևէ փոքր, ոչ 
բարդ շարահյուսությամբ լեզվի _իրականացումով_։ Այս անգամ ընտրել եմ պարզագույն 
_Լամբդա_ լեզուն։ Ահա դրա քերականությունը.

```
expression
    = REAL
    | BOOL
    | LIST
    | IDENT
    | '(' expression ')'
    | BUILTIN expression+
    | 'if' expression 'then' expression 'else' expression
    | 'lambda' IDENT+ ':' expression
    | 'apply' expression 'to' expression
    | 'let' IDENT 'is' expression {'and' IDENT 'is' expression} 'in' expression
    .
```

Այստեղ _իրական_ թվերն են, _տրաբամանական_ `true` և `false` արժեքները, 
_փոփոխականները_, _խմբավորման_ փակագծերը, լեզվի _ներդրված_ գործողությունները, 
_պայմանական_ արտահայտությունը, ինչպես նաև _աբստրակցիայի_ (անանուն ֆունկցիայի 
գրառման) ու _ապլիկացիայի_ (ֆունկցիայի կիրառման) գործողությունները, _կապերի_ 
ստեղծման `let` կառուցվածքը։ Ֆունկցիոնալ ծրագրավորման տեսությունից հայտնի է, 
որ այսքանը բավական է Լամբդա լեզուն ոչ միայն որպես ընդլայնված հաշվարկիչ 
օգտագործելու, այլ նաև լիարժեք (թվային) ալգորիթմներ կազմելու համար։


## Շարահյուսական վերլուծություն

Լամբդա լեզվով գրված տեքստի վերլուծության `parser.js` մոդուլը «արտաքին
աշխարհին» տրամադրում է (exports) միակ `parse` ֆունկցիան։ Այն արգումենտում
ստանում է վերլուծվող տեքստը և վերադարձնում է _աբստրակտ քերականական ծառը_։

Նախ՝ տեքստը տրոհվում է _լեքսեմների_ (lexeme) ցուցակի՝ միաժամանակ ամեն մի
լեքսեմին կապելով համապատասխան _պիտակը_ (token)։ Այնուհետև շարահյուսական
վերլուծիչը, օգտագործելով լեքսեմների ցուցակը, կառուցում է աբստրակտ
քերականական ծառը։

Տեքստը լեքսեմների ցուցակի տրոհող `scanOne` և `scanAll` ֆունկցիաները գրել 
եմ ֆունկցիոնալ մոտեցմամբ։ `scanOne` ֆունկցիան արգումենտում ստանում է տեքստ, 
և վերադարձնում է եռյակ՝ տեքստի սկզբից «պոկված» լեքսեմը, դրա պիտակը և տեքստի
չտրոհված մասը։ Օրինակ, `scanOne('if + a b then a else b')` կանչի արժեքն է
`{ token: 'IF', value: 'if', rest: ' + a b then a else b'}` օբյեկտը։ 
Տեքստից ինձ հետաքրքրող մասը պոկում եմ կանոնավոր արտահայտություների օգնությամբ։

Կանոնավոր արտահայտությունները ՋավաՍկրիպտում կարելի է կառուցել կամ `RegExp`
կոնստրուկտորով, կամ օգտագործել դրանց լիտերալային գրառումները։ Օրինակ, ես 
իդենտիտիֆիկատորները ճանաչող կանոնավոր արտահայտությունը գրել եմ 
`/^[a-zA-z][0-9a-zA-z]*/` տեսքով։ (Տես ECMAScript ստանդարտի
[RegExp (Regular Expression) Objects](https://www.ecma-international.org/ecma-262/8.0/index.html#sec-regexp-regular-expression-objects) 
բաժինը, ինչպես նաև MDN Web Docs-ի [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) բաժինը։)

RegExp օբյեկտի `exec` մեթոդը փորձում է «ճանաչել» տրված տողը։ Եթե այդ
փորձը հաջողվում է, ապա մեթոդը վերադարձնում է արդյունքների զանգվածը,
հակառակ դեպքում՝ `null`։ Քանի որ լեքսեմները միշտ փնտրում եմ տրված տողի
սկզբում, ապա `exec`-ի վերադարձրած զանգվածի առաջին տարրը հենց ինձ
հետաքրքրող լեքսեմն է։ Որպես վերադարձվող օբյեկտի `value` սլոթի արժեք 
վերցնում եմ այդ առաջին տարրը, իսկ տրված տեքստի սկզբից կտրում ու դեն
եմ գցում լեքսեմի երկարությամբ հատված։ «Կտրելը» իրականացրել եմ `String`
օբյեկտի `substring` մեթոդով։

Ահա `scanOne` ֆունկցիան՝ համապատասխան մեկնաբանություններով.

```JavaScript
// Տեքստից կարդալ մեկ (թոքեն, լեքսեմ) զույգ
Parser.prototype.scanOne = function (text) {
  // տեքստի վերջը
  if (text === '') {
    return { token: 'EOS', value: 'EOS', rest: '' }
  }

  // անտեսել բացատանիշերը
  let mc = /^[ \n\t\r]+/.exec(text)
  if (mc != null) {
    return this.scanOne(text.substring(mc[0].length))
  }

  // եթե տողը տառով սկսվող տառերի ու թվանշանների հաջորդականություն
  // է, ապա հանդիպել է կամ ծառայողական բառ, կամ էլ իդենտիֆիկատոր։
  // եթե լեքսեմը ծառայողական բառերի keywords ցուցակից է, ապա
  // վերադարձվող օբյեկտի token սլոթիի արժեք որոշվում է այդ բառով,
  // հակառակ դեպքում token-ը ստանում է IDENT արժեքը
  mc = /^[a-zA-Z][0-9a-zA-Z]*/.exec(text)
  if (mc != null) {
    // եթե ներդրված գործողության անուն է
    if (this.operations.includes(mc[0])) {
      return {
        token: 'OPER',
        value: mc[0].toUpperCase(),
        rest: text.substring(mc[0].length)
      }
    }

    // եթե տրամաբանական հաստատունի սիմվոլն է
    if (mc[0] === 'true' || mc[0] === 'false') {
      return {
        token: 'BOOL',
        value: mc[0],
        rest: text.substring(mc[0].length)
      }
    }

    // ծառայողական բառ է կամ իդենտիֆիկատոր
    return {
      token: this.keywords.includes(mc[0]) ? mc[0].toUpperCase() : 'IDENT',
      value: mc[0],
      rest: text.substring(mc[0].length)
    }
  }

  // իրական թվեր
  mc = /^\d+(\.\d+)?/.exec(text)
  if (mc != null) {
    return {
      token: 'REAL',
      value: mc[0],
      rest: text.substring(mc[0].length)
    }
  }

  // ծառայողական սիմվոլներ (մետասիմվոլներ) են խմբավորման
  // փակագծերն ու անանուն ֆունկցիայի պարամետրերը մարմնից
  // անջատող երկու կետը
  mc = /^([\(\)\[\]:])/.exec(text)
  if (mc != null) {
    return {
      token: mc[0],
      value: mc[0],
      rest: text.substring(mc[0].length)
    }
  }

  // քանի որ լեզվի քերականությունը ներդրված գործողությունները
  // սահմանում է մեկ արտահայտությամբ, ես որոշեցի, որ թվաբանական
  // ու համեմատման գործողությունների նշաններին համապատասխանեցնել
  // մի ընդհանուր OPER պիտակը
  mc = /^(\+|\-|\*|\/|=|<>|>|>=|<|<=|&|\|)/.exec(text)
  if (mc != null) {
    return {
      token: 'OPER',
      value: mc[0],
      rest: text.substring(mc[0].length)
    }
  }

  // չնախատեսված, չսպասված նիշ
  return { token: 'UNKNOWN', value: text[0], rest: text.substring(1) }
}
```

Իսկ `scanAll` ֆունկցիան կանչում է `scanOne` ֆունկցիան այնքան ժամանակ, քանի
դեռ հերթական կանչի արդյունքում չի ստացվել `token == 'EOS'` օբյեկտ։

```JavaScript
// Կարդալ բոլոր (թոքեն, լեքսեմ) զույգերն ու վերադարձնել ցուցակ
Parser.prototype.scanAll = function (text) {
  const res = []
  let ec = this.scanOne(text)
  while (ec.token !== 'EOS') {
    res.push({ token: ec.token, value: ec.value })
    ec = this.scanOne(ec.rest)
  }
  res.push({ token: 'EOS', value: 'EOS' })
  return res
}
```

Այս երկու ֆունկցիաները կազմում են Լամբդա լեզվի բառային վերլուծիչը։ Հիմա՝
շարահյուսական վերլուծության մասին։

`parse` ֆունկցիան `scanAll` ֆունկցիայով տրոհում է իր արգումենտում ստացված
ծրագիրը և լեքսեմների ցուցակը վերագրում է `lexemes` զանգվածին։ Ըստ էության 
այս `lexemes`-ը լեքսեմներ ստեկ է, որից վերլուծիչը տարրերը դուրս է քաշում 
(pop) ըստ լեզվի քերականական կանոնների։ 

```JavaScript
// ծրագրի տեքստի վերլուծություն
Parser.prototype.parse = function (text) {
  this.lexemes = this.scanAll(text)
  return this.expression()
}
```

Լամբդա լեզվի բուն շարահյուսական վերլուծիչն իրականացված է `expression`
ֆունկցիայում. `parse` ֆունկցիան վերադարձնում է հենց վերջինիս արժեքը։

Բայց, մինչև `expression`-ին անցնելը, մի քանի օգնական ֆունկցիաների մասին։
`have` ֆունկցիան վերադարձնում է `true`, եթե լեքսեմների ստեկի գագաթի տարրի
պիտակը հավասար է արգումենտում տրված պիտակին կամ պիտակներից որևէ մեկին։
Այս ֆունկցիայի արգուենտը կարող է լինել ինչպես առանձին պիտակ, այնպես էլ 
պիտակների վեկտոր։

```JavaScript
// ստուգել ցուցակի ընթացիկ տարրը
Parser.prototype.have = function (exp) {
  const headtok = this.lexemes[0].token

  if (exp instanceof Array) {
    return exp.includes(headtok)
  }

  return headtok === exp
}
```

Հաջորդ, `next` ֆունկցիան մոդելավորում է ստեկի pop գործողությունը, բայց 
վերադարձնում է ստեկից հանված տարրի `value` սլոթի արժեքը։

```JavaScript
// անցնել հաջորդին, և վերադարձնել նախորդի արժեքը
Parser.prototype.next = function () {
  return this.lexemes.shift().value
}
```

`match` ֆունկցիան համադրում է `have` և `next` ֆունկցիաները. եթե լեքսեմների
ցուցակի հերթական դիտարկվող տարրի պիտակը հավասաար է `match`-ի արգումենտին,
ապա անցնել ստեկի հաջորդ տարրին։ Եթե հավասար չէ, ապա ազդարարվում է
շարահյուսական սխալի մասին։

```JavaScript
// ստուգել և անցնել հաջորդին
Parser.prototype.match = function (exp) {
  if (this.have(exp)) {
    return this.next()
  }

  throw new Error(`Syntax error: expected '${exp}' but got '${this.head()}'.}`)
}
```

`expression` ֆունկցիայի կառուցվածքը ուղղակիորեն արտացոլում է այս գրառման
սկզբում բերված քերականությանը։ Ինչպես քերականությունն աջ մասն է բաղկացած
տասը այլընտրանքներից (տարբերակներից), այնպես էլ `expression`  ֆունկցիան 
է կազմված տասը տրամաբանական հատվածներից։ Ամեն մի հատվածը ձևավորում ու
վերադարձնում է վերացական շարահյուսական ծառի մի որևէ հանգույց։ Այդ 
հանգույցներն ունեն `kind` սլոթը, որով որոշվում է հանգույցի տեսակը։
Ստորև բերված է `expression` ֆունկցիան՝ մանրամասն մեկնաբանություններով.

```JavaScript
// Արտահայտությունների վերլուծությունը
Parser.prototype.expression = function () {
  // երբ դիտարկվեղ լեքսեմը բուլյան հաստատուն է,
  // ապա վերադարձնել BOOL տիպի հանգույց
  if (this.have('BOOL')) {
    const vl = this.next()
    return { kind: 'BOOL', value: vl === 'TRUE' }
  }

  // եթե դիտարկվող լեքսեմը իրական թիվ է, ապա վերադարձնել
  // AST-ի հանգույց, որի տիպը REAL է
  if (this.have('REAL')) {
    const vl = this.next()
    return { kind: 'REAL', value: parseFloat(vl) }
  }

  // եթե լեքսեմը իդենտիֆիկատոր է, ապա կառուցել
  // փոփոխականի (անուն) հղում ներկայացնող հանգույց
  if (this.have('IDENT')) {
    const nm = this.next()
    return { kind: 'VAR', name: nm }
  }

  // ցուցակը սկսվում է '[' նիշով և ավարտվում է
  // ']' նիշով, իսկ անդամներն իրարից բացատանիշով 
  // բաժանված արտահայտություններ են
  if (this.have('[')) {
    const cs = []
    this.next()
    // ցուցակի անդամները
    while (!this.have(']')) {
      cs.push(this.expression())
    }
    this.match(']')
    // ցուցակի հանգույցը
    return { kind: 'LIST', items: cs }
  }

  // եթե լեքսեմը բացվող փակագիծ է, ապա վերադարձնել
  // փակագծերի ներսում գրված արտահայտության ծառը
  if (this.have('(')) {
    this.next()
    const ex = this.expression()
    this.match(')')
    return ex
  }

  // Լամբդա լեզվի օգտագործումը մի քիչ ավելի հեշտացնելու
  // համար ես դրանում ավելացրել եմ ներդրված գործողություններ։
  // դրանք պրեֆիքսային են, ինչպես Լիսպում՝ ցուցակի առաջին
  // տարրը գործողության նիշն է, որը կարող է լինել թվաբանական,
  // համեմատման կամ տրամաբանական գործողություն
  if (this.have('OPER')) {
    // վերցնել գործողության նիշը
    const op = this.next()
    // վերլուծել առաջին արտահայտությունը
    const args = [this.expression()]
    // քանի դեռ հերթական լեքսեմը պատկանում է FIRST(expression)
    // բազմությանը, վերլուծել հաջորդ արտահայտությունը
    while (this.have(this.exprFirst)) {
      args.push(this.expression())
    }
    // կառուցել լեզվի ներդրված գործողության հանգույցը
    return {
      kind: 'BUILTIN',
      operation: op,
      arguments: args
    }
  }

  // պայմանական արտահայտությունը բաղկացած է if, then, else
  // ծառայողական բառերով բաժանված երեք արտահայտություններից
  if (this.have('IF')) {
    this.next()
    // վերլուծել պայմանի արտահայտությունը
    const co = this.expression()
    this.match('THEN')
    // վերլուծել պայմանի ճիշտ լինելու դեպքում
    // հաշվարկվող արտահայտությունը
    const de = this.expression()
    this.match('ELSE')
    // պայմանի կեղծ լինելու դեպքում հաշվարկվող
    // արտահայտությունը
    const al = this.expression()
    // պայմանակա արտահայտության հանգույցը
    return {
      kind: 'IF',
      condition: co,
      decision: de,
      alternative: al
    }
  }

  // անանուն ֆունկցիայի սահմանումը սկսվում է lambda բառով, որին
  // հաջորդում են ֆունկցիայի պարամետրերը, (ֆունկցիան պիտի ունենա
  // գոնե մեկ պարամետր), հետո, «:» նիշից հետո ֆուկցիայի մարմինն է
  if (this.have('LAMBDA')) {
    this.next()
    // պարամետրերը
    const ps = [this.match('IDENT')]
    while (this.have('IDENT')) {
      ps.push(this.next())
    }
    this.match(':')
    // մարմինը
    const by = this.expression()
    // անանուն ֆունկցիայի հանգույցը
    return {
      kind: 'LAMBDA',
      parameters: ps,
      body: by,
      captures: {}
    }
  }

  // apply գործողությունը իրեն հաջորդող արտահայտությունը
  // կիրառում է to բառից հետո գրված արտահայտություններին
  if (this.have('APPLY')) {
    this.next()
    // վերլուծել կիրառելի աարտահայտությունը
    const fn = this.expression()
    this.match('TO')
    // վերլուծել արգումենտները
    const args = [this.expression()]
    while (this.have(this.exprFirst)) {
      args.push(this.expression())
    }
    // ֆունկցիայի կիրառման հանգույցը
    return {
      kind: 'APPLY',
      callee: fn,
      arguments: args
    }
  }

  // let կառուցվածքը լամբդա լեզվի սիմվոլը կապում է արտահայտության
  // հետ։ Այն կարելի է օգտագործել նաև ռեկուրսիայի համար։
  if (this.have('LET')) {
    this.next()
    // առաջին անունը ...
    let nm = this.match('IDENT')
    this.match('IS')
    // ... և նրան կապվող արտահայտությունը
    let vl = this.expression()
    const nvs = [{ name: nm, value: vl }]
    // նույն let կառուցվածքում կարելի է «հայտարարել» մի քանի
    // անուններ՝ դրանք առանձնացնելով and բառով
    while (this.have('AND')) {
      this.next()
      nm = this.match('IDENT')
      this.match('IS')
      vl = this.expression()
      nvs.push({ name: nm, value: vl })
    }
    // բոլոր կապակցված անունները հասանելի են in բառից հետո 
    // գրված արտահայտության մեջ
    this.match('IN')
    const dy = this.expression()
    return {
      kind: 'LET',
      bindings: nvs,
      body: dy
    }
  }

  // բոլոր այլ դեպքերում ազդարարել շարահյուսական սխալի մասին
  throw new Error(`Syntax error. Expression cannot start with '${this.head()}'.`)
}
```

Վերջում նշեմ, որ Լամբդա լեզվի վերլուծիչն իրականացրել եմ _ռեկուրսիվ վայրէջքի_
եղանակով։ Այդ մասին կարելի է կարդալ ծրագրավորման լեզուների իրականացմանը
նվիրված ցանկացած գրքում։


## Աբստրակտ քերականական ծառը

Լամբդա լեզվով գրված ծրագրի վերլուծության արդյունքում կառուցվում է աբստրակտ
քերականական ծառ, որի հանգույցների տեսակը որոշվում է `kind` սլոթով։ Օրինակ,
`parse('3.14')` կիրառման արդյունքում կառուցվում է `{ kind: 'REAL', value: 3.14 }`
օբյեկտը, որի `kind` սլոթի `REAL` արժեքը ցույց է տալիս, որ սա իրական թիվ
ներկայացնող հանգույց է, իսկ `value` սլոթի արժեքն էլ թվի մեծությունն է։

Մեկ այլ օրինակ, `parse('+ 3.14 x')` ծրագրի վերլության արդյունքում կառուցվում
է հետևյալ օբյեկտը.

```JavaScript
{ kind: 'BUILTIN',
  operation: '+',
  arguments: [ { kind: 'REAL', value: 3.14 }, { kind: 'VAR', name: 'x' } ] }
```

Այստեղ հանգույցի տեսակը `BUILTIN` է (լեզվի ներդրված գործողություն),
գործողության տեսակը՝ `operation`, գումարումն է, արգումենտների վեկտորն էլ
պարունակում է երկու օբյեկտ՝ առաջինը իրկան թիվ ներկայացնող հանգույց է,
իսկ երկրորդը փոփոխականի հղում ներկայացնող հանգույց։

`lambda x : * x x` լամբդա արտահայտության վերլուծության արդյունքում
կառուցվում է մի օբյեկտ, որում `kind == 'LAMBDA'`,  պարամետրերի ցուցակը
պարունակում է միայն `x` փոփոխականի անունը, իսկ մարմինը բազմապատկման
ներդրված գործողությունը ներկայացնող հանգույց է (`captures` սլոթի մասին
կխոսեմ լամբդա արտահայտությունների ինտերպրետացիայի բաժնում)։

```JavaScript
{ kind: 'LAMBDA',
  parameters: [ 'x' ],
  body:
   { kind: 'BUILTIN',
     operation: '*',
     arguments: [ [Object], [Object] ] },
  captures: {} }
```


## Ինտերպրետացիա

Լամբդա ծրագրի վերլուծության արդյունքում կառուցված ծառի _ինտերպրետացիայի_
`evaluate` ֆունկցիան նույնպես կառուցված է ռեկուրսիվ սխեմայով։ Դրա առաջին
արգումենտը ծրագրի աբստրակտ քերականական ծառն է, իսկ երկրորդը՝ հաշվարկման
միջավայրը։ Վերջինս մի արտապատկերում է (map), որում սիմվոլներին
համապատասխանեցված են ընթացիկ արժեքները։ Քանի որ Լամբդա լեզվում վերագրման
գործողություն չկա, փոփոխականներին արժեքներ կարող են կապվել ֆունկցիայի
պարամետրերի կամ `let` կառուցվածքի օգնությամբ։

```JavaScript
var evaluate = function(expr, env) { /* ... */ }
```

Ինչպես երևում է `expression` ֆունկցիայից, վերլուծության արդյուքնում
կառուցվում են ինը տեսակի հանգույցներ. `REAL`, `BOOL`, `LIST`, `VAR`,
`BUILTIN`, `IF`, `LAMBDA`, `APPLY` և `LET`։ `evaluate` ֆունկցիայում 
դիտարկվում են բոլոր այս դեպքերը։

`REAL` տիպի հանգույցի հաշվարկման արդյունքը դրա `value` սլոթի արժեքն է։

```JavaScript
if (expr.kind === 'REAL' || expr.kind === 'BOOL') {
  return expr.value
}
```

`VAR` տիպի հանգույցի հաշվարկման արժեքը ստանալու համար միջավայրից
վերադարձնում եմ `name` սլոթին կապված արժեքը։

```JavaScript
if (expr.kind === 'VAR') {
  return env[expr.name]
}
```

Ցուցակի արժեքը դրա անդամների հաշվարկումից ստացված արժեքների ցուցակն է.

```JavaScript
if (expr.kind === 'LIST') {
  return expr.items.map(e => evaluate(e, env))
}
```

`BUILTIN` տիպի հանգույցի արժեքը ստանալու համար պետք է նախ հաշվարկել
`arguments` ցուցակի արտահայտությունների արժեքները, ապա գրանց նկատմամբ
կիրառել `operation` սլոթում գրանցված գործողությունը։

```JavaScript
if (expr.kind === 'BUILTIN') {
  const evags = expr.arguments.map(e => evaluate(e, env))
  return builtins[expr.operation].apply(null, evags)
}
```

`IF` տիպի հանգույցը, որ պայմանական արտահայտության մոդելն է, հաշվարկելու
համար նախ հաշվարկվում է `condition` սլոթի արժեքը՝ պայմանը։ Եթե այն տարբեր
է `0.0` թվային արժեքից՝ _ճշմարիտ_ է, ապա հաշվարկվում և վերադարձվում է
`decision` սլոթի արժեքը։ Եթե `condition`-ի արժեքը զրո է, ապա հաշվարկվում ու
վերադարձվում է `alternative` սլոթին կապված արտահայտության արժեքը։

```JavaScript
if (expr.kind === 'IF') {
  const co = evaluate(expr.condition, env)
  return co ? evaluate(expr.decision, env) : evaluate(expr.alternative, env)
}
```

`LAMBDA` տիպի հանգույցի հաշվարկման արդյունքում պիտի կառուցվի մի օբյեկտ,
որը կոչվում է _closure_ (չգիտեմ, թե հայերեն սրան ինչ են ասում)։ Իմաստն այն
է, որ `LAMBDA` օբյեկտի `captures` սլոթում գրանցվում են `body` սլոթին կապված
արտահայտության _ազատ փոփոխականների_ արժեքները՝ հաշվարկված ընթացիկ
միջավայրում։ Այս կերպ լրացված `LAMBDA` օբյեկտն արդեն հնարավոր կլինի `apply`
գործողությամբ կիրառել արգումենտների նկատմամբ։ (Արտահայտության մեջ մտնող
ազատ փոփոխականների բազմությունը հաշվարկող `freeVariables` ֆունկցիայի մասին
քիչ ավելի ուշ)։

```JavaScript
if (expr.kind === 'LAMBDA') {
  // լամբդա օբյեկտի պատճեն
  const clos = Object.assign({}, expr)
  // ազատ փոփոխականները
  const fvs = freeVariables(clos)
  // նոր միջավայրի կառուցում
  fvs.forEach(v => clos.captures[v] = env[v])
  return clos
}
```

Մի օրինակ. թող որ տրված է `lambda y : + x y` արտահայտությունը և `{ 'x': 7 }`
հաշվարկման միջավայրը։ Ինչպես արդեն նշեցի վերլուծության մասին պատմելիս,
այս տրված ծրագրի վերլուծությունը կառուցելու է այսպիսի մի օբյեկտ.

```JavaScript
{
  kind: 'LAMBDA',
  parameters: [ 'y' ],
  body: {
    kind: 'BUILTIN',
    operation: '+',
    'arguments': [
      {
        kind: 'VAR',
        name: 'x'
      },
      {
        kind: 'VAR',
        name: 'y'
      }
    ]
  },
  captures: {}
}
```

Երբ այս օբյեկտը հաշվարկում եմ `{ 'x': 7 }` միջավայրում, ստանում եմ նույն
օբյեկտը, բայց արդեն լրացված `captures` սլոթով։

```JavaScript
{
  kind: 'LAMBDA',
  parameters: [ 'y' ],
  body: {
    kind: 'BUILTIN',
    operation: '+',
    'arguments': [
      {
        kind: 'VAR',
        name: 'x'
      },
      {
        kind: 'VAR',
        name: 'y'
      }
    ]
  },
  captures: {
    x: 7
  }
}
```

`apply` _f_ `to` _e0 e1 ... en_ արտահայտության հաշվարկման սեմանտիկան
(իմաստը) _f_ ֆունկցիայի՝ _e0 e1 ... en_ արտահայտությունների նկատմամբ
կիրառելն է։ Քանի որ, ըստ Լամբդա լեզվի քերականության, _f_-ը նույնպես
արտահայտություն է, ապա նախ՝ պետք է հաշվարկել այն և համոզվել, որ ստացվել
է _կիրառելի_ օբյեկտ՝ closure (թող դա կոչվի _f'_), որի `captures`-ը
պարունակում է լամբդայի մարմնի ազատ փոփոխականների արժեքները (bindings)։
Հետո պետք է հաշվարկել `APPLY` օբյեկտի `arguments` սլոթին կապված ցուցակի
արտահայտությունները՝ կիրառման արգումենտները, ու դրանք ըստ հերթականության
կապել closure-ի պարամետրերին։ Եվ վերջապես, _f'_ օբյեկտի մարմինը հաշվարկել
մի միջավայրում, որը կառուցված է closure-ի `captures`-ի և պարամետրերի ու
արգումենտների արժեքների համադրումով։ (Էս պարբերությունը ոնց որ մի քիչ
լավ չստացվեց։)

```JavaScript
if( expr.kind == 'APPLY' ) {
  // հաշվարկել կիրառելին
  const clos = evaluate(expr.callee, env)
  if (clos.kind !== 'LAMBDA') {
    throw new Error('Evaluation error.')
  }

  // հաշվարկել արգումենտները
  const evags = expr.arguments.map(e => evaluate(e, env))
  // կառուցել նոր միջավայր, որը closure-ի capture-ից
  // և closure-ի պարամետրերին կապված արգումենտներից
  const nenv = Object.assign({}, env, clos.captures)
  const count = Math.min(clos.parameters.length, evags.length)
  for (let k = 0; k < count; ++k) {
    nenv[clos.parameters[k]] = evags[k]
  }
  // closure-ի մարմինը հաշվարկել նոր միջավայրում
  return evaluate(clos.body, nenv)
}
```

`LET` կառուցվածքը նոր կապեր է ստեղծում անունների ու արժեքների միջև։
Այդ ստեղծված կապերը կարող են օգտագործվել `IN` բառից հետո գրված
արտահայտության մեջ։ 

```JavaScript
if (expr.kind === 'LET') {
  // կառուցել նոր միջավայր
  const nenv = Object.create({}, env)
  // հաշվարկել բոլոր կապերը և գրառել նոր միջավայրում
  for (const nv of expr.bindings) {
    nenv[nv.name] = null
    const ev = evaluate(nv.value, nenv)
    if (typeof ev === 'object' && ev.kind === 'LAMBDA') {
      if (nv.name in ev.captures) {
        delete ev.captures[nv.name]
      }
    }
    nenv[nv.name] = ev
  }
  // հաշվարկել ու վերադարձնել let-ի մարմինը
  return evaluate(expr.body, nenv)
}
```

Սա հնարավորություն է տալիս նաև սահմանել ռեկուրսիվ ֆունկցիաներ։ Օրինակ.

```
let
  pi is 3.1415
in
  lambda r : * pi r r
```

Այստեղ նախ՝ `pi` սիմվոլին կապվում է `3.1415` արժեքը, ապա՝ `let`-ի մարմնում
`pi`-ն օգտագործվում է անանուն ֆունկցիայի սահմանման մեջ։

Մի այլ օրինակ։ Թվի ֆակտորիալը հաշվող պապենական ֆունկցիան կարող  ենք
սահմանել այսպես.

```
let
  fact is lambda n:
    if (= n 1)
    then 1
    else * n (apply fact to - n 1)
in
  apply fact to 10
```

Սա հաշվարկում է 10-ի ֆակտորիալը։




## Օգտագործումը

Ամեն մի իրեն հարգող ինտերպրետատոր, առավել ևս՝ ֆունկցիոնալ լեզվի
իրականացում, պետք է ունենա այսպես կոչված _REPL_ (read-eval-print loop,
_կարդալ_-_հաշվարկել_-_արտածել_-_կրկնել_)։ Դրա իրականացումը օգտագործողին
առաջարկում է ներմուծել արտահայտություն, ապա հաշվարկում է այն և
արտածում է արժեքը։ Այս երեք քայլերը կրկնվում են այնքան ժամանակ, քանի
դեռ օգտագործողը, ի որևէ հատուկ հրամանով, չի ընդհատում աշխատանքը։

Որպես հրավերք ես ընտրել եմ հունարեն _λάμδα_ բառը, իսկ որպես աշխատանքի
ավարտի ազդանշան՝ _///_ նիշերը։ Օգտագործող-ինտերպրետատոր երկխոսության
կազմակերպման համար օգտագործել եմ Node.js®-ի
[readline](https://nodejs.org/api/readline.html) գրադարանը: Ստորև բերված
`repl` ֆունկցիայի կոդի մասին շատ մանրամասներ չեմ կարող ասել, որովհետև
ինքս էլ նոր եմ ծանոթանում դրան ու փորձում եմ հասկանալ _պատահար_-ների
(event) հետ աշխատանքի սկզբունքները։

```JavaScript
var repl = function() {
    var rr = rl.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'λάμδα> ',
        terminal: false
    });

    rr.prompt()

    rr.on('line', (line) => {
        if( line == 'end' ) {
            rr.close()
            return
        }

        console.info(ev.evaluate(ps.parse(line), {}))
        rr.prompt()
    }).on('close', () => {
        console.info('Bye')
        process.exit(0)
    });
}
```

Բացի երկխոսության ռեժիմից, Լամբդայի ինտերպրետատորը կարելի է աշխատեցնել
նաև հրամանային տողում տալով լամբդա արտահայտությունը պարունակող ֆայլը։
`evalFile` ֆունկցիայւոմ նախ ստուգում եմ տրված ֆայլի գոյությունը, ապա
`readFileSync` ֆունկցիայով կարդում եմ դրա ամբողջ պարունակությունը։
Հաշվարկումը կատարվում է ճիշտ այնպես, ինչպես REPL-ում ներմուծված տողի
հաշվարկը։

```JavaScript
var evalFile = function(path) {
  if( !fs.existsSync(path) ) return;

  let prog = fs.readFileSync(path, {encoding: 'utf-8'})
  console.info(ev.evaluate(ps.parse(prog), {}))
}
```

Աշխատանքային ռեժիմի ընտրությունը կատարվում է հրամանային տողում տրված
արգումենտների քանակը ստուգելով։ Եթե `process.argv.length > 2`, ապա
ենթադրում եմ, որ հրամանային տողում տրված է ծրագիրը պարունակող ֆայլ,
և կանչվում է `evalFile` ֆունկցիան։ Հակառակ դեպքում գործարկվում է REPL-ը։

```JavaScript
if( process.argv.length > 2 ) {
    evalFile(process.argv[2])
}
else {
    repl()
}
```



## Աղբյուրներ

Ֆունկցիոնալ լեզվի իրականացման հարցերը քննարկվում են շատ գրքերում ու
հոդվածներում։ Ես անհրաժեշտ եմ համարում դրանցից մի քանիսի թվարկումը.

1. Christian Queinnec, _Lisp in Small Pieces_, Cambridge University Press, 2003.
2. Peter Norvig, _Paradigms of Artificial Intelligence Programming: Case Studies in Common Lisp_,  Morgan Kaufmann, 1991.
3. Harold Abelson, Jerald Jay Sussman, Julie Sussman, _Structure and Interpretation of Computer Programs_, 2nd Edition, MIT Press, 1996.
4. Peter Norvig, _[(How to Write a (Lisp) Interpreter (in Python))](http://norvig.com/lispy.html)_ և _[(An ((Even Better) Lisp) Interpreter (in Python))](http://norvig.com/lispy2.html)_.
5. John McCarthy, _[Recursive Functions of Symbolic Expressions and Their Computation by Machine, Part I](http://www-formal.stanford.edu/jmc/recursive/recursive.html)_.
6. Paul Graham, _[The Roots of Lisp](http://www.paulgraham.com/rootsoflisp.html)_.
