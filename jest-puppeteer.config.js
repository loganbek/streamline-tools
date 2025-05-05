const path = require('path');

module.exports = {
  launch: {
    // Use headless mode for CI and false for interactive debugging
    headless: process.env.CI === 'true',
    devtools: process.env.DEBUG_TESTS === 'true',
    defaultViewport: { width: 1280, height: 800 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      // Load the extension
      `--disable-extensions-except=${path.resolve(__dirname, 'src')}`,
      `--load-extension=${path.resolve(__dirname, 'src')}`
    ],
    // Increase timeout for better stability with extensions
    timeout: 60000,
    slowMo: 50
  },
  // Use default context
  browserContext: 'default',
  exitOnPageError: false,
  // Add connection timeout
  connect: {
    timeout: 60000,
    slowMo: 100
  }
};