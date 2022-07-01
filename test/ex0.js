
import { Parser } from '../src/parser.js'
import { evaluate } from '../src/evaluate.js'

const print = function (oj) {
    console.log(JSON.stringify(oj, null, 2))
}

const test0 = `
let f is lambda x : * x x
and h is lambda x : + x x x
in + (apply f to 2) (apply h to 3)
`

const test1 = `
let f is lambda x : * x x
in + (apply f to 2)
`

const test2 = `
[1 pi [3 ok 5] 6 [] 7]
`

const test3 = `
head [3 2 1]
`

// let ast0 = (new ps.Parser()).parse(test0)
// console.log(ast0)

// let ast1 = (new ps.Parser()).parse(test1)
// console.log(ast1)

// let ast2 = (new ps.Parser()).parse(test2)
// console.log(ast2)

let ast3 = (new Parser()).parse(test3)
print(ast3)
let res3 = evaluate(ast3, {})
print(res3)
