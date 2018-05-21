
// flatten array of arrays
var flatten = function(arrs) {
    let res = []
    for( let el of arrs )
        res = res.concat(el)
    return res
}

// Ազատ փոփոխականների որոշումը
var freeVariables = function(expr) {
    // փոփոխականն ինքն ի սկզբանե ազատ է
    if( expr.kind == 'VAR' ) {
        return [expr.name]
    }

    // ներդրված գործողություններում ազատ փոփոխականների
    // բազմությունը արգումենտների ազատ փոփոխականների
    // բազմությունների միավորումն է
    if( expr.kind == 'BUILTIN' ) {
        return flatten(expr.arguments.map(freeVariables))
    }

    // պայմանական արտահայտության մեջ էլ պայմանի ու
    // երկու ենթաարտահայտությունների ազատ փոփոխականների
    // բազմությունների միավորումն է
    if( expr.kind == 'IF' ) {
        let fvs = freeVariables(expr.condition)
        fvs = fvs.concat(freeVariables(expr.decision))
        fvs = fvs.concat(freeVariables(expr.alternative))
        return fvs
    }

    // աբստրակցիայի գործողությունըը միակն է, որ ստեղծում է
    // կապված փոփոխականներ; այստեղ ազատ փոփոխականների
    // բազմությունը ստացվում է մարմնի ազատ փոփոկականների
    // բազմությունից լամբդա արտահայտության պարամետրերը
    // հեռացնելով
    if( expr.kind == 'LAMBDA' ) {
        let fvs = freeVariables(expr.body)
        return fvs.filter(e => !expr.parameters.includes(e))
    }

    // կիրառման գործողության համար միավորվում են կիրառվող
    // ֆունկցիայի և արգումենտների ազատ փոփոխականների
    // բազմությունները
    if( expr.kind == 'APPLY' ) {
        let fvs = freeVariables(expr.callee)
        fvs.concat(flatten(expr.arguments.map(freeVariables)))
        return fvs
    }

    // ... այլ չդիտարկված դեպքերում արդյունքը
    // դատարկ բազմություն է
    return []
}

// ներդրված գործողությունների վարքը
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

// արտահայտության հաշվարկումը
var evaluate = function(expr, env) {
    // թվի արժեքը ինքն է
    if( expr.kind == 'REAL' ) {
        return expr.value
    }

    // փոփոխականի արժեքը պետք է վերցնել
    // կատարման միջավայրից
    if( expr.kind == 'VAR' ) {
        return env[expr.name]
    }

    // հաշվարկել արգումենտները, ապա գործողությունը
    // կրառել ստացված արժեքներին (վերանայե՛լ)
    if( expr.kind == 'BUILTIN' ) {
        let evags = expr.arguments.map(e => evaluate(e, env))
        return evags.reduce(builtins[expr.operation])
    }

    //
    if( expr.kind == 'IF' ) {
        let co = evaluate(expr.condition, env)
        if( co !== 0.0 )
            return evaluate(expr.decision, env)
        return evaluate(expr.alternative, env)
    }

    // լամբդայի հաշվարկման արդյունքում ստացվում է closure
    if( expr.kind == 'LAMBDA' ) {
        // լամբդա օբյեկտի պատճեն
        let clos = Object.assign({}, expr)
        // ազատ փոփոխականները
        let fvs = freeVariables(clos)
        // նոր միջավայրի կառուցում
        for( let v of fvs )
            clos.captures[v] = env[v]
        return clos
    }

    // closure-ի կիրառումը արգումենտներին
    if( expr.kind == 'APPLY' ) {
        // հաշվարկել կիրառելին
        let clos = evaluate(expr.callee, env)
        if( clos.kind != 'LAMBDA' )
            throw 'Evaluation error.'
        // հաշվարկել արգումենտները
        let evags = expr.arguments.map(e => evaluate(e, env))
        // կառուցել նոր միջավայր, որը closure-ի capture-ից
        // և closure-ի պարամետրերին կապված արգումենտներից
        let nenv = Object.assign({}, clos.captures)
        let count = Math.min(clos.parameters.length, evags.length)
        for( let k = 0; k < count; ++k )
            nenv[clos.parameters[k]] = evags[k]
        // closure-ի մարմինը հաշվարկել նոր միջավայրում
        return evaluate(clos.body, nenv)
    }
}


module.exports.evaluate = evaluate
