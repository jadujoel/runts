#!/usr/bin/env node

import { build } from 'esbuild'
import path from 'path'
import fs from 'fs'
import { SourceMapConsumer } from 'source-map';

const argv = process.argv
if (argv.length < 3) {
  console.error('Usage: runts script.ts')
  process.exit(1)
}

// remove the first argument so it doesn't get passed to the script
// in case it uses process.argv and expects the first argument to be something else
const [script] = argv.splice(2, 1)

const infile = path.resolve(script)

if (!fileExists(infile)) {
  console.error(`File not found: ${infile}`)
  process.exit(1)
}

console.log(`runts: ${script}`)

build({
  entryPoints: [infile],
  bundle: true,
  write: false,
  sourcemap: 'inline',
  metafile: true,
}).then(result => {
  const outputs = result.outputFiles
  result.errors.forEach(console.error)
  result.warnings.forEach(console.warn)
  if (outputs.length === 0) {
    console.error('No output files')
    process.exit(1)
  }
  if (outputs.length > 1) {
    console.error('More than one output file')
    process.exit(1)
  }
  const text = outputs[0].text
  evalWithStackTrace(text).then(success => {
    if (!success) {
      process.exit(1)
    }
  })
})

/**
 * @param {string} text
 * @returns {boolean}
 */
async function evalWithStackTrace(text) {
  try {
    eval(text)
  } catch (error) {
    console.error(`Error: "${error.message}"`);
    await showStackTraceForError(error, text)
    return false
  }
  return true
}

/**
 * @param {Error} error - The error that was thrown
 * @param {string} text - The code that was executed
 */
async function showStackTraceForError(error, text) {
  // Parse the stack trace using a regular expression.
  // This regex is simplistic and might need adjustment for different environments.
  const stackLineColumnMatch = error.stack.match(/<anonymous>:(\d+):(\d+)/);
  if (!stackLineColumnMatch) {
    console.error("Could not parse line and column from stack trace.");
    return
  }
  const line = parseInt(stackLineColumnMatch[1], 10);
  const column = parseInt(stackLineColumnMatch[2], 10);

  // Extract the source map from the code.
  const match = text.match(/\/\/# sourceMappingURL=data:application\/json;base64,([\s\S]*)$/);
  if (!match) {
    console.error("Source map not found or could not be extracted.");
    return
  }
  const sourceMapString = Buffer.from(match[1], 'base64').toString('utf-8');
  const sourceMap = JSON.parse(sourceMapString);
  await SourceMapConsumer.with(sourceMap, null, consumer => {
    const pos = consumer.originalPositionFor({ line, column });
    // Assuming `pos.source` is a relative path from the project root
    const here = path.resolve()
    const ap = path.resolve(here, pos.source);
    console.error(`@ ${ap}:${pos.line}:${pos.column}`);
  });
}

/**
 * @param {string} file
 * @returns {boolean}
 */
function fileExists(file) {
  try {
    fs.accessSync(file)
    return true
  }
  catch (e) {
    return false
  }
}
