# runts

When you want to run a typescript file directly like with ts-node, but you wanna go fast.
And you cant use bun since it's not exactly the same as node, or you're on windows and bun is not supported yet.

## Usage

```bash
npx esbuild-node file.ts
```

This will use esbuild on file.ts and then eval the resulting code using node.
The program will show the output of the file, and if there's an error, it will show the error and the line and column where it happened.
