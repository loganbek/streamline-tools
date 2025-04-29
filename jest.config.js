module.exports = {
  preset: 'jest-puppeteer',
  verbose: true,
  testTimeout: 60000,
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'jsx'],
  testPathIgnorePatterns: [
    '/node_modules/',
    'tests/puppeteer/commerceAction.*',
    'tests/puppeteer/document.*',
    'tests/puppeteer/interfaces.*',
    'tests/puppeteer/headerFooter.*',
    'tests/puppeteer/styleSheet.*'
  ],
  setupFilesAfterEnv: ['./tests/setup.js'],
  testMatch: [
    '**/tests/puppeteer/extension.test.js',
    '**/tests/puppeteer/config*.test.js'
  ],
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 
      '<rootDir>/tests/__mocks__/fileMock.js'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**'
  ]
};
