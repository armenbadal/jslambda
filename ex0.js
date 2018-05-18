
var vals = [1, 2, 3, 4, 5, 6]

var v0 = vals.map( x => x * x )
console.log(v0)

var v1 = vals.reduce( (x, y) => x + y, 0 )
console.log(v1)

