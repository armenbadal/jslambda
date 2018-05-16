
var Expression = function(type) {
    this.type = type
}

var Real = function(value) {
    Expression.call(this, 'R')
    this.value = value
}

var Text = function(value) {
    Expression.call(this, 'T')
    this.value = value
}

var Variable = function(name) {
    Expression.call(this, name.endsWith('$') ? 'T' : 'R')
    this.name = name
}

var Unary = function(oper, se) {
    Expression.call(this, '?')
    this.operation = oper
    this.subexpr = se
}

var Binary = function(oper, seo, sei) {
    Expression.call(this, '?')
    this.operation = oper
    this.left = seo
    this.right = sei
}

var Apply = function(callee, args) {
    Expression.call(this, '?')
    this.callee = callee
    this.args = args
}

var If = function(condition, decision, alternative) {
    Expression.call(this, '?')
    this.condition = condition
    this.decision = decision
    this.alternative = alternative
}


module.exports.Expression = Expression
module.exports.Real = Real
module.exports.Text = Text
module.exports.Variable = Variable
module.exports.Unary = Unary
module.exports.Binary = Binary
module.exports.Apply = Apply
module.exports.If = If
