'use strict'

// Վերլուծության դասի սահմանումը
const Parser = function () {
  // Լեզվի ծառայողական բառերի ցուցակը
  this.keywords = ['if', 'then', 'else', 'lambda', 'apply', 'to',
    'let', 'is', 'in', 'and', 'true', 'false']

  // անվանված գործողություններ
  this.operations = ['cons', 'head', 'tail']

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

  // ծառայողական բառեր և իդենտիֆիկատորներ
  mc = /^[a-zA-Z][0-9a-zA-Z]*/.exec(text)
  if (mc != null) {
    if (this.operations.includes(mc[0])) {
      return {
        token: 'OPER',
        value: mc[0].toUpperCase(),
        rest: text.substring(mc[0].length)
      }
    }

    if (mc[0] === 'TRUE' || mc[0] === 'FALSE') {
      return {
        token: 'BOOL',
        value: mc[0],
        rest: text.substring(mc[0].length)
      }
    }

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

  // ծառայողական սիմվոլներ (մետասիմվոլներ)
  mc = /^([\(\)\[\]:])/.exec(text)
  if (mc != null) {
    return {
      token: mc[0],
      value: mc[0],
      rest: text.substring(mc[0].length)
    }
  }

  // գործողությունների նշաններ
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

  if (exp instanceof Array) { return exp.includes(headtok) }

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
  if (this.have(exp)) { return this.next() }

  throw new Error(`Syntax error: expected '${exp}' but got '${this.head()}'.}`)
}

// Արտահայտությունների վերլուծությունը
Parser.prototype.expression = function () {
  // բուլյան հաստատուն
  if (this.have('BOOL')) {
    const vl = this.next()
    return { kind: 'BOOL', value: vl === 'TRUE' }
  }

  // իրական թիվ
  if (this.have('REAL')) {
    const vl = this.next()
    return { kind: 'REAL', value: parseFloat(vl) }
  }

  // փոփոխական (անուն)
  if (this.have('IDENT')) {
    const nm = this.next()
    return { kind: 'VAR', name: nm }
  }

  // ցուցակ
  if (this.have('[')) {
    const cs = []
    this.next()
    while (!this.have(']')) {
      cs.push(this.expression())
    }
    this.match(']')
    return { kind: 'LIST', items: cs }
  }

  // խմբավորման փակագծեր
  if (this.have('(')) {
    this.next()
    const ex = this.expression()
    this.match(')')
    return ex
  }

  // ներդրված գործողություն
  if (this.have('OPER')) {
    const op = this.next()
    const args = [this.expression()]
    while (this.have(this.exprFirst)) { args.push(this.expression()) }
    return { kind: 'BUILTIN', operation: op, arguments: args }
  }

  // պայման
  if (this.have('IF')) {
    this.next()
    const co = this.expression()
    this.match('THEN')
    const de = this.expression()
    this.match('ELSE')
    const al = this.expression()
    return { kind: 'IF', condition: co, decision: de, alternative: al }
  }

  // անանուն ֆունկցիա
  if (this.have('LAMBDA')) {
    this.next()
    const ps = [this.match('IDENT')]
    while (this.have('IDENT')) { ps.push(this.next()) }
    this.match(':')
    const by = this.expression()
    return { kind: 'LAMBDA', parameters: ps, body: by, captures: {} }
  }

  // ֆունկցիայի կիրառում
  if (this.have('APPLY')) {
    this.next()
    const fn = this.expression()
    this.match('TO')
    const args = [this.expression()]
    while (this.have(this.exprFirst)) { args.push(this.expression()) }
    return { kind: 'APPLY', callee: fn, arguments: args }
  }

  // կապերի ստեղծում
  if (this.have('LET')) {
    this.next()
    let nm = this.match('IDENT')
    this.match('IS')
    let vl = this.expression()
    const nvs = [{ name: nm, value: vl }]
    while (this.have('AND')) {
      this.next()
      nm = this.match('IDENT')
      this.match('IS')
      vl = this.expression()
      nvs.push({ name: nm, value: vl })
    }
    this.match('IN')
    const dy = this.expression()
    return { kind: 'LET', bindings: nvs, body: dy }
  }

  throw new Error(`Syntax error. Expression cannot start with '${this.head()}'.`)
}

// ծրագրի տեքստի վերլուծություն
Parser.prototype.parse = function (text) {
  this.lexemes = this.scanAll(text)
  return this.expression()
}

export { Parser }
