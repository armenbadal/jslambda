'use strict'

// Վերլուծության դասի սահմանումը
const Parser = function () {
  // Լեզվի ծառայողական բառերի ցուցակը
  this.keywords = ['if', 'then', 'else', 'lambda', 'apply',
    'to', 'let', 'is', 'in', 'and', 'library', 'defines', 'as']

  // անվանված գործողություններ
  this.operations = ['cons', 'head', 'tail', 'length']

  // արտահայտությունը սկսող թոքենների ցուցակը. FIRST(expression)
  this.exprFirst = ['REAL', 'BOOL', 'IDENT', '[', '(', 'OPER',
    'IF', 'LAMBDA', 'APPLY']
}

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

// ստուգել ցուցակի ընթացիկ տարրը
Parser.prototype.have = function (exp) {
  const headtok = this.lexemes[0].token

  if (exp instanceof Array) {
    return exp.includes(headtok)
  }

  return headtok === exp
}

// անցնել հաջորդին, և վերադարձնել նախորդի արժեքը
Parser.prototype.next = function () {
  return this.lexemes.shift().value
}

// ընթացիկ լեքսեմի արժեքը
Parser.prototype.head = function () {
  return this.lexemes[0].value
}

// ստուգել և անցնել հաջորդին
Parser.prototype.match = function (exp) {
  if (this.have(exp)) {
    return this.next()
  }

  throw new Error(`Syntax error: expected '${exp}' but got '${this.head()}'.}`)
}

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

// Գրադարանի սահմանում
Parser.prototype.library = function () {
    let libr = {
        name: '',
        items: {}
    }

    if (this.have('LIBRARY')) {
        this.next()
        libr.name = this.match('IDENT')
        this.match('DEFINES')

        const bindings = [this.binding('AS')]
        while (this.have('AND')) {
            this.next()
            bindings.push(this.binding('AS'))
        }
    }
}

// մեկ կապի վերլուծությունը
Parser.prototype.binding = function (kw) {
    const name = this.match('IDENT')
    this.match(kw)
    const value = this.expression()
    return { name, value }
}


// ծրագրի տեքստի վերլուծություն
Parser.prototype.parse = function (text) {
  this.lexemes = this.scanAll(text)
  return this.expression()
}

const parse = function (text) {
  return (new Parser()).parse(text)
}

export { parse }
