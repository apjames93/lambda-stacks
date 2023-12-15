import type { Config } from '@jest/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '.test.env' });

const config: Config.InitialOptions = {
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePathIgnorePatterns: ['dist'],
  setupFilesAfterEnv: ['<rootDir>/src/test-helpers/setupTests.ts'],
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 10000,
  testEnvironment: 'node',
};

export default config;
