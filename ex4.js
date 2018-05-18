
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

// a0 = ps.parse('if > a b then a else b')
// r0 = ev.evaluate(a0, {'a': 11, 'b': 22})

// a0 = ps.parse('lambda x z : + x y z')
// r0 = ev.evaluate(a0, {'y': 7})

a0 = ps.parse('apply lambda x y : + x y z to 1.1 2.2')
r0 = ev.evaluate(a0, {'z': 3.3})


console.log(a0)
console.log(r0)

