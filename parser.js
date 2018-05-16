
///
var parse = function(text) {
    parseProgram()
}

///
var parseProgram = function() {
    while( have('SUB') ) {
        parseSubroutine()
        newLines()
    }
}

///
var parseSubroutine = function() {
    match('SUB')
    let name = match('IDENT')
    let params = []
    if( have('(') ) {
        next()
        if( have('IDENT') ) {
            params.append(match('IDENT'))
            while( have(',') ) {
                next(',')
                params.append(match('IDENT'))
            }
        }
        match(')')
    }
    match('END')
    match('SUB')

    return new Subroutine(name, params, null)
}

var parseSequence = function() {
    newLines()
    let sequ = new Sequence()
    while( true ) {
        let stat = null;
        if( have('LET') )
            stat = parseLet()
        else if( have('INPUT') )
            stat = parseInput()
        if( have('PRINT') )
            stat = parsePrint()
        newLines()
        
        if( stat != null )
            sequ.items.append(stat)
    }
    return sequ
}
