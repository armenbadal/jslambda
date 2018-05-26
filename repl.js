
var ps = require('./parser')
var ev = require('./evaluate')

var rl = require('readline')

var rr = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function repl() {
    rr.on('line', function (cmd) {
        console.log('You just typed: '+ cmd);
        if( cmd == 'end' ) {
            console.info('Bye')
            rr.close()
        }
        else {
            console.info(ev.evaluate(ps.parse(cmd), {}))
        }
    });
}

repl()
