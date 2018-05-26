
var ps = require('./parser')
var ev = require('./evaluate')

//
var evalAndTest = function(prog, env, exp) {
    try {
        let ast = ps.parse(prog)
        if( exp == null ) {
            console.info('PASS')
            return true
        }
        let vl = ev.evaluate(ast, env)
        if( vl === exp ) {
            console.info('PASS')
        }
        else {
            console.info('FAIL')
            console.info(`|  For program '${prog}' expected value ${exp}, but evaluated ${vl}`)
        }
    }
    catch( ex ) {
        console.error(ex)
        return false
    }

    return true
}

//
const allTestCases = [
    {
        prog: '3.14',
        env: { },
        exp: 3.14
    },
    {
        prog: 'x',
        env: { 'x' : 1.0 },
        exp: 1.0
    }
]

allTestCases.forEach( cs => evalAndTest(cs.prog, cs.env, cs.exp) )

// evalAndTest('3.14', {}, 3.14)
// evalAndTest('x', {'x': 234}, 234)
// evalAndTest('( 7.0 )', {}, 7.0)
// evalAndTest('+ a b c d 1 2.3 4.0', {'a': 1, 'b': 2, 'c': 3, 'd': 4}, 17.3)
// evalAndTest('(+ a (+ b c d) (- 1 2.3 4.0))', {'a': 1, 'b': 2, 'c': 3, 'd': 4}, 4.7)
// evalAndTest('if > a b then a else b', {'a': 11, 'b': 22}, 22)
// evalAndTest('lambda x z : + x y z', {'y': 7}, null)
// evalAndTest('apply lambda x y : + x y z to 1.1 2.2', {'z': 3.3}, 6.6)

let r0 = ev.evaluate(ps.parse('apply apply lambda x : lambda y : + x y to 7.2 to 1'), {})
console.log(r0)
