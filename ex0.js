
var vals = [6, 5, 4, 3, 2, 1]

var v0 = vals.map( x => x * x )
console.log(v0)

var v1 = vals.reduce( (x, y) => x + y, 0 )
console.log(v1)

var v2 = vals.filter( e => !(e % 2 == 0) )
console.log(v2)

var C = {}
for( let v of vals )
    C[v] = v * 2
console.log(C)

