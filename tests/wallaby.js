module.exports = function (wallaby) {
  return {
    files: [
      'src/**/*.js',
      'manifest.json',
      '!src/**/*.test.js'
    ],
    
    tests: [
      'src/**/*.test.js'
    ],
    
    env: {
      type: 'node',
      runner: 'node'
    },
    
    testFramework: 'jest',
    
    setup: function(wallaby) {
      const jestConfig = require('./package.json').jest;
      wallaby.testFramework.configure(jestConfig);
    },
    
    workers: {
      restart: true,
      initial: 1,
      regular: 1
    },
    
    // For Chrome extension testing
    bootstrap: async function() {
      // This will run once before all tests
      global.extensionId = await launchChromeWithExtension();
    },
    
    teardown: function() {
      // Clean up after tests
      if (global.browser) {
        return global.browser.close();
      }
    }
  };
};

async function launchChromeWithExtension() {
  const pathToExtension = require('path').join(__dirname, 'dist'); // Your built extension
  const puppeteer = require('puppeteer');

  global.browser = await puppeteer.launch({
    headless: false, // Run in non-headless mode
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      '--no-sandbox'
    ],
    slowMo: 50 // Slow down for visual debugging
  });

  // This part is tricky - we need to get the extension ID
  const targets = await global.browser.targets();
  const extensionTarget = targets.find(target => 
    target.type() === 'service_worker' && 
    target.url().startsWith('chrome-extension://')
  );
  
  const extensionUrl = extensionTarget.url();
  const [, , extensionId] = extensionUrl.split('/');
  
  return extensionId;
}