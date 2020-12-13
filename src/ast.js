
const Expression = function(type) {
    this.type = type
}

const Real = function(value) {
    Expression.call(this, 'R')
    this.value = value
}

const Text = function(value) {
    Expression.call(this, 'T')
    this.value = value
}

const List = function(value) {
    Expression.call(this, 'L')
    this.value = value
}

const Variable = function(name) {
    Expression.call(this, name.endsWith('$') ? 'T' : 'R') // 
    this.name = name
}

const Unary = function(oper, se) {
    Expression.call(this, '?')
    this.operation = oper
    this.subexpr = se
}

const Binary = function(oper, seo, sei) {
    Expression.call(this, '?')
    this.operation = oper
    this.left = seo
    this.right = sei
}

const Apply = function(callee, args) {
    Expression.call(this, '?')
    this.callee = callee
    this.args = args
}

const If = function(condition, decision, alternative) {
    Expression.call(this, '?')
    this.condition = condition
    this.decision = decision
    this.alternative = alternative
}

const Lambda = function(params, body) {
    Expression.call(this, 'F')
    this.parameters = params
    this.body = body
}

module.exports = {
    Expression,
    Real,
    Text,
    List,
    Variable,
    Unary,
    Binary,
    Apply,
    If,
    Lambda
}
