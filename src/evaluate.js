
// flatten array of arrays
const flatten = function(arrs) {
    let res = []
    for( let el of arrs )
        res = res.concat(el)
    return res
}

// Ազատ փոփոխականների որոշումը
const freeVariables = function(expr) {
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

    // x փոփոխականն ազատ է LET արտահայտության մեջ, եթե այն 
    // ազատ է մարմնում և LET-ի փոփոխականներից որևէ մեկը չէ
    if( expr.kind == 'LET' ) {
        let pvs = []
        let fvs = []
        for( let ve of expr.bindings ) {
            pvs.push(ve.name)
            fvs.concat(freeVariables(ve.value))
        }

        let bvs = freeVariables(expr.body).filter(e => !pvs.includes(e))
        return fvs.concat(bvs)
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

    '=':  (x, y) => x == y ? 1.0 : 0.0,
    '<>': (x, y) => x != y ? 1.0 : 0.0,
    '>':  (x, y) => x > y ? 1.0 : 0.0,
    '>=': (x, y) => x >= y ? 1.0 : 0.0,
    '<':  (x, y) => x < y ? 1.0 : 0.0,
    '<=': (x, y) => x <= y ? 1.0 : 0.0,

    '|': (x, y) => x || y,
    '&': (x, y) => x && y,

    'CONS': (x, y) => [x].concat(y),
    'HEAD': (x) => 'myau', //x[0],
    'TAIL': (x) => x.slice(1)
}

// արտահայտության հաշվարկումը
const evaluate = function(expr, env) {
    // թվի արժեքը ինքն է
    if( expr.kind == 'REAL' ) {
        return expr.value
    }

    // փոփոխականի արժեքը պետք է վերցնել
    // կատարման միջավայրից
    if( expr.kind == 'VAR' ) {
        return env[expr.name]
    }

    // ցուցակը որպես արժեք
    if( expr.kind == 'LIST' ) {
        return expr.items.map(e => evaluate(e, env))
    }

    // հաշվարկել արգումենտները, ապա գործողությունը
    // կրառել ստացված արժեքներին (վերանայե՛լ)
    if( expr.kind == 'BUILTIN' ) {
        //console.log(expr)
        let evags = expr.arguments.map(e => evaluate(e, env))
        console.log(evags)
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
        let nenv = Object.assign({}, env, clos.captures)
        let count = Math.min(clos.parameters.length, evags.length)
        for( let k = 0; k < count; ++k )
            nenv[clos.parameters[k]] = evags[k]
        // closure-ի մարմինը հաշվարկել նոր միջավայրում
        return evaluate(clos.body, nenv)
    }

    // կապերի ստեղծում
    if( expr.kind == 'LET' ) {
        let nenv = Object.create({}, env)
        for( let nv of expr.bindings ) {
            nenv[nv.name] = null
            let ev = evaluate(nv.value, nenv)
            if( typeof ev === 'object' && ev.kind == 'LAMBDA' ) {
                if( nv.name in ev.captures )
                    delete ev.captures[nv.name]
            }
            nenv[nv.name] = ev
        }
        return evaluate(expr.body, nenv)
    }

    return null
}


module.exports.evaluate = evaluate
