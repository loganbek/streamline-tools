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

  // Try to get the extension ID with retries
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const targets = await global.browser.targets();
    const extensionTarget = targets.find(target => 
      (target.type() === 'background_page' || target.type() === 'service_worker') && 
      target.url().startsWith('chrome-extension://')
    );
    
    if (extensionTarget) {
      const extensionUrl = extensionTarget.url();
      const [, , extensionId] = extensionUrl.split('/');
      return extensionId;
    }
    
    // Wait with exponential backoff
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
    attempts++;
  }
  
  throw new Error('Extension background page or service worker not found after ' + maxAttempts + ' attempts');
}