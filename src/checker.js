
const ast = require('./ast')

ast.Real.prototype.check = function() {
    return this.type
}

ast.Text.prototype.check = function() {
    return this.type
}

ast.Variable.prototype.check = function() {
    return this.type
}

ast.Unary.prototype.check = function() {
    let sc = this.subexpr.check()

    if( sc != 'R' )
        throw 'Type error.'

    this.type = 'R'
    return this.type
}

ast.Binary.prototype.check = function() {
    let sco = this.left.check()
    let sci = this.right.check()

    if( this.operation == '&' ) {
        if( sco != 'T' || sci != 'T' )
            throw 'Type error.'
        this.type = 'T'
    }
    else if( ['=', '<>', '>', '>=', '<', '<='].includes(this.operation) ) {
        if( sco != sci )
            throw 'Type error.'
        this.type = 'R'
    }
    else if( ['+', '-', '*', '/', '^', 'AND', 'OR'].includes(this.operation) ) {
        if( sco != 'R' || sci != 'R' )
            throw 'Type error.'
        this.type = 'R'
    }

    return this.type
}

ast.Apply.prototype.check = function() {
    this.args.forEach( ex => ex.check() )
    this.type = this.callee.name.endsWith('$') ? 'T' : 'R'
    return this.type
}

ast.If.prototype.check = function() {
    let sc = this.condition.check()
    if( sc != 'R' )
        throw 'Type error.'

    let dc = this.decision.check()
    let ac = this.alternative.check()
    if( dc != ac )
        throw 'Type error.'
        
    this.type = dc
    return this.type
}

ast.Lambda.prototype.check = function() {
    return this.type
}
