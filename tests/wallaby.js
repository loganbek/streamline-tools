module.exports = function (wallaby) {
  return {
    files: [
      'src/**/*.js',
      'tests/setup.js',
      '!tests/**/*.test.js'
    ],
    tests: [
      'tests/**/*.test.js'
    ],
    env: {
      type: 'node',
      runner: 'node'
    },
    testFramework: 'jest',
    setup: function (wallaby) {
      const jestConfig = require('./package.json').jest || {};
      wallaby.testFramework.configure(jestConfig);
    }
  };
};