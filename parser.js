
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

    // metasymbols and operators
    mc = /^(\(|\)|:|\+|\-|\*|\/|=|<>|>|>=|<|<=)/.exec(text)
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
    return res
}

var lexemes = []
var index = 0;

var next = function() {
    return lexemes[index++].value
}
var match = function(exp) {
    if( lexemes[index].token == exp )
        return next()
    throw 'Syntax error.'
}

var parse = function(text) {
    lexemes = scanAll(text)
    console.log(lexemes)
    return parseExpression()
}

const firstExpr = ['REAL', 'IDENT', '(', 'OPER', 'IF', 'LAMBDA', 'APPLY']

var parseExpression = function() {
    switch( lexemes[index].token ) {
        case 'REAL':
            break
        case 'IDENT':
            break
        case '(':
            break
        case 'OPER':
            break
        case 'if':
            break
        case 'lambda':
            break
        case 'apply':
            break
        default:
            break
    }
    return null;
}

// expression
//     : REAL
//     | IDENT
//     | '(' expression ')'
//     | OPER expression (',' expression)*
//     | 'if' expression 'then' expression 'else' expression
//     | 'lambda' IDENT (',' IDENT)* ':' expression
//     | 'apply' expression 'to' expression (',' expression)*
//     ;

parse('if + a b then a else b')
console.log(a0)
