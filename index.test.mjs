import { runts } from './index.mjs'

runts('test.ts', async () => {
  console.log('wow')
  const result = await runts('echo "hello"')
  console.log(result)
})

console.log('end of test file')
