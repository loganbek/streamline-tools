const path = require('path');

module.exports = {
  launch: {
    // Run in windowed mode by default for extension testing
    headless: false,
    // Keep devtools option for explicit debugging sessions
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
    // Slightly increase slowMo for better visual tracking
    slowMo: 100 // Increased from 50
  },
  // Use default context
  browserContext: 'default',
  exitOnPageError: false
  // connect block removed to fix globalSetup error
};