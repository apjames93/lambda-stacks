const esbuild = require('esbuild');
const glob = require('glob');

// import esbuild from 'esbuild';
// import glob from 'glob';

// Define options to ignore test files
const options = { ignore: ['./src/**/tests/**', './src/**/**.test.ts'] };

// Glob patterns to select TypeScript files
const lambdasEntryPoints = glob.sync('./src/lambdas/**/*.ts', options);
const utilEntryPoints = glob.sync('./src/utils/**/*.ts', options);

// Build configuration
esbuild
  .build({
    entryPoints: [...lambdasEntryPoints, ...utilEntryPoints],
    bundle: true,
    minify: true,
    sourcemap: true,
    outdir: './dist',
    platform: 'node',
  })
  .catch(() => process.exit(1));
