
const ps = require('./parser')
const ev = require('./evaluate')

const rl = require('readline')
const fs = require('fs')

///
const evalSource = function(source) {
    let parser = new ps.Parser()
    return ev.evaluate(parser.parse(source), {})
}

///
const repl = function() {
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
    })
    .on('close', () => {
        console.info('αντίο')
        process.exit(0)
    });
}

///
const evalFile = function(path) {
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
