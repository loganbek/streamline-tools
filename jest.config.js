module.exports = {
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: [
        '<rootDir>/tests/setup.js',
        '<rootDir>/tests/setJestTimeout.js' // Will set timeout via code
      ],
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
      }
    },
    {
      displayName: 'puppeteer',
      testMatch: ['<rootDir>/tests/puppeteer/**/*.test.js'],
      testEnvironment: 'jest-environment-puppeteer',
      setupFilesAfterEnv: [
        'expect-puppeteer', 
        '<rootDir>/tests/setup.js',
        '<rootDir>/tests/setJestTimeout.js' // Will set timeout via code
      ],
      globalSetup: 'jest-environment-puppeteer/setup',
      globalTeardown: 'jest-environment-puppeteer/teardown',
      testEnvironmentOptions: {
        url: 'http://localhost',
        // Explicitly set to reuse the same browser instance
        browserContext: 'default'
      }
    }
  ],
  // Limit workers to prevent spawning multiple browsers
  maxWorkers: 1,
  
  // Add reporter configuration
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Test Report',
      outputPath: './test-report.html',
      includeFailureMsg: true,
      includeSuiteFailure: true
    }]
  ]
}
