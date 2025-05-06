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
   * Handle a failed login attempt with diagnostics and backoff
   * @param {number} attempt - The current attempt number
   * @private
   */
  async handleLoginFailure(attempt) {
    console.log(`Login attempt ${attempt} failed. Preparing for retry...`);
    
    // Take a screenshot for debugging
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    try {
      await this.page.screenshot({ 
        path: `login-error-${timestamp}-attempt-${attempt}.png`, 
        fullPage: true 
      });
    } catch (err) {
      console.log("Failed to capture error screenshot:", err.message);
    }
    
    // Collect diagnostics
    try {
      const diagnostics = await this.page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          bodyText: document.body.innerText.substring(0, 500) + "...",
          forms: document.forms.length,
          inputs: document.querySelectorAll('input').length,
          buttons: document.querySelectorAll('button').length,
          cookies: document.cookie,
          viewportHeight: window.innerHeight,
          viewportWidth: window.innerWidth
        };
      });
      
      console.log("Page diagnostics:", JSON.stringify(diagnostics, null, 2));
    } catch (e) {
      console.log("Failed to collect diagnostics:", e.message);
    }
    
    // Implement exponential backoff with jitter
    const baseWaitTime = Math.min(Math.pow(2, attempt) * 3000, 20000);
    const jitter = Math.floor(Math.random() * 2000); // Add randomness to prevent synchronized retries
    const waitTime = baseWaitTime + jitter;
    
    console.log(`Waiting ${waitTime}ms before retry ${attempt + 1}...`);
    
    // Clear cookies and session storage before retrying
    try {
      const client = await this.page.target().createCDPSession();
      await client.send('Network.clearBrowserCookies');
      await client.send('Network.clearBrowserCache');
      
      await this.page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          // Ignore errors if storage access is restricted
        }
      });
      
      console.log("Cleared cookies, cache and storage before retry");
    } catch (err) {
      console.log("Failed to clear browser state:", err.message);
    }
    
    await this.safeWait(waitTime);
  }

  /**
   * Safe wait method that won't throw if page context is destroyed
   * @param {number} ms - Milliseconds to wait
   */
  async safeWait(ms) {
    try {
      await this.page.waitForTimeout(ms);
    } catch (err) {
      // If page context is destroyed, use regular sleep
      await this.sleep(ms);
    }
  }
  
  /**
   * Regular sleep function
   * @param {number} ms - Milliseconds to wait
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    const MAX_LOGIN_TIME = 180000; // Increase to 180 seconds maximum for login process
  
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
          document.querySelector('.header-user-info') ||
          document.querySelector('.user-name') ||
          document.querySelector('#navUserMenu') ||  // Additional CPQ-specific indicators
          document.querySelector('.nx-header') ||
          document.querySelector('.crm-ribbon')
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
    const MIN_LOGIN_INTERVAL_MS = 8000; // Reduced to 8 seconds
    
    if (lastLoginTime) {
      const timeSinceLastLogin = Date.now() - lastLoginTime;
      if (timeSinceLastLogin < MIN_LOGIN_INTERVAL_MS) {
        const waitTime = MIN_LOGIN_INTERVAL_MS - timeSinceLastLogin;
        console.log(`Rate limiting: Waiting ${waitTime}ms before next login attempt`);
        await this.safeWait(waitTime);
      }
    }
  
    // Add more retries to handle transient issues
    const ENHANCED_MAX_RETRIES = 5;
    
    // Implement login with retries and backoff
    for (let attempt = 1; attempt <= ENHANCED_MAX_RETRIES; attempt++) {
      try {
        // Check if we've exceeded the max login time
        if (Date.now() - loginStartTime > MAX_LOGIN_TIME) {
          console.error(`Login process exceeded maximum time of ${MAX_LOGIN_TIME/1000} seconds`);
          throw new Error(`Login timed out after ${MAX_LOGIN_TIME/1000} seconds`);
        }
        
        console.log(`Login attempt ${attempt}/${ENHANCED_MAX_RETRIES}`);
        
        // More robust page navigation with longer timeout
        try {
          console.log(`Navigating to ${process.env.BASE_URL}`);
          
          // Force clear cookies and cache before each login attempt
          const client = await this.page.target().createCDPSession();
          await client.send('Network.clearBrowserCookies');
          await client.send('Network.clearBrowserCache');
          console.log("Cleared cookies and cache before navigation");
          
          await Promise.race([
            this.page.goto(process.env.BASE_URL, { 
              waitUntil: ['load', 'domcontentloaded', 'networkidle2'], // Multiple conditions
              timeout: 45000  // Increased timeout for reliability
            }),
            new Promise(resolve => setTimeout(resolve, 45000))
          ]);
        } catch (navError) {
          console.log("Navigation timeout or error, but continuing:", navError.message);
          try {
            // Try a page reload as a fallback
            await this.page.reload({ waitUntil: 'domcontentloaded' });
          } catch (e) {
            console.log("Reload failed:", e.message);
          }
        }
        
        // Wait longer for page to stabilize
        await this.safeWait(5000);
        
        // Take a screenshot before attempting login for debugging
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        try {
          await this.page.screenshot({ 
            path: `login-step1-before-${timestamp}-attempt-${attempt}.png`, 
            fullPage: true 
          });
        } catch (err) {
          console.log("Screenshot failed:", err.message);
        }
        
        // Enhanced detection of authentication method - check for various login methods
        const loginMethod = await this.page.evaluate(() => {
          // Check for standard login form
          const standardForm = !!(
            (document.querySelector('#username') || document.querySelector('input[name="username"]')) &&
            (document.querySelector('#psword') || document.querySelector('#password') || document.querySelector('input[type="password"]'))
          );
          
          // Check for SSO button
          const ssoButton = !!(
            document.querySelector('a[href*="sso"]') || 
            document.querySelector('button:contains("SSO")') ||
            document.querySelector('a:contains("Single Sign-On")')
          );
          
          // Check for OAuth/external login options
          const oauthOptions = !!(
            document.querySelector('a[href*="oauth"]') ||
            document.querySelector('button:contains("Sign in with")') ||
            document.querySelector('a:contains("Sign in with")')
          );
          
          return { standardForm, ssoButton, oauthOptions };
        });
        
        console.log("Detected login method:", JSON.stringify(loginMethod, null, 2));
        
        // Enhanced form detection and interaction
        // Try to use direct selector first, then fall back to other selectors
        const userNameSelectors = [
          '#username', 
          'input[name="username"]', 
          'input[id*="username"]',
          'input[type="text"][id*="user"]',
          'input[type="email"]',
          'input[placeholder*="user"]',
          'input[placeholder*="email"]',
          'input[type="text"]:not([style*="display: none"])',
          'input.form-control:nth-child(1)'
        ];
        
        const passwordSelectors = [
          '#psword', 
          '#password',
          'input[name="password"]',
          'input[type="password"]',
          'input[placeholder*="password"]'
        ];
        
        const submitSelectors = [
          '#log_in',
          'input[type="submit"]',
          'button[type="submit"]',
          'button.login-button',
          'input[value="Login"]',
          'input[value="Sign In"]',
          'button:contains("Login")',
          'button:contains("Sign In")',
          'button.btn-primary'
        ];
        
        // Try each username selector until one works
        let userFieldFound = false;
        for (const selector of userNameSelectors) {
          try {
            const userField = await this.page.$(selector);
            if (userField) {
              console.log(`Found username field with selector: ${selector}`);
              await userField.click({ clickCount: 3 }); // Triple click to select all existing text
              await userField.type(username, { delay: 100 });
              userFieldFound = true;
              break;
            }
          } catch (e) {
            console.log(`Failed to use username selector ${selector}:`, e.message);
          }
        }
        
        if (!userFieldFound) {
          console.error("Could not find username field with any of the tried selectors");
          // Take screenshot to help diagnose the issue
          await this.page.screenshot({ 
            path: `login-username-field-not-found-${timestamp}-attempt-${attempt}.png`, 
            fullPage: true 
          });
          
          if (attempt < ENHANCED_MAX_RETRIES) {
            await this.handleLoginFailure(attempt);
            continue;
          } else {
            throw new Error("Could not find username field after multiple attempts");
          }
        }
        
        // Wait briefly between username and password
        await this.safeWait(1000);
        
        // Try each password selector until one works
        let passFieldFound = false;
        for (const selector of passwordSelectors) {
          try {
            const passField = await this.page.$(selector);
            if (passField) {
              console.log(`Found password field with selector: ${selector}`);
              await passField.click({ clickCount: 3 }); // Triple click to select all existing text
              await passField.type(password, { delay: 100 });
              passFieldFound = true;
              break;
            }
          } catch (e) {
            console.log(`Failed to use password selector ${selector}:`, e.message);
          }
        }
        
        if (!passFieldFound) {
          console.error("Could not find password field with any of the tried selectors");
          // Take screenshot to help diagnose the issue
          await this.page.screenshot({ 
            path: `login-password-field-not-found-${timestamp}-attempt-${attempt}.png`, 
            fullPage: true 
          });
          
          if (attempt < ENHANCED_MAX_RETRIES) {
            await this.handleLoginFailure(attempt);
            continue;
          } else {
            throw new Error("Could not find password field after multiple attempts");
          }
        }
        
        // Wait briefly before submit
        await this.safeWait(1500);
        
        // Take a screenshot before submitting form
        try {
          await this.page.screenshot({ 
            path: `login-before-submit-${timestamp}-attempt-${attempt}.png`, 
            fullPage: true 
          });
        } catch (err) {
          console.log("Screenshot failed:", err.message);
        }
        
        // Try multiple submit methods
        let submitted = false;
        
        // Method 1: Try using direct selector for submit button
        for (const selector of submitSelectors) {
          try {
            const submitButton = await this.page.$(selector);
            if (submitButton) {
              console.log(`Found submit button with selector: ${selector}`);
              
              // Try Promise.all for navigation
              try {
                await Promise.all([
                  submitButton.click(),
                  this.page.waitForNavigation({ 
                    waitUntil: 'networkidle2',
                    timeout: 45000 
                  })
                ]);
                submitted = true;
                break;
              } catch (navErr) {
                console.log(`Navigation after submit failed: ${navErr.message}, but continuing...`);
                submitted = true; // Still consider it submitted even if navigation promise fails
                break;
              }
            }
          } catch (e) {
            console.log(`Failed to use submit selector ${selector}:`, e.message);
          }
        }
        
        // Method 2: Try to submit the form directly if button click didn't work
        if (!submitted) {
          try {
            console.log("Trying to submit form directly...");
            submitted = await this.page.evaluate(() => {
              const form = document.querySelector('form');
              if (form) {
                form.submit();
                return true;
              }
              return false;
            });
            
            if (submitted) {
              console.log("Form submitted directly");
              try {
                await this.page.waitForNavigation({ 
                  waitUntil: 'networkidle2',
                  timeout: 45000 
                });
              } catch (navErr) {
                console.log(`Navigation after form submit failed: ${navErr.message}, but continuing...`);
              }
            }
          } catch (formErr) {
            console.log("Error submitting form directly:", formErr.message);
          }
        }
        
        // Method 3: Try to simulate Enter key on password field
        if (!submitted) {
          try {
            console.log("Trying to submit by pressing Enter on password field...");
            const passwordField = await this.page.$('input[type="password"]');
            if (passwordField) {
              await passwordField.press('Enter');
              submitted = true;
              console.log("Enter key pressed on password field");
              
              try {
                await this.page.waitForNavigation({ 
                  waitUntil: 'networkidle2',
                  timeout: 45000 
                });
              } catch (navErr) {
                console.log(`Navigation after Enter key failed: ${navErr.message}, but continuing...`);
              }
            }
          } catch (enterErr) {
            console.log("Error pressing Enter key:", enterErr.message);
          }
        }
        
        if (!submitted) {
          console.error("Could not submit login form with any method");
          await this.page.screenshot({ 
            path: `login-submit-failed-${timestamp}-attempt-${attempt}.png`, 
            fullPage: true 
          });
          
          if (attempt < ENHANCED_MAX_RETRIES) {
            await this.handleLoginFailure(attempt);
            continue;
          }
        }
        
        // Give page more time to fully load JavaScript and process login
        await this.safeWait(8000);
        
        // Take screenshot after login attempt for debugging
        try {
          await this.page.screenshot({ 
            path: `login-after-${timestamp}-attempt-${attempt}.png`, 
            fullPage: true 
          });
        } catch (err) {
          console.log("Screenshot failed:", err.message);
        }
        
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
            '.user-account',
            '#navUserMenu',        // CPQ specific
            '.nx-header',          // CPQ specific
            '.crm-ribbon',         // CPQ specific
            '.pc-header-right'     // CPQ specific
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
            '.login-error',
            '.field-validation-error'
          ];
          
          const errorElements = errorSelectors.flatMap(selector => 
            Array.from(document.querySelectorAll(selector))
          );
          
          const errorMessages = errorElements
            .map(el => el.textContent.trim())
            .filter(text => text.length > 0);
            
          // Check for session timeout or connection error messages in page content
          const bodyText = document.body.textContent || '';
          const sessionTimeoutDetected = bodyText.includes('session has expired') || 
                                        bodyText.includes('session timeout') ||
                                        bodyText.includes('timed out');
                                        
          const connectionErrorDetected = bodyText.includes('connection error') ||
                                         bodyText.includes('network error') ||
                                         bodyText.includes('unable to connect');
          
          return { 
            stillOnLoginPage, 
            hasLoggedInIndicators,
            errorMessages,
            sessionTimeoutDetected,
            connectionErrorDetected,
            pageTitle: document.title,
            currentUrl: window.location.href
          };
        });
        
        console.log("Login verification results:", JSON.stringify(loginVerification, null, 2));
        
        // Additional check - take HTML snapshot for debugging if needed
        if (!loginVerification.hasLoggedInIndicators || loginVerification.errorMessages.length > 0) {
          try {
            const pageHtml = await this.page.evaluate(() => document.documentElement.outerHTML);
            await fs.writeFile(`login-page-html-${timestamp}-attempt-${attempt}.txt`, pageHtml);
            console.log("Saved HTML snapshot for debugging");
          } catch (err) {
            console.log("Failed to save HTML snapshot:", err.message);
          }
        }
        
        if (!loginVerification.stillOnLoginPage && loginVerification.hasLoggedInIndicators) {
          console.log("Login successful!");
          isLoggedIn = true;
          lastLoginTime = Date.now();
          return;
        } else if (loginVerification.sessionTimeoutDetected || loginVerification.connectionErrorDetected) {
          console.log("Session timeout or connection error detected, will retry...");
          
          if (attempt < ENHANCED_MAX_RETRIES) {
            // Use longer backoff time for connection issues
            const backoffTime = Math.min(Math.pow(2, attempt) * 2000, 45000);
            console.log(`Connection issue - waiting ${backoffTime}ms before retry...`);
            await this.sleep(backoffTime);
            continue;
          }
        } else {
          console.log("Login appears to have failed:");
          console.log(`- Still on login page: ${loginVerification.stillOnLoginPage}`);
          console.log(`- Has logged-in indicators: ${loginVerification.hasLoggedInIndicators}`);
          console.log(`- Current page title: ${loginVerification.pageTitle}`);
          
          if (loginVerification.errorMessages.length > 0) {
            console.log("Error messages found:", loginVerification.errorMessages.join(' | '));
          }
          
          if (attempt < ENHANCED_MAX_RETRIES) {
            await this.handleLoginFailure(attempt);
          }
        }
      } catch (error) {
        console.error(`Login error on attempt ${attempt}:`, error);
        
        if (attempt < ENHANCED_MAX_RETRIES) {
          await this.handleLoginFailure(attempt);
        } else {
          throw new Error(`Login failed after ${ENHANCED_MAX_RETRIES} attempts: ${error.message}`);
        }
      }
    }
    
    throw new Error(`Login failed after ${ENHANCED_MAX_RETRIES} attempts`);
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