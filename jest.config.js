/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  // ← Load .env.test before any test file runs
  setupFiles: ['<rootDir>/tests/setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
    },
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/utils/seed.ts',
  ],
  coverageDirectory: 'coverage',
};