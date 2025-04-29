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
      '--disable-features=IsolateOrigins,site-per-process'
    ],
    slowMo: 250 // Add delay between actions to improve stability
  },
  browserContext: 'default',
  exitOnPageError: false
};