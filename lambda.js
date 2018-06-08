
var ps = require('./parser')
var ev = require('./evaluate')

var rl = require('readline')
var fs = require('fs')

///
var evalSource = function(source) {
    let parser = new ps.Parser()
    return ev.evaluate(parser.parse(source), {})
}

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
        if( line == '///' ) {
            rr.close()
            return
        }

        console.info(evalSource(line))
        rr.prompt()
    }).on('close', () => {
        console.info('αντίο')
        process.exit(0)
    });
}

///
var evalFile = function(path) {
  if( !fs.existsSync(path) ) return;

  let prog = fs.readFileSync(path, {encoding: 'utf-8'})
  console.info(evalSource(prog))
}


///
if( process.argv.length > 2 ) {
    evalFile(process.argv[2])
}
else {
    repl()
}
