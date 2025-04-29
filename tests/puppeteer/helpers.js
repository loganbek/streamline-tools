const puppeteer = require('puppeteer');
const path = require('path');
const DebugUtils = require('../debugUtils');
require('dotenv').config({ path: './tests/.env' });

let sharedBrowser = null;
let sharedPage = null;
let isLoggedIn = false;
let browserCleanupRegistered = false;
let lastLoginTime = 0;
const LOGIN_COOLDOWN = 2000; // 2 second minimum between login attempts
const MAX_LOGIN_RETRIES = 3;

/**
 * Helper class to manage common test operations
 */
class TestHelper {
  constructor() {
    this.debugUtils = new DebugUtils();
  }

  /**
   * Initialize browser and page
   */
  async init() {
    await this.debugUtils.init();
    
    // Use or create shared browser instance
    if (!sharedBrowser) {
      sharedBrowser = await puppeteer.launch({
        headless: false,
        slowMo: parseInt(process.env.SLOWMO || '250'),
        args: [
          `--disable-extensions-except=${path.resolve(__dirname, '../../src')}`,
          `--load-extension=${path.resolve(__dirname, '../../src')}`,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
        ],
        defaultViewport: { 
          width: 1920, 
          height: 1080 
        }
      });
      
      // Create shared page
      sharedPage = await sharedBrowser.newPage();
      await this.setupPageDebug(sharedPage);

      // Register cleanup handler only once
      if (!browserCleanupRegistered) {
        process.on('exit', async () => {
          if (sharedBrowser) {
            await sharedBrowser.close();
            sharedBrowser = null;
            sharedPage = null;
            isLoggedIn = false;
          }
        });
        browserCleanupRegistered = true;
      }
    }
    
    // Use shared instances
    this.browser = sharedBrowser;
    this.page = sharedPage;
    
    // Login if not already logged in
    if (!isLoggedIn) {
      await this.login();
    }
  }

  /**
   * Sleep to respect rate limits
   * @param {number} ms - Milliseconds to sleep
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if enough time has passed since last login attempt
   */
  async waitForLoginCooldown() {
    const now = Date.now();
    const timeSinceLastLogin = now - lastLoginTime;
    if (timeSinceLastLogin < LOGIN_COOLDOWN) {
      await this.sleep(LOGIN_COOLDOWN - timeSinceLastLogin);
    }
  }

  /**
   * Handle login failure with exponential backoff
   */
  async handleLoginFailure(attempt) {
    const backoffTime = Math.min(Math.pow(2, attempt) * 1000, 30000); // Max 30 second backoff
    console.log(`Login attempt ${attempt} failed. Waiting ${backoffTime}ms before retry...`);
    await this.sleep(backoffTime);
  }

  async setupPageDebug(page) {
    const { getNetworkActivity, getConsoleLogs } = await this.debugUtils.setupPageDebug(page);
    this.getNetworkActivity = getNetworkActivity;
    this.getConsoleLogs = getConsoleLogs;

    page.on('error', error => {
      console.error('Page error:', error);
    });

    page.on('pageerror', error => {
      console.error('Page error:', error);
    });
  }

  /**
   * Handles login to Oracle CPQ Cloud with rate limiting and retry logic
   */
  async login() {
    if (!process.env.BASE_URL) {
      throw new Error('BASE_URL environment variable must be set');
    }

    const username = process.env.CPQ_USERNAME;
    const password = process.env.CPQ_PASSWORD;

    if (!username || !password) {
      throw new Error('CPQ_USERNAME and CPQ_PASSWORD environment variables must be set');
    }

    // Check if already logged in by trying to access a protected page
    try {
      await this.page.goto(`${process.env.BASE_URL}/commerce/display_company_profile.jsp`);
      const title = await this.page.title();
      if (title.includes('Home')) {
        isLoggedIn = true;
        return;
      }
    } catch (e) {
      // Not logged in, continue with login process
    }

    // Implement login with retries and backoff
    for (let attempt = 1; attempt <= MAX_LOGIN_RETRIES; attempt++) {
      try {
        await this.waitForLoginCooldown();
        
        await this.page.goto(process.env.BASE_URL);
        
        // Wait for and fill in login form
        await this.page.waitForSelector('#username');
        await this.page.type('#username', username);
        await this.page.type('#password', password);
        
        // Click login button and wait for navigation
        await Promise.all([
          this.page.waitForNavigation(),
          this.page.click('input[type="submit"]')
        ]);
        
        // Verify login success
        const newTitle = await this.page.title();
        if (!newTitle.includes('Home')) {
          throw new Error('Login verification failed');
        }

        lastLoginTime = Date.now();
        isLoggedIn = true;
        return;

      } catch (error) {
        console.error(`Login attempt ${attempt} failed:`, error);
        
        if (attempt === MAX_LOGIN_RETRIES) {
          throw new Error(`Failed to login after ${MAX_LOGIN_RETRIES} attempts`);
        }

        await this.handleLoginFailure(attempt);
      }
    }
  }

  /**
   * Clean up browser
   */
  async cleanup() {
    // Only close browser when process is ending
    if (process.env.NODE_ENV === 'test' && process.env.JEST_WORKER_ID === '1') {
      if (sharedBrowser) {
        await sharedBrowser.close();
        sharedBrowser = null;
        sharedPage = null;
        isLoggedIn = false;
      }
    }
  }

  /**
   * Verify extension is loaded
   */
  async verifyExtensionLoaded() {
    await this.page.waitForSelector('#streamline-tools-root', { timeout: 10000 });
  }

  /**
   * Verify correct popup page is loaded
   */
  async verifyPopupPage(expectedPopupFile) {
    const popupFrameHandle = await this.page.waitForSelector(`iframe[src*="${expectedPopupFile}"]`, { timeout: 10000 });
    return popupFrameHandle;
  }

  async waitForStableState() {
    await this.page.waitForNetworkIdle();
    await this.page.waitForFunction(() => 
      !document.querySelector('.loading-indicator') && 
      !document.querySelector('.x-mask-loading')
    );
  }

  async retryOnFailure(action, maxAttempts = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error;
        if (attempt === maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  /**
   * Test load functionality across different contexts
   * @param {string} context - The context to test ('commerce', 'util', 'rules', 'actions')
   * @param {string} code - The code to load
   * @param {string} expectedFileName - Expected file name after load
   */
  async testLoad(context, code, expectedFileName) {
    // Load BML code
    await this.page.evaluate((code) => {
      const loadEvent = new CustomEvent('loadCode', { detail: code });
      window.dispatchEvent(loadEvent);
    }, code);

    // Wait for the load to complete
    await this.waitForStableState();

    // Verify code was loaded correctly
    const loadedCode = await this.page.evaluate(() => {
      const textarea = document.querySelector('textarea');
      return textarea ? textarea.value : null;
    });

    if (loadedCode !== code) {
      throw new Error(`Load failed: expected "${code}" but got "${loadedCode}"`);
    }

    // Verify auto-validation ran
    const validationResult = await this.page.evaluate(() => {
      const validationEl = document.querySelector('.validation-result');
      return validationEl ? validationEl.textContent : null;
    });

    if (!validationResult || validationResult.includes('error')) {
      throw new Error('Code validation failed after load');
    }
  }

  /**
   * Test unload functionality across different contexts
   * @param {string} context - The context to test ('commerce', 'util', 'rules', 'actions')
   * @param {string} expectedCode - Expected code content
   * @param {string} expectedFileName - Expected file name
   */
  async testUnload(context, expectedCode, expectedFileName) {
    // Trigger unload
    await this.page.evaluate(() => {
      const unloadEvent = new CustomEvent('unloadCode');
      window.dispatchEvent(unloadEvent);
    });

    // Wait for unload to complete
    await this.waitForStableState();

    // Verify unloaded code matches expected
    const unloadedCode = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        window.addEventListener('PassCodeToBackground', (evt) => {
          resolve(evt.detail);
        }, { once: true });
      });
    });

    if (unloadedCode !== expectedCode) {
      throw new Error(`Unload failed: expected "${expectedCode}" but got "${unloadedCode}"`);
    }

    // Verify filename matches expected
    const filename = await this.page.evaluate(() => {
      return document.getElementById('fileName').value;
    });

    if (filename !== expectedFileName) {
      throw new Error(`Filename mismatch: expected "${expectedFileName}" but got "${filename}"`);
    }
  }

  /**
   * Test validation functionality
   * @param {string} code - The code to validate
   * @returns {Promise<boolean>} - Whether validation passed
   */
  async testValidation(code) {
    // Load the code
    await this.testLoad('commerce', code, 'test.bml');

    // Click validate button
    await this.page.click('#check');
    
    // Wait for validation
    await this.waitForStableState();

    // Check validation result
    const validationPassed = await this.page.evaluate(() => {
      const validationEl = document.querySelector('.validation-result');
      return validationEl && !validationEl.textContent.includes('error');
    });

    return validationPassed;
  }
}

async function getExtensionId(browser) {
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const targets = await browser.targets();
    const extensionTarget = targets.find(
      target => (target.type() === 'background_page' || target.type() === 'service_worker') && 
      target.url().includes('chrome-extension://')
    );
    
    if (extensionTarget) {
      const extensionUrl = extensionTarget.url();
      const extensionId = extensionUrl.split('/')[2];
      return extensionId;
    }
    
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
    attempts++;
  }
  
  throw new Error('Extension background page or service worker not found after ' + maxAttempts + ' attempts');
}

module.exports = { getExtensionId, TestHelper };