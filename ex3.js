
var ast = require('./ast')
var interpreter = require('./interpreter')
var checker = require('./checker')

var r0 = new ast.Real(3.14)
var t0 = new ast.Text('Ok')
var v0 = new ast.Variable('x')
var v1 = new ast.Variable('y$')
var u0 = new ast.Unary('-', new ast.Real('4.2'))
var b0 = new ast.Binary('*', new ast.Real('1.3'), new ast.Variable('k'))


console.log(r0)
console.log(r0.evaluate({}))

console.log(t0)
console.log(t0.evaluate({}))

console.log(v0)
console.log(v0.evaluate({'x':123.456}))

console.log(v1)
console.log(v1.evaluate({'x':123.456, 'y$':'Բարև'}))

u0.check()
console.log(u0)

b0.check()
console.log(b0)
