
//
var freeVariables = function(expr) {
    if( expr.kind == 'VAR' ) {
        return [expr.name]
    }
}

//
const builtins = {
    '+': (x, y) => x + y,
    '-': (x, y) => x - y,
    '*': (x, y) => x * y,
    '/': (x, y) => x / y,

    '=': (x, y) => x == y,
    '<>': (x, y) => x != y,
    '>': (x, y) => x > y,
    '>=': (x, y) => x >= y,
    '<': (x, y) => x < y,
    '<=': (x, y) => x <= y,

    'OR': (x, y) => x || y,
    'AND': (x, y) => x && y
}

//
var evaluate = function(expr, env) {
    if( expr.kind == 'REAL' ) {
        return expr.value
    }

    if( expr.kind == 'VAR' ) {
        return env[expr.name]
    }

    if( expr.kind == 'BUILTIN-OP' ) {
        let evag = expr.argums.map( e => evaluate(e, env) )
        return evag.reduce(builtins[expr.oper])
    }

    if( expr.kind == 'IF' ) {
        let co = evaluate(expr.cond, env)
        if( co !== 1.0 )
            return evaluate(expr.deci, env)
        return evaluate(expr.alte, env)
    }

    if( expr.kind == 'LAMBDA' ) {
        // 1. get free variables
        // 2. capture values of FV
        // 3. create new LAMBDA with capture (actually - closure)
        return null
    }

    if( expr.kinf == 'APPLY' ) {
        return null
    }
}


module.exports.evaluate = evaluate

