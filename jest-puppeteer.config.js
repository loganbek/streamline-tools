const path = require('path');

module.exports = {
  launch: {
    dumpio: false, // Reduce console noise
    headless: false,
    slowMo: 250, // Increased delay between actions for stability
    timeout: 60000, // Doubled timeout for slower machines
    ignoreHTTPSErrors: true, // Handle any HTTPS issues
    args: [
      `--disable-extensions-except=${path.resolve(__dirname, 'src')}`,
      `--load-extension=${path.resolve(__dirname, 'src')}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process', // Help with extension frame handling
    ],
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  },
  browser: 'chromium',
  browserContext: 'default',
  exitOnPageError: false // Prevent premature exit on page errors
};