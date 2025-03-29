module.exports = {
  launch: {
    headless: false,
    args: [
      '--disable-extensions-except=./dist',
      '--load-extension=./dist',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ],
    defaultViewport: null
  },
  preset: "jest-puppeteer",
  testMatch: ["**/tests/puppeteer/**/*.test.js"],
  setupFilesAfterEnv: ["./tests/setup.js"]
};