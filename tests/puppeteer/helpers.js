const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises; // Add fs.promises for directory operations
const DebugUtils = require('../debugUtils');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Global browser state management to prevent multiple instances
let sharedBrowser = null;
let sharedPage = null;
let isLoggedIn = false;
let browserCleanupRegistered = false;
let lastLoginTime = 0;
const LOGIN_COOLDOWN = 2000;
const MAX_LOGIN_RETRIES = 3;
// Set consistent timeout values to prevent tests from running indefinitely
const TIMEOUTS = {
  NAVIGATION: 15000, // Navigation timeout (15s)
  PAGE_ACTION: 10000, // Actions like clicks, form fills (10s)
  NETWORK_IDLE: 8000, // Waiting for network idle (8s)
  ELEMENT_APPEARANCE: 10000, // Waiting for elements to appear (10s)
  TEST_DEFAULT: 45000 // Default test timeout (45s instead of 90s)
};

/**
 * Gets the extension ID from a running browser instance
 * @param {puppeteer.Browser} browser - Browser instance
 * @returns {Promise<string>} - Extension ID
 */
async function getExtensionId(browser) {
  console.log("Getting extension ID...");
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const targets = await browser.targets();
    const extensionTarget = targets.find(
      target => (target.type() === 'background_page' || target.type() === 'service_worker') && 
      target.url().includes('chrome-extension://')
    );
    
    if (extensionTarget) {
      const extensionUrl = extensionTarget.url();
      const extensionId = extensionUrl.split('/')[2];
      console.log('Extension ID found:', extensionId);
      return extensionId;
    }
    
    // Wait before trying again
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 100));
    attempts++;
  }
  
  console.error('Extension background page or service worker not found after ' + maxAttempts + ' attempts');
  throw new Error('Failed to find extension ID');
}

// Add a function to ensure only one browser is created
async function getBrowserInstance() {
  if (sharedBrowser) {
    return sharedBrowser;
  }
  
  // Get extension path
  const extensionPath = path.resolve(__dirname, '../../src');
  
  try {
    console.log("Trying to get existing browser instance...");
    // Try to get browser from jest-puppeteer first
    sharedBrowser = global.__BROWSER__;
  } catch (e) {
    console.log("No existing browser found, launching new instance...");
    // Fall back to launching our own browser if needed
    const launchOptions = {
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--enable-features=NetworkService',
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--single-process'  // Force single process
      ],
      slowMo: 100
    };
    
    console.log("Browser launch options:", JSON.stringify(launchOptions, null, 2));
    sharedBrowser = await puppeteer.launch(launchOptions);
  }
  
  if (!sharedBrowser) {
    throw new Error('Failed to initialize browser');
  }
  
  // Register signal handlers for graceful shutdown
  ['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(signal => {
    process.on(signal, async () => {
      console.log(`\nReceived ${signal}, closing browser gracefully...`);
      if (sharedBrowser) {
        try {
          await sharedBrowser.close();
        } catch (err) {
          console.error("Error closing browser:", err);
        } finally {
          process.exit(0);
        }
      }
    });
  });
  
  // Also handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit process here, just log it to help with debugging
  });
  
  return sharedBrowser;
}

class TestHelper {
  constructor() {
    this.debugUtils = new DebugUtils();
    this.recorder = null; // Add recorder property
    this.videoPath = null; // Add video path property
  }

  /**
   * Safe wait method that handles waitForTimeout compatibility issues
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise<void>}
   */
  async safeWait(ms) {
    try {
      if (this.page && typeof this.page.waitForTimeout === 'function') {
        await this.page.waitForTimeout(ms);
      } else {
        // Fallback for older versions or if method is unavailable
        await new Promise(resolve => setTimeout(resolve, ms));
      }
    } catch (error) {
      console.warn(`Warning: waitForTimeout failed, using setTimeout fallback: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  async init() {
    try {
      await this.debugUtils.init();
      console.log("Initializing TestHelper...");
      
      // Get browser instance from Jest Puppeteer environment
      this.browser = global.__BROWSER__;
      
      // If no browser instance from Jest Puppeteer, launch our own
      if (!this.browser) {
        console.log("No browser instance found from Jest Puppeteer environment, launching new browser...");
        const extensionPath = path.resolve(__dirname, '../../src');
        
        // Launch our own browser instance
        this.browser = await puppeteer.launch({
          headless: false,
          defaultViewport: { width: 1920, height: 1080 },
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--enable-features=NetworkService',
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`
          ],
          slowMo: 50
        });
      }
      
      console.log("Browser instance acquired");
      sharedBrowser = this.browser;

      // Create or reuse page
      if (sharedPage) {
        console.log("Reusing existing page");
        this.page = sharedPage;
      } else {
        console.log("Creating new page");
        this.page = await this.browser.newPage();
        sharedPage = this.page;
        await this.setupPageDebug(this.page);

        // Set up error handlers
        this.page.on('error', error => {
          console.error('Page error:', error);
        });

        this.page.on('pageerror', error => {
          console.error('Page error:', error);
        });

        this.page.on('console', msg => {
          const type = msg.type();
          if (type === 'error' || type === 'warning') {
            console.log(`Page ${type}:`, msg.text());
          } else if (process.env.DEBUG_TESTS === 'true') {
            console.log(`Page ${type}:`, msg.text());
          }
        });

        // Set default timeout
        this.page.setDefaultTimeout(parseInt(process.env.TEST_TIMEOUT) || 30000);

        // Register cleanup once
        if (!browserCleanupRegistered) {
          process.on('exit', () => {
            console.log("Process exit, cleanup triggered");
            if (sharedPage) {
              try {
                sharedPage.close().catch(() => {});
              } catch (e) {}
            }
          });
          browserCleanupRegistered = true;
        }
      }

      // Get extension ID
      await this.detectExtensionId();
      
      // Only attempt login if BASE_URL is set and not already logged in
      if (process.env.BASE_URL && !isLoggedIn) {
        await this.login();
      }
    } catch (error) {
      console.error("Error in TestHelper init:", error);
      throw error;
    }
  }

  /**
   * Detect the extension ID
   */
  async detectExtensionId() {
    let attempts = 0;
    const maxAttempts = 5;
    let extensionId = null;
    
    while (attempts < maxAttempts && !extensionId) {
      try {
        console.log(`Attempt ${attempts + 1} to detect extension ID...`);
        const targets = await sharedBrowser.targets();
        const extensionTarget = targets.find(
          target => (target.type() === 'background_page' || target.type() === 'service_worker') && 
          target.url().includes('chrome-extension://')
        );
        
        if (extensionTarget) {
          const extensionUrl = extensionTarget.url();
          extensionId = extensionUrl.split('/')[2];
          console.log('Extension ID detected:', extensionId);
          this.extensionId = extensionId;
          return extensionId;
        }
      } catch (error) {
        console.error(`Error in attempt ${attempts + 1} to detect extension ID:`, error);
      }
      
      attempts++;
      // Wait before trying again with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
    }
    
    console.warn('Could not detect extension ID after multiple attempts');
    return null;
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
    const MIN_LOGIN_INTERVAL_MS = 60000; // 1 minute between login attempts
    
    if (lastLoginTime) {
      const timeSinceLastLogin = Date.now() - lastLoginTime;
      if (timeSinceLastLogin < MIN_LOGIN_INTERVAL_MS) {
        const waitTime = MIN_LOGIN_INTERVAL_MS - timeSinceLastLogin;
        console.log(`Rate limiting: Waiting ${waitTime}ms before next login attempt`);
        await this.safeWait(waitTime);
      }
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
    
    // Enhanced console logging
    page.on('console', msg => {
      const type = msg.type();
      // Always log errors and warnings
      if (type === 'error' || type === 'warning') {
        console.log(`Page ${type}:`, msg.text());
      } else if (process.env.DEBUG_TESTS === 'true') {
        // Log other types only if debug is enabled
        console.log(`Page ${type}:`, msg.text());
      }
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
  
    console.log("Using credentials - Username:", username);
    console.log("Base URL:", process.env.BASE_URL);
    
    // Set hard timeout for entire login process
    const loginStartTime = Date.now();
    const MAX_LOGIN_TIME = 120000; // Increase to 120 seconds maximum for login process
  
    // Check if already logged in by trying to access a protected page
    try {
      console.log("Checking if already logged in...");
      
      // Use a more reliable navigation approach with increased timeout
      await Promise.race([
        this.page.goto(process.env.BASE_URL, { 
          waitUntil: ['domcontentloaded', 'networkidle2'], // More comprehensive waiting conditions
          timeout: 60000  // Increased timeout
        }),
        new Promise(resolve => setTimeout(resolve, 60000))
      ]);
      
      // Give more time for JavaScript frameworks to initialize
      await this.safeWait(5000);
      
      // Check if we're already on a logged-in page with more reliable indicators
      const title = await this.page.title();
      console.log(`Current page title: ${title}`);
      
      // More comprehensive check for login status
      const loginStatus = await this.page.evaluate(() => {
        // Elements that indicate we're on the login page
        const loginIndicators = !!(
          document.querySelector('#username') || 
          document.querySelector('#psword') || 
          document.querySelector('input[type="password"]') ||
          document.querySelector('form[action*="login"]')
        );
        
        // Elements that indicate we're logged in
        const loggedInIndicators = !!(
          document.querySelector('.user-profile') || 
          document.querySelector('.logged-in-user') ||
          document.querySelector('.logout-button') ||
          document.querySelector('#logout') ||
          document.querySelector('a[href*="logout"]') ||
          document.querySelector('.header-user-info') ||  // Added additional indicators
          document.querySelector('.user-name')
        );
        
        return { loginIndicators, loggedInIndicators };
      });
      
      if (!loginStatus.loginIndicators && loginStatus.loggedInIndicators) {
        console.log("Already logged in based on page indicators!");
        isLoggedIn = true;
        return;
      } else {
        console.log("Not logged in yet, proceeding with login...");
      }
    } catch (e) {
      console.log("Error checking login status:", e.message);
      console.log("Proceeding with login attempt...");
    }
  
    // Reduce cooldown time to prevent excessive waiting between retries
    const MIN_LOGIN_INTERVAL_MS = 15000; // Reduced from 60000 to 15000 (15 seconds)
    
    if (lastLoginTime) {
      const timeSinceLastLogin = Date.now() - lastLoginTime;
      if (timeSinceLastLogin < MIN_LOGIN_INTERVAL_MS) {
        const waitTime = MIN_LOGIN_INTERVAL_MS - timeSinceLastLogin;
        console.log(`Rate limiting: Waiting ${waitTime}ms before next login attempt`);
        await this.safeWait(waitTime);
      }
    }
  
    // Implement login with retries and backoff
    for (let attempt = 1; attempt <= MAX_LOGIN_RETRIES; attempt++) {
      try {
        // Check if we've exceeded the max login time
        if (Date.now() - loginStartTime > MAX_LOGIN_TIME) {
          console.error(`Login process exceeded maximum time of ${MAX_LOGIN_TIME/1000} seconds`);
          throw new Error(`Login timed out after ${MAX_LOGIN_TIME/1000} seconds`);
        }
        
        console.log(`Login attempt ${attempt}/${MAX_LOGIN_RETRIES}`);
        
        // More robust page navigation with longer timeout
        try {
          console.log(`Navigating to ${process.env.BASE_URL}`);
          await Promise.race([
            this.page.goto(process.env.BASE_URL, { 
              waitUntil: ['load', 'domcontentloaded', 'networkidle2'], // Multiple conditions
              timeout: 45000  // Increased timeout for reliability
            }),
            new Promise(resolve => setTimeout(resolve, 45000))
          ]);
        } catch (navError) {
          console.log("Navigation timeout or error, but continuing:", navError.message);
          // Try a page reload as a fallback
          await this.page.reload({ waitUntil: 'domcontentloaded' }).catch(e => console.log("Reload failed:", e.message));
        }
        
        // Wait longer for page to stabilize
        await this.safeWait(5000);
        
        // Take a screenshot before attempting login for debugging
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await this.page.screenshot({ 
          path: `login-error-${timestamp}-attempt-${attempt}.png`, 
          fullPage: true 
        });
        
        // Force clear cookies and cache before each login attempt (for attempt > 1)
        if (attempt > 1) {
          try {
            const client = await this.page.target().createCDPSession();
            await client.send('Network.clearBrowserCookies');
            await client.send('Network.clearBrowserCache');
            console.log("Cleared cookies and cache before retry");
          } catch (e) {
            console.log("Failed to clear cookies/cache:", e.message);
          }
        }
        
        // Detect form with a more comprehensive approach
        const loginFormDetails = await this.page.evaluate(() => {
          // Try to find all possible username fields
          const userFields = [
            document.querySelector('#username'),
            document.querySelector('input[name="username"]'),
            document.querySelector('input[type="text"][id*="user"]'),
            document.querySelector('input[type="text"][name*="user"]'),
            document.querySelector('input[type="email"]'),
            document.querySelector('input[placeholder*="user"]'),
            document.querySelector('input[placeholder*="email"]')
          ].filter(Boolean);
          
          // Try to find all possible password fields
          const passFields = [
            document.querySelector('#psword'),
            document.querySelector('#password'),
            document.querySelector('input[name="password"]'),
            document.querySelector('input[type="password"]'),
            document.querySelector('input[placeholder*="password"]')
          ].filter(Boolean);
          
          // Try to find all possible submit buttons
          const submitButtons = [
            document.querySelector('#log_in'),
            document.querySelector('input[type="submit"]'),
            document.querySelector('button[type="submit"]'),
            document.querySelector('button.login-button'),
            document.querySelector('input[value="Login"]'),
            document.querySelector('input[value="Sign In"]'),
            document.querySelector('button:contains("Login")'),
            document.querySelector('button:contains("Sign In")')
          ].filter(Boolean);
          
          // Get field IDs for diagnostic purposes
          const userFieldIds = userFields.map(el => el.id || el.name || 'unnamed');
          const passFieldIds = passFields.map(el => el.id || el.name || 'unnamed');
          
          return {
            hasUserField: userFields.length > 0,
            hasPassField: passFields.length > 0,
            hasSubmitButton: submitButtons.length > 0,
            userFieldIds,
            passFieldIds
          };
        });
        
        console.log("Login form detection results:", JSON.stringify(loginFormDetails, null, 2));
        
        if (!loginFormDetails.hasUserField || !loginFormDetails.hasPassField) {
          console.error("Could not find login form fields");
          
          // Try clicking any login/sign-in buttons that might be on a pre-login page
          await this.page.evaluate(() => {
            const possibleLoginButtons = [
              ...document.querySelectorAll('a[href*="login"]'),
              ...document.querySelectorAll('button:contains("Login")'),
              ...document.querySelectorAll('button:contains("Sign In")')
            ];
            
            if (possibleLoginButtons.length > 0) {
              console.log("Found possible login button, clicking it");
              possibleLoginButtons[0].click();
              return true;
            }
            return false;
          }).catch(e => console.log("Error finding login buttons:", e.message));
          
          // Wait a moment for any navigation after clicking login
          await this.safeWait(5000);
          
          if (attempt < MAX_LOGIN_RETRIES) {
            await this.handleLoginFailure(attempt);
            continue;
          } else {
            throw new Error("Could not find login form fields after multiple attempts");
          }
        }
        
        // Use puppeteer's built-in methods instead of page.evaluate for better reliability
        try {
          console.log("Attempting to fill login form...");
          
          // Try multiple possible selectors for username field
          let userFieldSelector = '';
          for (const selector of ['#username', 'input[name="username"]', 'input[type="text"][id*="user"]', 'input[type="email"]']) {
            const exists = await this.page.$(selector).then(el => !!el);
            if (exists) {
              userFieldSelector = selector;
              break;
            }
          }
          
          // Try multiple possible selectors for password field
          let passFieldSelector = '';
          for (const selector of ['#psword', '#password', 'input[type="password"]']) {
            const exists = await this.page.$(selector).then(el => !!el);
            if (exists) {
              passFieldSelector = selector;
              break;
            }
          }
          
          if (!userFieldSelector || !passFieldSelector) {
            throw new Error("Could not find username or password field with direct selectors");
          }
          
          // Clear and fill username field
          console.log("Filling username field:", userFieldSelector);
          await this.page.$eval(userFieldSelector, (el) => el.value = ''); // Clear
          await this.page.type(userFieldSelector, username, { delay: 100 });
          await this.safeWait(1000);
          
          // Clear and fill password field
          console.log("Filling password field:", passFieldSelector);
          await this.page.$eval(passFieldSelector, (el) => el.value = ''); // Clear
          await this.page.type(passFieldSelector, password, { delay: 100 });
          await this.safeWait(1000);
          
          // Try to find submit button
          console.log("Finding submit button...");
          const submitButtonSelector = await this.page.evaluate(() => {
            const selectors = [
              '#log_in', 
              'input[type="submit"]', 
              'button[type="submit"]',
              'button.login-button',
              'input[value="Login"]',
              'input[value="Sign In"]'
            ];
            
            for (const selector of selectors) {
              if (document.querySelector(selector)) {
                return selector;
              }
            }
            return null;
          });
          
          // Submit form
          if (submitButtonSelector) {
            console.log("Clicking submit button:", submitButtonSelector);
            await Promise.all([
              this.page.click(submitButtonSelector),
              this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(e => 
                console.log("Navigation timeout after login, but continuing:", e.message)
              )
            ]);
          } else {
            console.log("No submit button found, trying to submit form...");
            // Try to submit form directly
            await this.page.evaluate(() => {
              const form = document.querySelector('form');
              if (form) {
                console.log("Submitting form directly");
                form.submit();
              } else {
                console.log("No form found, simulating Enter key press");
                const passwordField = document.querySelector('input[type="password"]');
                if (passwordField) {
                  const event = new KeyboardEvent('keypress', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13,
                    bubbles: true
                  });
                  passwordField.dispatchEvent(event);
                }
              }
            });
            
            // Wait for navigation after form submit
            await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(e => 
              console.log("Navigation timeout after login, but continuing:", e.message)
            );
          }
          
        } catch (formError) {
          console.error("Error interacting with login form:", formError);
          if (attempt < MAX_LOGIN_RETRIES) {
            await this.handleLoginFailure(attempt);
            continue;
          } else {
            throw new Error(`Login form interaction failed: ${formError.message}`);
          }
        }
        
        // Give page more time to fully load JavaScript
        await this.safeWait(8000);
        
        // Take screenshot after login attempt for debugging
        await this.page.screenshot({ 
          path: `login-after-${timestamp}-attempt-${attempt}.png`, 
          fullPage: true 
        });
        
        // Check login success with multiple indicators
        const loginVerification = await this.page.evaluate(() => {
          // Elements that indicate we're still on the login page
          const loginPageIndicators = [
            '#username', 
            '#psword', 
            '#password', 
            'input[type="password"]',
            '.login-form',
            'form[action*="login"]'
          ];
          
          const stillOnLoginPage = loginPageIndicators.some(selector => 
            document.querySelector(selector) !== null
          );
          
          // Elements that indicate we're logged in
          const loggedInIndicators = [
            '.user-profile', 
            '.logged-in-user',
            '.logout-button',
            '#logout',
            'a[href*="logout"]',
            '.header-user-info',
            '.user-name',
            '.user-account'
          ];
          
          const hasLoggedInIndicators = loggedInIndicators.some(selector => 
            document.querySelector(selector) !== null
          );
          
          // Check for error messages
          const errorSelectors = [
            '.error', 
            '.error-message', 
            '.alert-danger', 
            '[role="alert"]', 
            '.notification-error',
            '#errorMessage',
            '.login-error'
          ];
          
          const errorElements = errorSelectors.flatMap(selector => 
            Array.from(document.querySelectorAll(selector))
          );
          
          const errorMessages = errorElements
            .map(el => el.textContent.trim())
            .filter(text => text.length > 0);
          
          return { 
            stillOnLoginPage, 
            hasLoggedInIndicators,
            errorMessages,
            pageTitle: document.title,
            currentUrl: window.location.href
          };
        });
        
        console.log("Login verification results:", JSON.stringify(loginVerification, null, 2));
        
        if (!loginVerification.stillOnLoginPage && loginVerification.hasLoggedInIndicators) {
          console.log("Login successful!");
          isLoggedIn = true;
          lastLoginTime = Date.now();
          return;
        } else {
          console.log("Login appears to have failed:");
          console.log(`- Still on login page: ${loginVerification.stillOnLoginPage}`);
          console.log(`- Has logged-in indicators: ${loginVerification.hasLoggedInIndicators}`);
          console.log(`- Current page title: ${loginVerification.pageTitle}`);
          
          if (loginVerification.errorMessages.length > 0) {
            console.log("Error messages found:", loginVerification.errorMessages.join(' | '));
          }
          
          if (attempt < MAX_LOGIN_RETRIES) {
            await this.handleLoginFailure(attempt);
          }
        }
      } catch (error) {
        console.error(`Login error on attempt ${attempt}:`, error);
        
        if (attempt < MAX_LOGIN_RETRIES) {
          await this.handleLoginFailure(attempt);
        } else {
          throw new Error(`Login failed after ${MAX_LOGIN_RETRIES} attempts: ${error.message}`);
        }
      }
    }
    
    throw new Error(`Login failed after ${MAX_LOGIN_RETRIES} attempts`);
  }

  /**
   * Clean up browser
   */
  async cleanup() {
    // Stop any active recording before closing
    await this.stopRecording();
    
    // Only close browser when process is ending
    if (process.env.NODE_ENV === 'test' && process.env.JEST_WORKER_ID === '1') {
      if (sharedBrowser) {
        await sharedBrowser.close().catch(error => {
          console.error("Error closing browser:", error);
        });
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
    try {
      console.log("Verifying extension is loaded...");
      await this.page.waitForSelector('#streamline-tools-root', { 
        timeout: 10000,
        visible: true
      });
      console.log("Extension verified as loaded!");
      return true;
    } catch (error) {
      console.error("Failed to verify extension:", error.message);
      console.log("Taking screenshot of current page state...");
      
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await this.page.screenshot({
          path: `extension-verification-failure-${timestamp}.png`,
          fullPage: true
        });
      } catch (screenshotError) {
        console.error("Failed to take screenshot:", screenshotError);
      }
      
      throw new Error("Extension not loaded properly");
    }
  }

  /**
   * Verify correct popup page is loaded
   */
  async verifyPopupPage(expectedPopupFile) {
    console.log(`Verifying popup page: ${expectedPopupFile}`);
    try {
      const popupFrameHandle = await this.page.waitForSelector(`iframe[src*="${expectedPopupFile}"]`, { 
        timeout: 10000,
        visible: true
      });
      console.log("Popup page verified!");
      return popupFrameHandle;
    } catch (error) {
      console.error("Failed to verify popup page:", error.message);
      
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await this.page.screenshot({
          path: `popup-verification-failure-${timestamp}.png`,
          fullPage: true
        });
      } catch (screenshotError) {
        console.error("Failed to take screenshot:", screenshotError);
      }
      
      throw new Error(`Popup page ${expectedPopupFile} not loaded properly`);
    }
  }

  async waitForStableState() {
    console.log("Waiting for stable page state...");
    
    // Wait for network to be idle
    await this.page.waitForNetworkIdle({ idleTime: 1000, timeout: 15000 }).catch(e => {
      console.warn("Network didn't reach idle state:", e.message);
    });
    
    // Wait for loading indicators to disappear
    await this.page.waitForFunction(() => {
      const loadingElements = [
        '.loading-indicator', 
        '.x-mask-loading',
        '.spinner',
        '[aria-busy="true"]'
      ];
      
      return loadingElements.every(selector => !document.querySelector(selector));
    }, { timeout: 15000 }).catch(e => {
      console.warn("Loading indicators may still be present:", e.message);
    });
    
    console.log("Page reached stable state");
  }

  /**
   * Retry an action on failure with exponential backoff
   */
  async retryOnFailure(action, maxAttempts = 3, actionName = 'operation') {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxAttempts} for ${actionName}`);
        return await action();
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxAttempts) {
          console.error(`All ${maxAttempts} attempts failed for ${actionName}`);
          throw error;
        }
        
        // Exponential backoff
        const delay = 1000 * Math.pow(1.5, attempt);
        console.log(`Waiting ${delay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Test load functionality
   */
  async testLoad(popupFrame, filename, content, editorSelector = '#contentEditor') {
    console.log(`Testing load functionality with file: ${filename}`);
    
    // Switch to the popup frame context
    const frameContext = await popupFrame.contentFrame();
    if (!frameContext) {
      throw new Error("Could not get popup frame content");
    }
    
    // Set the editor content
    await frameContext.evaluate((selector, text) => {
      const editor = document.querySelector(selector);
      if (editor) {
        editor.value = text;
        
        // Trigger input events
        ['input', 'change'].forEach(eventName => {
          const event = new Event(eventName, { bubbles: true });
          editor.dispatchEvent(event);
        });
        
        return true;
      }
      return false;
    }, editorSelector, content);
    
    // Verify the content was set correctly
    const editorContent = await frameContext.evaluate((selector) => {
      const editor = document.querySelector(selector);
      return editor ? editor.value : null;
    }, editorSelector);
    
    console.log("Verifying editor content...");
    if (editorContent !== content) {
      console.error("Content mismatch!");
      console.error("Expected:", content);
      console.error("Actual:", editorContent);
      throw new Error("Editor content doesn't match the input content");
    }
    
    // Find and click save button if available
    const hasSaveButton = await frameContext.evaluate(() => {
      const saveButton = document.querySelector('#save');
      if (saveButton) {
        saveButton.click();
        return true;
      }
      return false;
    });
    
    if (hasSaveButton) {
      console.log("Save button clicked");
      // Wait for any post-save operations to complete
      await this.waitForStableState();
    } else {
      console.log("No save button found");
    }
    
    console.log("Load test completed successfully!");
  }

  /**
   * Test unload functionality
   */
  async testUnload(popupFrame, expectedFileName) {
    console.log(`Testing unload functionality, expected file: ${expectedFileName}`);
    
    // Switch to the popup frame context
    const frameContext = await popupFrame.contentFrame();
    if (!frameContext) {
      throw new Error("Could not get popup frame content");
    }
    
    // Get editor content before unload
    const editorContent = await frameContext.evaluate(() => {
      const editor = document.querySelector('#contentEditor');
      return editor ? editor.value : null;
    });
    
    if (!editorContent) {
      console.warn("No editor content found before unload");
    } else {
      console.log(`Editor has content of length: ${editorContent.length}`);
    }
    
    // Verify file name if supplied
    if (expectedFileName) {
      const fileName = await frameContext.evaluate(() => {
        const fileNameElement = document.querySelector('#fileName');
        return fileNameElement ? fileNameElement.value : null;
      });
      
      if (fileName !== expectedFileName) {
        console.warn(`File name mismatch! Expected: ${expectedFileName}, Got: ${fileName}`);
      } else {
        console.log(`File name verified: ${fileName}`);
      }
    }
    
    console.log("Unload test completed");
    return editorContent;
  }

  /**
   * A simpler approach to ensure the extension is ready for testing
   * Without relying on pinning to toolbar which is unreliable
   */
  async pinExtensionToToolbar() {
    try {
      console.log("Setting up extension for testing with improved method...");
      
      // First make sure we have the extension ID
      if (!this.extensionId) {
        await this.detectExtensionId();
      }
      
      if (!this.extensionId) {
        console.warn("Could not determine extension ID, proceeding with alternative activation method");
      } else {
        console.log("Extension ID found:", this.extensionId);
        
        // Try to activate extension directly if we have the ID
        try {
          // Create a new tab to load the extension popup directly
          const popupPage = await this.browser.newPage();
          await popupPage.goto(`chrome-extension://${this.extensionId}/popup/popup.html`, {
            waitUntil: 'networkidle2',
            timeout: 10000
          });
          
          // Take screenshot of extension popup for debugging
          await popupPage.screenshot({ path: 'extension-popup-direct.png' });
          
          // Close the popup tab
          await popupPage.close();
          console.log("Successfully activated extension via direct popup access");
        } catch (e) {
          console.warn("Could not access extension popup directly:", e.message);
        }
      }
      
      // Return to the admin page where we need to test
      try {
        console.log("Navigating to admin page to ensure extension is activated there...");
        await this.page.goto(`${process.env.BASE_URL}/admin/header_footer/edit.jsp`, {
          waitUntil: 'networkidle2',
          timeout: 20000 // Reduced timeout
        });
        
        // Wait a moment for any page initialization
        await this.safeWait(2000);
        
        // Take screenshot of current admin page for debugging
        await this.page.screenshot({ path: 'admin-page-extension-setup.png', fullPage: true });
        
        // Check if extension content is already on page
        const extensionLoaded = await this.page.evaluate(() => {
          return !!(document.querySelector('#streamline-tools-root') || 
                  document.querySelector('#unloadHeaderHTML') ||
                  document.querySelector('#loadHeaderHTML'));
        });
        
        if (extensionLoaded) {
          console.log("Extension already loaded on admin page");
        } else {
          console.log("Extension not detected on page, triggering content script activation...");
          
          // Try to trigger extension activation by refreshing the page
          await this.page.reload({ waitUntil: 'networkidle2', timeout: 15000 });
          await this.safeWait(2000);
          
          // Check if extension loaded after reload
          const extensionLoadedAfterReload = await this.page.evaluate(() => {
            return !!(document.querySelector('#streamline-tools-root') || 
                    document.querySelector('#unloadHeaderHTML') ||
                    document.querySelector('#loadHeaderHTML'));
          });
          
          if (extensionLoadedAfterReload) {
            console.log("Extension loaded after page refresh");
          } else {
            console.warn("Extension still not detected after refresh, trying direct activation");
            
            // Try to access the extension popup as a last resort
            if (this.extensionId) {
              try {
                await this.page.goto(`chrome-extension://${this.extensionId}/popup/popup.html`, {
                  waitUntil: 'domcontentloaded',
                  timeout: 5000
                });
                await this.safeWait(1000);
                await this.page.goto(`${process.env.BASE_URL}/admin/header_footer/edit.jsp`, {
                  waitUntil: 'networkidle2',
                  timeout: 15000
                });
              } catch (e) {
                console.warn("Direct extension activation failed:", e.message);
              }
            }
          }
        }
        
        console.log("Extension setup on admin page complete");
      } catch (error) {
        console.error("Error accessing admin page:", error.message);
      }
      
      return true;
    } catch (error) {
      console.error("Error setting up extension:", error);
      return false;
    }
  }

  /**
   * Start video recording for the current page
   * @param {string} filePath - Path to save the video file
   */
  async startRecording(filePath) {
    if (this.recorder) {
      console.log("Recording already in progress. Stopping previous recording.");
      await this.stopRecording(false); // Don't save the previous recording
    }
    
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true }).catch(err => {
        if (err.code !== 'EEXIST') throw err;
      });
      
      console.log(`Starting video recording to: ${filePath}`);
      this.videoPath = filePath;
      // Use page.screencast() - available in Puppeteer v24+
      this.recorder = await this.page.screencast({ path: filePath });
      return true;
    } catch (error) {
      console.error("Failed to start video recording:", error);
      this.recorder = null;
      this.videoPath = null;
      return false;
    }
  }

  /**
   * Stop video recording
   * @param {boolean} saveVideo - Whether to keep the video (true) or delete it (false)
   */
  async stopRecording(saveVideo = true) {
    if (this.recorder) {
      try {
        console.log("Stopping video recording...");
        await this.recorder.stop();
        console.log(`Recording stopped. Video ${saveVideo ? 'saved to' : 'will be deleted from'}: ${this.videoPath}`);
        
        if (!saveVideo && this.videoPath) {
          console.log(`Deleting video file: ${this.videoPath}`);
          try {
            await fs.unlink(this.videoPath).catch(err => {
              if (err.code !== 'ENOENT') console.error(`Error deleting video: ${err.message}`);
            });
          } catch (unlinkError) {
            console.error(`Failed to delete video file ${this.videoPath}:`, unlinkError);
          }
        }
      } catch (error) {
        console.error("Error stopping video recording:", error);
      } finally {
        this.recorder = null;
        if (!saveVideo) this.videoPath = null;
      }
    }
  }

  /**
   * Show the extension being added to the browser
   */
  async showExtensionInBrowser() {
    console.log("Navigating to Chrome Extensions page to show extension...");
    try {
      // Open extensions page
      await this.page.goto('chrome://extensions/', { waitUntil: 'domcontentloaded' });
      await this.safeWait(3000); // Wait to view the page
      await this.page.screenshot({ path: 'chrome-extensions-page.png' });
      
      // If we have extension ID, try to focus on our extension
      if (this.extensionId) {
        try {
          // Try to find and click the extension card or details
          await this.page.evaluate((extId) => {
            const cards = Array.from(document.querySelectorAll('extensions-item, extensions-card, .extension-list-item'));
            for (const card of cards) {
              if (card.innerHTML && card.innerHTML.includes(extId)) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                  try { card.click(); } catch(e) {}
                }, 500);
                return true;
              }
            }
            return false;
          }, this.extensionId);
          await this.safeWait(2000);
          await this.page.screenshot({ path: 'chrome-extensions-detail.png' });
        } catch (err) {
          console.log("Could not focus on extension details:", err.message);
        }
      }
      
      // Return to the app
      if (process.env.BASE_URL) {
        await this.page.goto(process.env.BASE_URL, { waitUntil: 'domcontentloaded' });
      }
      
      return true;
    } catch (error) {
      console.error("Error showing extension in browser:", error);
      return false;
    }
  }
}

module.exports = { getExtensionId, TestHelper };