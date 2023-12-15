const esbuild = require('esbuild');
const glob = require('glob');

// import esbuild from 'esbuild';
// import glob from 'glob';

// Define options to ignore test files
const options = { ignore: ['./src/**/tests/**', './src/**/**.test.ts'] };

// Glob patterns to select TypeScript files
const lambdasEntryPoints = glob.sync('./src/lambdas/**/*.ts', options);
const utilEntryPoints = glob.sync('./src/utils/**/*.ts', options);

const esbuildConfig = {
  entryPoints: [...lambdasEntryPoints, ...utilEntryPoints],
  format: 'esm', // Output format
  minify: true, // Whether to minify the bundled output code
  outExtension: { '.js': '.mjs' }, // Customize file extension
  target: 'es2020', // Target ECMAScript version
  sourcemap: true, // Whether the bundler produces a source map file
  sourcesContent: true, // Include source code in the source map file
  bundle: true, // Bundle all dependencies into a single file
  external: [], // List of packages to omit from the build
  loader: {}, // List of configurations for loading data for a given file type
  mainFields: ['main', 'module'], // Package.json fields to try to import
  outdir: './dist',
  platform: 'node',
};

// Build configuration
esbuild.build(esbuildConfig).catch(() => process.exit(1));
