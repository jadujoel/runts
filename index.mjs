
// import the async version of exec
const { exec } = require('child_process')

/**
 * Run a TypeScript script using runts
 *
 * @param {string} script - path to script
 * @returns {Promise<string>}
 */
export function runts(script) {
  return new Promise((resolve, reject) => {
    exec(`npx runts ${script}`, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        resolve(stdout)
      }
    })
  })
}

export default runts
