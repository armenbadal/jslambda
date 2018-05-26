
var ps = require('./parser')
var ev = require('./evaluate')

var rl = require('readline')

///
var repl = function() {
    var rr = rl.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'λάμδα> ',
        terminal: false
    });

    rr.prompt()

    rr.on('line', (line) => {
        if( line == 'end' ) {
            rr.close()
            return
        }

        console.info(ev.evaluate(ps.parse(line), {}))
        rr.prompt()
    }).on('close', () => {
        console.info('Bye')
        process.exit(0)
    });
}

/// start repl
repl()
