const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests/playwright',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Record video on failure */
    video: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Configure viewport */
    viewport: { width: 1280, height: 800 },
    
    /* Configure browser context */
    ignoreHTTPSErrors: true,
    
    /* Set timeout for actions */
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium-extension',
      use: { 
        ...devices['Desktop Chrome'],
        // Configure browser for extension testing
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--enable-features=NetworkService',
            `--disable-extensions-except=${path.resolve(__dirname, 'src')}`,
            `--load-extension=${path.resolve(__dirname, 'src')}`,
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-background-timer-throttling',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection'
          ],
          // Keep browser open for debugging if needed
          headless: process.env.HEADLESS !== 'false',
          // Set viewport
          defaultViewport: null,
          // Chrome-specific devtools
          devtools: process.env.DEBUG_TESTS === 'true'
        },
        // Configure context for extension testing
        contextOptions: {
          // Permissions for extension
          permissions: ['storage', 'activeTab', 'tabs'],
          // Ignore certificate errors
          ignoreHTTPSErrors: true
        }
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
  
  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/playwright/global-setup.js'),
  globalTeardown: require.resolve('./tests/playwright/global-teardown.js'),
  
  /* Test timeout */
  timeout: 120000,
  expect: {
    timeout: 30000
  }
});