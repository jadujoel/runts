import { testError } from './test.module'
console.log('Hello, from test!')
console.log('Process argvs:', process.argv.join(' '))
console.log(testError())
