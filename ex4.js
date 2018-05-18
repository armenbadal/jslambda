
var ps = require('./parser')
var ev = require('./evaluate')

let a0 = null
let r0 = null

// a0 = ps.parse('3.14')
// r0 = ev.evaluate(a0, {})

// a0 = ps.parse('x')
// r0 = ev.evaluate(a0, {'x': 234})

// a0 = ps.parse('( 7.0 )')
// r0 = ev.evaluate(a0, {'x': 234})

// a0 = ps.parse('+ a b c d 1 2.3 4.0')
// r0 = ev.evaluate(a0, {'a': 1, 'b': 2, 'c': 3, 'd': 4})

// a0 = ps.parse('(/ a (+ b c d) (- 1 2.3 4.0))')
// r0 = ev.evaluate(a0, {'a': 1, 'b': 2, 'c': 3, 'd': 4})

a0 = ps.parse('if > a b then a else b')
r0 = ev.evaluate(a0, {'a': 11, 'b': 22})

// a0 = ps.parse('lambda x y z : + x (* y z)')

// a0 = ps.parse('apply lambda x y : + x y to 3.14 2.18')



console.log(a0)
console.log(r0)

