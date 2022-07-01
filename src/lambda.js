'use strict'

import { Parser } from './parser.js'
import { evaluate } from './evaluate.js'

import { createInterface } from 'readline'
import { existsSync, readFileSync } from 'fs'

///
const evalSource = function (source) {
  const pr = new Parser()
  const ast = pr.parse(source)
  return evaluate(ast, {})
}

///
const repl = function () {
  const rr = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'λάμδα> ',
    terminal: false
  })

  rr.prompt()

  rr.on('line', (line) => {
    if (line === '///') {
      rr.close()
      return
    }

    console.info(evalSource(line))
    rr.prompt()
  })
    .on('close', () => {
      console.info('αντίο')
      process.exit(0)
    })
}

///
const evalFile = function (path) {
  if (!existsSync(path)) return

  const prog = readFileSync(path, { encoding: 'utf-8' })
  console.info(evalSource(prog))
}

///
if (process.argv.length > 2) {
  evalFile(process.argv[2])
} else {
  repl()
}
