

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

// (թոքեն, լեքսեմ) զույգերի ցուցակ
var lexemes = []
// ընթացիկ օգտագործվող տարր ինդեքսը
var index = 0;

// ստուգել ցուցակի ընթացիկ տարրը
var have = function(exp) {
    let head = lexemes[index].token

    if( exp instanceof Array )
        return exp.includes(head)

    return head == exp
}
// անցնել հաջորդին, և վերադարձնել նախորդի արժեքը
var next = function() {
    return lexemes[index++].value
}
// ստուգել և անցնել հաջորդին
var match = function(exp) {
    if( have(exp) )
        return next()
    throw 'Syntax error.'
}

// արտահայտությունը սկսող թոքենների ցուցակը. FIRST(expression)
const exprFirst = ['REAL', 'IDENT', '(', 'OPER', 'IF', 'LAMBDA', 'APPLY']

// Արտահայտությունների վերլուծությունը
var expression = function() {
    // իրական թիվ
    if( have('REAL') ) {
        let vl = next()
        return { kind: 'REAL', value: parseFloat(vl) }
    }

    // փոփոխական (անուն)
    if( have('IDENT') ) {
        let nm = next()
        return { kind: 'VAR', name: nm }
    }

    // խմբավորման փակագծեր
    if( have('(') ) {
        next()
        let ex = expression()
        match(')')
        return ex
    }

    // ներդրված գործողություն
    if( have('OPER') ) {
        let op = next()
        let args = [ expression() ]
        while( have(exprFirst) )
            args.push(expression())
        return { kind: 'BUILTIN', operation: op, arguments: args }
    }

    // պայման
    if( have('IF') ) {
        next()
        let co = expression()
        match('THEN')
        let de = expression()
        match('ELSE')
        let al = expression()
        return { kind: 'IF', condition: co, decision: de, alternative: al }
    }

    // անանուն ֆունկցիա
    if( have('LAMBDA') ) {
        next()
        let ps = [ match('IDENT') ]
        while( have('IDENT') )
            ps.push(next())
        match(':')
        let by = expression()
        return { kind: 'LAMBDA', parameters: ps, body: by, captures: {} }
    }

    // ֆունկցիայի կիրառում
    if( have('APPLY') ) {
        next()
        let fn = expression()
        match('TO')
        let args = [ expression() ]
        while( have(exprFirst) )
            args.push(expression())
        return { kind: 'APPLY', callee: fn, arguments: args }
    }

    throw 'Syntax error.'
}

// ծրագրի տեքստի վերլուծություն
var parse = function(text) {
    lexemes = scanAll(text)
    index = 0
    return expression()
}

module.exports.parse = parse
