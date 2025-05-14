/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts'],
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/index.ts',
      '!src/config/**/*.ts',
      '!src/**/*.interface.ts',
      '!src/**/*.dto.ts'
    ],
	verbose: true,
};
