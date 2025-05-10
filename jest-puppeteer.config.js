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
      `--load-extension=${path.resolve(__dirname, 'src')}`,
      // Add args to improve timeout handling
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      // Prevent hanging on network requests
      '--disable-features=IsolateOrigins,site-per-process',
      // Disable background throttling
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      // Disable browser level features that can cause hangs
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection'
    ],
    // Reduce timeout for better failure detection
    timeout: 30000,
    // Slightly increase slowMo for better visual tracking
    slowMo: 100,
    // Add proper browser closing behavior
    handleSIGINT: true,
    handleSIGTERM: true,
    handleSIGHUP: true,
    // Force kill Chrome if graceful close fails
    ignoreHTTPSErrors: true,
    dumpio: true // Output browser process stdout/stderr for debugging
  },
  // Use default context
  browserContext: 'default',
  exitOnPageError: false,
  // Set shorter overall timeout for puppeteer operations
  browserTimeout: 60000,
  // Add connection timeout
  connectOptions: {
    timeout: 30000
  },
  // Ensure we don't wait forever on browser connection
  browserConnectRetryCount: 3
};