/**
 * Playwright setup for Jest integration
 * This file provides compatibility between Jest test runner and Playwright tests
 */

const { chromium } = require('playwright');
const path = require('path');

// Global setup for Playwright within Jest
beforeAll(async () => {
  console.log('Setting up Playwright environment...');
  
  // Load environment variables
  require('dotenv').config({ path: path.join(__dirname, '.env') });
  
  // Set test timeout
  jest.setTimeout(120000);
});

afterAll(async () => {
  console.log('Cleaning up Playwright environment...');
});

// Export helper functions for Jest-Playwright integration
global.playwrightUtils = {
  /**
   * Launch browser with extension support
   */
  async launchBrowserWithExtension() {
    const extensionPath = path.resolve(__dirname, '../src');
    
    const browser = await chromium.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--enable-features=NetworkService',
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-background-timer-throttling',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection'
      ],
      devtools: process.env.DEBUG_TESTS === 'true'
    });
    
    return browser;
  },

  /**
   * Create context with extension permissions
   */
  async createExtensionContext(browser) {
    const context = await browser.newContext({
      permissions: ['storage', 'activeTab', 'tabs'],
      ignoreHTTPSErrors: true,
      viewport: { width: 1280, height: 800 }
    });
    
    return context;
  }
};

module.exports = {};