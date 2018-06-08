
var ps = require('./parser')

const test0 = `
let f is lambda x : * x x
and h is lambda x : + x x x
in + (apply f to 2) (apply h to 3)
`

const test1 = `
let f is lambda x : * x x
in + (apply f to 2)
`


let ast0 = (new ps.Parser()).parse(test0)
console.log(ast0)

let ast1 = (new ps.Parser()).parse(test1)
console.log(ast1)
