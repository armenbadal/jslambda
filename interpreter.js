
var ast = require('./ast')

ast.Real.prototype.evaluate = function(env) {
    return this.value
}

ast.Text.prototype.evaluate = function(env) {
    return this.value
}

ast.Variable.prototype.evaluate = function(env) {
    return env[this.name]
}

// unary
ast.Unary.prototype.evaluate = function(env) {
}

// binary
ast.Binary.prototype.evaluate = function(env) {
}

// apply
ast.Apply.prototype.evaluate = function(env) {
}

// if
ast.If.prototype.evaluate = function(env) {
    let cov = this.condition.evaluate(env)
    if( cov != 0.0 ) 
        return this.decision.evaluate(env)
    return this.alternative.evaluate(env)
}

// lambda
ast.Lambda.prototype.evaluate = function(env) {
    // TODO
}
