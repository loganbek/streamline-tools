const path = require('path');

module.exports = {
  launch: {
    headless: 'new',
    defaultViewport: { width: 1920, height: 1080 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--enable-features=NetworkService',
      `--disable-extensions-except=${path.resolve(__dirname, 'src')}`,
      `--load-extension=${path.resolve(__dirname, 'src')}`
    ],
    pipe: true
  },
  browserContext: 'default',
  exitOnPageError: false
};