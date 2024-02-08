console.log('Hello, from module!')

export function testError(): never {
  throw new Error('Not implemented');
}
