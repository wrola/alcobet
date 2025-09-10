const { workspaceRoot } = require('@nx/devkit');

module.exports = {
  displayName: {
    name: 'ALCOBET',
    color: 'magentaBright',
  },
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: `${workspaceRoot}/coverage`,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.(t|j)s',
    '!<rootDir>/src/**/*.spec.(t|j)s',
    '!<rootDir>/src/**/*.test.(t|j)s',
    '!<rootDir>/src/**/*.(test|spec).ts',
  ],
  coverageReporters: ['html', 'lcov', 'text-summary'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(t|j)s?(x)',
    '<rootDir>/src/**/?(*.)(spec|test).(t|j)s?(x)',
  ],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
};