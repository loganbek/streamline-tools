module.exports = {
  verbose: true,
  testTimeout: 60000,
  maxConcurrency: 1, // Run tests sequentially
  maxWorkers: 1, // Use single worker
  testSequencer: './tests/testSequencer.js',
  setupFilesAfterEnv: ['./tests/setup.js'],
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  moduleFileExtensions: ['js', 'jsx'],
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/puppeteer/**/*.test.js'
  ],
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/manifest.json',
    '!src/hot-reload.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage',
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: ['**/tests/unit/**/*.test.js'],
      testEnvironment: 'jsdom'
    },
    {
      displayName: 'Puppeteer Tests',
      testMatch: ['**/tests/puppeteer/**/*.test.js'],
      testEnvironment: 'node',
      preset: 'jest-puppeteer'
    }
  ]
};
