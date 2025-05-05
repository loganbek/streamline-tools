module.exports = {
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
          '<rootDir>/tests/__mocks__/fileMock.js'
      },
      transform: {
        '^.+\\.jsx?$': ['babel-jest', { 
          configFile: './babel.config.js'
        }]
      },
      globals: {
        __EXTENSION_ID__: 'test-extension-id'
      },
      // Shorter timeout for unit tests (using the correct option name)
      testTimeout: 30000
    },
    {
      displayName: 'puppeteer',
      testMatch: ['<rootDir>/tests/puppeteer/**/*.test.js'],
      testEnvironment: 'jest-environment-puppeteer',
      setupFilesAfterEnv: ['expect-puppeteer', '<rootDir>/tests/setup.js'],
      globalSetup: 'jest-environment-puppeteer/setup',
      globalTeardown: 'jest-environment-puppeteer/teardown',
      testEnvironmentOptions: {
        url: 'http://localhost',
        // Explicitly set to reuse the same browser instance
        browserContext: 'default'
      },
      // Reduced timeout for Puppeteer tests to fail faster (using the correct option name)
      testTimeout: 60000
    }
  ],
  // Limit workers to prevent spawning multiple browsers
  maxWorkers: 1,
  // Setting global timeout correctly
  testTimeout: 60000,
  // Add reporter configuration
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Test Report',
      outputPath: './test-report.html',
      includeFailureMsg: true,
      includeSuiteFailure: true
    }]
  ],
  // Add retry logic for flaky tests
  retryTimes: 1
}
