
const keywords = ['if', 'then', 'else', 'lambda', 'apply', 'to']

var scanOne = function(text) {
    // check end of source
    if( text == '' ) {
        return { token: 'EOS', value:'EOS', rest: '' }
    }

    // skip comments
    let mc = /^[ \n\t\r]+/.exec(text)
    if( mc != null ) {
        return scanOne(text.substring(mc[0].length))
    }

    // keywords and identifiers
    mc = /^[a-zA-z][0-9a-zA-z]*/.exec(text)
    if( mc != null ) {
        return {
            token: keywords.includes(mc[0]) ? mc[0].toUpperCase() : 'IDENT',
            value: mc[0],
            rest: text.substring(mc[0].length)
        }
    }

    // real numbers
    mc = /^[0-9]+(\.[0-9]+)?/.exec(text)
    if( mc != null ) {
        return {
            token: 'REAL',
            value: mc[0],
            rest: text.substring(mc[0].length)
        }
    }

    // metasymbols
    mc = /^(\(|\)|:)/.exec(text)
    if( mc != null ) {
        return {
            token: mc[0],
            value: mc[0],
            rest: text.substring(mc[0].length)
        }
    }
    
    // operators
    mc = /^(\+|\-|\*|\/|=|<>|>|>=|<|<=)/.exec(text)
    if( mc != null ) {
        return {
            token: 'OPER',
            value: mc[0],
            rest: text.substring(mc[0].length)
        }
    }

    return { token: 'UNKNOWN', value: text[0], rest: text }
}

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

var lexemes = []
var index = 0;

var have = function(exp) {
    let head = lexemes[index].token
    
    if( exp instanceof Array )
        return exp.includes(head)
    
    return head == exp
}
var next = function() {
    return lexemes[index++].value
}
var match = function(exp) {
    if( have(exp) )
        return next()
    throw 'Syntax error.'
}

var parse = function(text) {
    lexemes = scanAll(text)
    return expression()
}

const exprFirst = ['REAL', 'IDENT', '(', 'OPER', 'IF', 'LAMBDA', 'APPLY']

var expression = function() {
    if( have('REAL') ) {
        let vl = next()
        return { kind: 'REAL', value: vl }
    }

    if( have('IDENT') ) {
        let nm = next()
        return { kind: 'VAR', name: nm }
    }

    if( have('(') ) {
        next()
        let ex = expression()
        match(')')
        return ex
    }

    if( have('OPER') ) {
        let op = next()
        let args = [ expression() ]
        while( have(exprFirst) )
            args.push(expression())
        return { kind: 'MATH', oper: op, argums: args }
    }

    if( have('IF') ) {
        next('IF')
        let co = expression()
        match('THEN')
        let de = expression()
        match('ELSE')
        let al = expression()
        return { kind: 'IF', cond: co, deci: de, alte: al }
    }

    if( have('LAMBDA') ) {
        next('LAMBDA')
        let ps = [match('IDENT')]
        while( have('IDENT') )
            ps.push(next())
        match(':')
        let by = expression()
        return { kind: 'LAMBDA', params: ps, body: by}
    }

    if( have('APPLY') ) {
        next()
        let fn = expression()
        match('TO')
        let args = [ expression() ]
        while( have(exprFirst) )
            args.push(expression())
        return { kind: 'APPLY', func: fn, argus: args }
    }
    
    throw 'Syntax error.'
}

let a0 = null

// a0 = parse('3.14')
// console.log(a0)

// a0 = parse('x')
// console.log(a0)

// a0 = parse('( 7.0 )')
// console.log(a0)

// a0 = parse('* a b c d 1 2.3 4.0')
// console.log(a0)

// a0 = parse('(/ a (+ b c d) (- 1 2.3 4.0))')
// console.log(a0)

// a0 = parse('if + a b then a else b')
// console.log(a0)

// a0 = parse('lambda x y z : + x (* y z)')
// console.log(a0)

a0 = parse('apply lambda x y : + x y to 3.14 2.18')
console.log(a0)



