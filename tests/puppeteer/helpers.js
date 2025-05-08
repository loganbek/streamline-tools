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

// Mocks the File System Access API for testing
async function mockFileSystemAccessAPI(page, fileContent, fileName = 'test.bml') {
  await page.evaluate(
    ({ fileContent, fileName }) => {
      // Store the original showOpenFilePicker if it exists
      const originalShowOpenFilePicker = window.showOpenFilePicker;
      
      // Mock the File System Access API
      window.showOpenFilePicker = async () => {
        console.log('[MOCK] showOpenFilePicker called');
        
        // Mock file handle
        const fileHandle = {
          getFile: async () => {
            // Create a mock File object
            return new File(
              [fileContent], 
              fileName, 
              { type: 'text/plain' }
            );
          },
          name: fileName
        };
        
        return [fileHandle];
      };
      
      // Add a way to restore the original function if needed
      window.__restoreShowOpenFilePicker = () => {
        window.showOpenFilePicker = originalShowOpenFilePicker;
      };
      
      console.log('[MOCK] File System Access API mocked successfully');
    },
    { fileContent, fileName }
  );
}

class TestHelper {
  constructor() {
    this.debugUtils = new DebugUtils();
    this.cdpSession = null;     // CDP session for video recording
    this.frameBuffer = [];      // Buffer to store video frames
    this.isRecording = false;   // Recording status flag
    this.videoPath = null;      // Path to save the video
    this.recordingStartTime = null;
    this.testName = null;
    this.isPaused = false;      // Flag to indicate if recording is paused
    this.pauseStartTime = null; // Timestamp when recording was paused
    this.totalPausedTime = 0;   // Total time recording has been paused
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
      // Use page.screenshot directly instead of this.debugUtils.takeScreenshot
      await this.page.screenshot({ 
        path: `login-error-${timestamp}-attempt-${attempt}.png`, 
        fullPage: true 
      });
    } catch (err) {
      console.log("Failed to capture error screenshot:", err.message);
    }
    
    // Rest of the method remains unchanged
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
   * Sets up a page for testing by navigating to the given URL and ensuring jQuery is available
   * @param {string} url - URL to navigate to
   * @returns {Promise<void>}
   */
  async setupPage(url) {
    console.log(`Setting up page at URL: ${url}`);
    try {
      // Navigate to the URL with a generous timeout
      await this.page.goto(url, { 
        waitUntil: ['domcontentloaded', 'networkidle2'],
        timeout: 30000
      });
      
      // Wait for stable page state
      await this.waitForStableState();
      
      // Ensure jQuery is available on the page
      const jQueryAvailable = await this.page.evaluate(() => {
        return typeof $ !== 'undefined';
      });
      
      if (!jQueryAvailable) {
        console.log("jQuery not available, injecting it...");
        await this.page.addScriptTag({
          url: 'https://code.jquery.com/jquery-3.6.0.min.js'
        });
        
        // Verify jQuery was loaded correctly
        const jQueryVerified = await this.page.evaluate(() => {
          return typeof $ === 'function';
        });
        
        if (jQueryVerified) {
          console.log("jQuery successfully injected");
        } else {
          throw new Error("Failed to inject jQuery");
        }
      } else {
        console.log("jQuery already available on page");
      }
      
      console.log("Page setup completed successfully");
    } catch (error) {
      console.error("Error setting up page:", error);
      throw error;
    }
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
    const MAX_LOGIN_TIME = 120000; // 2 minutes maximum for login process
  
    // Enhanced check if already logged in
    try {
      console.log("Checking if already logged in...");
      
      await Promise.race([
        this.page.goto(process.env.BASE_URL, { 
          waitUntil: ['domcontentloaded', 'networkidle2'],
          timeout: 30000
        }),
        new Promise(resolve => setTimeout(resolve, 30000))
      ]);
      
      // Give page time to stabilize
      await this.safeWait(2000);
      
      // Improved login status check with consolidated indicators
      const isLoggedIn = await this.page.evaluate(() => {
        // Common login page elements
        const loginElements = [
          '#username', 
          '#password',
          'input[name="username"]',
          'input[type="password"]',
          'form[action*="login"]',
          'input[type="submit"][value="Login"]',
          'button[type="submit"]'
        ];
        
        // Common logged-in indicators
        const loggedInElements = [
          '.user-profile',
          '.logged-in-user',
          '.logout-button',
          '#logout',
          'a[href*="logout"]',
          '.header-user-info',
          '.user-name',
          '#navUserMenu',
          '.nx-header',
          '.crm-ribbon'
        ];
        
        // Check if any login elements exist
        const hasLoginElements = loginElements.some(selector => 
          document.querySelector(selector) !== null
        );
        
        // Check if any logged-in indicators exist
        const hasLoggedInIndicators = loggedInElements.some(selector => 
          document.querySelector(selector) !== null
        );
        
        return {
          hasLoginElements,
          hasLoggedInIndicators,
          url: window.location.href,
          title: document.title
        };
      });
      
      console.log("Login status check:", JSON.stringify(isLoggedIn, null, 2));
      
      if (!isLoggedIn.hasLoginElements && isLoggedIn.hasLoggedInIndicators) {
        console.log("Already logged in based on page indicators!");
        this.isLoggedIn = true;
        return;
      } else {
        console.log("Not logged in yet, proceeding with login...");
      }
    } catch (e) {
      console.log("Error checking login status:", e.message);
    }
  
    // Rate limiting safeguard
    const MIN_LOGIN_INTERVAL_MS = 5000; // 5 seconds
    
    if (this.lastLoginTime) {
      const timeSinceLastLogin = Date.now() - this.lastLoginTime;
      if (timeSinceLastLogin < MIN_LOGIN_INTERVAL_MS) {
        const waitTime = MIN_LOGIN_INTERVAL_MS - timeSinceLastLogin;
        console.log(`Rate limiting: Waiting ${waitTime}ms before next login attempt`);
        await this.safeWait(waitTime);
      }
    }
  
    // Optimized retry logic
    const MAX_RETRIES = 3;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Check if we've exceeded the max login time
        if (Date.now() - loginStartTime > MAX_LOGIN_TIME) {
          throw new Error(`Login timed out after ${MAX_LOGIN_TIME/1000} seconds`);
        }
        
        console.log(`Login attempt ${attempt}/${MAX_RETRIES}`);
        
        // Clear state before each attempt
        try {
          const client = await this.page.target().createCDPSession();
          await client.send('Network.clearBrowserCookies');
          await client.send('Network.clearBrowserCache');
          console.log("Cleared cookies and cache before navigation");
        } catch (e) {
          console.log("Failed to clear browser state:", e.message);
        }
        
        // Navigate to login page
        try {
          await Promise.race([
            this.page.goto(process.env.BASE_URL, { 
              waitUntil: ['domcontentloaded'],
              timeout: 30000
            }),
            new Promise(resolve => setTimeout(resolve, 30000))
          ]);
        } catch (navError) {
          console.log("Navigation timeout or error, but continuing:", navError.message);
        }
        
        // Enhanced waiting strategy
        await this.safeWait(2000);
        
        // Take a screenshot only on the final attempt
        if (attempt === MAX_RETRIES) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          try {
            await this.page.screenshot({ 
              path: `login-before-${timestamp}-final.png`, 
              fullPage: true 
            });
          } catch (err) {
            console.log("Screenshot failed:", err.message);
          }
        }
        
        // Unified login field selectors
        const userNameSelectors = ['#username', 'input[name="username"]', 'input[type="text"][id*="user"]', 'input[type="email"]'];
        const passwordSelectors = ['#password', '#psword', 'input[name="password"]', 'input[type="password"]'];
        const submitSelectors = ['#log_in', 'input[type="submit"]', 'button[type="submit"]', 'button.login-button'];
        
        // Fill username with waiting and fallback strategy
        let userFieldFound = false;
        for (const selector of userNameSelectors) {
          try {
            await this.page.waitForSelector(selector, { timeout: 5000 })
              .then(async (el) => {
                console.log(`Found username field with selector: ${selector}`);
                await el.click({ clickCount: 3 }); 
                await el.type(username, { delay: 50 });
                userFieldFound = true;
              })
              .catch(() => {});
              
            if (userFieldFound) break;
          } catch (e) {}
        }
        
        if (!userFieldFound) {
          console.log("Could not find username field with any selector");
          continue; // Try next attempt
        }
        
        // Fill password with waiting and fallback strategy
        let passFieldFound = false;
        for (const selector of passwordSelectors) {
          try {
            await this.page.waitForSelector(selector, { timeout: 5000 })
              .then(async (el) => {
                console.log(`Found password field with selector: ${selector}`);
                await el.click({ clickCount: 3 });
                await el.type(password, { delay: 50 });
                passFieldFound = true;
              })
              .catch(() => {});
              
            if (passFieldFound) break;
          } catch (e) {}
        }
        
        if (!passFieldFound) {
          console.log("Could not find password field with any selector");
          continue; // Try next attempt
        }
        
        // Submit form with multiple strategies
        let submitted = false;
        
        // 1. Try submit button click
        for (const selector of submitSelectors) {
          if (submitted) break;
          try {
            await this.page.waitForSelector(selector, { timeout: 5000 })
              .then(async (button) => {
                console.log(`Found submit button with selector: ${selector}`);
                await Promise.all([
                  button.click(),
                  this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
                    .catch(() => console.log("Navigation promise after submit resolved or timed out"))
                ]);
                submitted = true;
              })
              .catch(() => {});
          } catch (e) {}
        }
        
        // 2. If button click failed, try pressing Enter on password field
        if (!submitted) {
          try {
            const passwordField = await this.page.$('input[type="password"]');
            if (passwordField) {
              console.log("Submitting by pressing Enter on password field");
              await Promise.all([
                passwordField.press('Enter'),
                this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
                  .catch(() => console.log("Navigation after Enter key resolved or timed out"))
              ]);
              submitted = true;
            }
          } catch (e) {}
        }
        
        // 3. If that also failed, try submitting the form directly
        if (!submitted) {
          try {
            console.log("Trying to submit form directly");
            const formSubmitted = await this.page.evaluate(() => {
              const form = document.querySelector('form');
              if (form) {
                form.submit();
                return true;
              }
              return false;
            });
            
            if (formSubmitted) {
              await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
                .catch(() => console.log("Navigation after form submit resolved or timed out"));
              submitted = true;
            }
          } catch (e) {}
        }
        
        if (!submitted) {
          console.log("Could not submit login form with any method");
          continue; // Try next attempt
        }
        
        // Wait for page to load after login
        await this.safeWait(5000);
        
        // Take screenshot only on the final attempt
        if (attempt === MAX_RETRIES) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          try {
            await this.page.screenshot({ 
              path: `login-after-${timestamp}-final.png`, 
              fullPage: true 
            });
          } catch (err) {}
        }
        
        // Check login success with comprehensive verification
        const loginSuccess = await this.page.evaluate(() => {
          // Elements that indicate we're still on the login page
          const loginPageSelectors = [
            '#username', 
            '#password', 
            'input[type="password"]',
            '.login-form',
            'form[action*="login"]'
          ];
          
          // Elements that indicate we're logged in
          const loggedInSelectors = [
            '.user-profile', 
            '.logged-in-user',
            '.logout-button',
            '#logout',
            'a[href*="logout"]',
            '.user-account',
            '.header-user-info',
            '#navUserMenu'
          ];
          
          // Error message indicators
          const errorSelectors = [
            '.error', 
            '.error-message', 
            '.alert-danger', 
            '[role="alert"]', 
            '#errorMessage',
            '.login-error'
          ];
          
          const stillOnLoginPage = loginPageSelectors.some(selector => 
            document.querySelector(selector) !== null
          );
          
          const hasLoggedInIndicators = loggedInSelectors.some(selector => 
            document.querySelector(selector) !== null
          );
          
          const hasErrorMessages = errorSelectors.some(selector => {
            const el = document.querySelector(selector);
            return el && el.textContent.trim().length > 0;
          });
          
          return {
            success: !stillOnLoginPage && hasLoggedInIndicators && !hasErrorMessages,
            stillOnLoginPage,
            hasLoggedInIndicators,
            hasErrorMessages,
            url: window.location.href,
            title: document.title
          };
        });
        
        console.log("Login verification:", JSON.stringify(loginSuccess, null, 2));
        
        if (loginSuccess.success) {
          console.log("Login successful!");
          this.isLoggedIn = true;
          this.lastLoginTime = Date.now();
          return;
        }
        
        // Wait before next attempt
        if (attempt < MAX_RETRIES) {
          const backoffTime = Math.min(Math.pow(2, attempt) * 2000, 10000);
          console.log(`Login failed, waiting ${backoffTime}ms before retry...`);
          await this.sleep(backoffTime);
        }
      } catch (error) {
        console.error(`Login error on attempt ${attempt}:`, error);
        
        if (attempt < MAX_RETRIES) {
          const backoffTime = Math.min(Math.pow(2, attempt) * 2000, 10000);
          console.log(`Login error, waiting ${backoffTime}ms before retry...`);
          await this.sleep(backoffTime);
        } else {
          throw new Error(`Login failed after ${MAX_RETRIES} attempts: ${error.message}`);
        }
      }
    }
    
    throw new Error(`Login failed after ${MAX_RETRIES} attempts`);
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

  /**
   * Waits for the page to reach a stable state (no network activity, no animations)
   * @param {number} timeout - Optional timeout in milliseconds
   * @returns {Promise<void>}
   */
  async waitForStableState(timeout = 5000) {
    console.log("Waiting for stable page state...");
    try {
      // Wait for network to be idle
      await this.page.waitForNetworkIdle({ 
        idleTime: 1000, 
        timeout: timeout 
      }).catch(e => {
        console.warn("Network didn't reach idle state:", e.message);
      });
      
      // Wait for any animations to complete (common CSS animation durations)
      await this.safeWait(300);
      
      // Wait for loading indicators to disappear
      await this.page.waitForFunction(() => {
        const loadingElements = [
          '.loading-indicator', 
          '.x-mask-loading',
          '.spinner',
          '[aria-busy="true"]'
        ];
        
        return loadingElements.every(selector => !document.querySelector(selector));
      }, { timeout: timeout }).catch(e => {
        console.warn("Loading indicators may still be present:", e.message);
      });
      
      // Wait for any pending AJAX requests if jQuery is available
      await this.page.evaluate(() => {
        return new Promise(resolve => {
          if (typeof jQuery !== 'undefined') {
            // If jQuery is available, wait for all AJAX requests to complete
            if (jQuery.active === 0) {
              resolve();
            } else {
              jQuery(document).ajaxStop(resolve);
              // Timeout after 5 seconds in case ajaxStop never fires
              setTimeout(resolve, 5000);
            }
          } else {
            // If jQuery is not available, resolve immediately
            resolve();
          }
        });
      }).catch(e => console.log("AJAX wait error:", e.message));
      
      // Final small wait to ensure DOM updates are complete
      await this.safeWait(200);
      console.log("Page reached stable state");
    } catch (error) {
      console.warn(`Warning in waitForStableState: ${error.message}`);
      // Don't fail the test if this method encounters an error
    }
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
   * Start video recording for the current test using native Puppeteer capabilities
   * @param {string} testName - Name of the test being recorded (optional)
   * @param {string} customPath - Custom path to save the video file (optional)
   * @returns {Promise<boolean>} - Whether recording started successfully
   */
  async startRecording(testName, customPath = null) {
    if (this.isRecording) {
      console.log('Video recording already in progress');
      return true;
    }
    
    try {
      // Set test name and video path
      this.testName = testName || `test-${Date.now()}`;
      const sanitizedTestName = this.testName.replace(/[^a-zA-Z0-9-_]/g, '_');
      const videoDir = 'test-videos';

      // Create videos directory if it doesn't exist
      await fs.mkdir(videoDir, { recursive: true }).catch(err => {
        if (err.code !== 'EEXIST') throw err;
      });

      if (customPath) {
        // Remove any local user-specific path information from custom path
        const filename = path.basename(customPath);
        this.videoPath = path.join(videoDir, filename);
      } else {
        this.videoPath = path.join(videoDir, `${sanitizedTestName}-${Date.now()}.webm`);
      }
      
      console.log(`Starting video recording for test: ${this.testName}`);
      // Only log the filename for privacy
      console.log(`Video will be saved as: ${path.basename(this.videoPath)}`);
      
      // Access the Chrome DevTools Protocol (CDP) session
      this.cdpSession = await this.page.target().createCDPSession();
      
      // Start screencast using CDP
      await this.cdpSession.send('Page.startScreencast', {
        format: 'jpeg',
        quality: 90,
        everyNthFrame: 1
      });
      
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      this.frameBuffer = [];
      this.isPaused = false;
      this.pauseStartTime = null;
      this.totalPausedTime = 0;
      
      // Set up event listener for screencast frames
      this.cdpSession.on('Page.screencastFrame', async (frameObject) => {
        // Only add frames if not paused
        if (!this.isPaused) {
          // Acknowledge the frame to receive more frames
          await this.cdpSession.send('Page.screencastFrameAck', {
            sessionId: frameObject.sessionId
          }).catch(e => console.error(`Error acknowledging frame: ${e.message}`));
          
          // Store the frame data and metadata (only if recording is active)
          if (this.isRecording) {
            this.frameBuffer.push({
              data: frameObject.data,
              timestamp: Date.now() - this.recordingStartTime - this.totalPausedTime,
              metadata: {
                width: frameObject.metadata.width,
                height: frameObject.metadata.height
              }
            });
          }
        } else {
          // Still need to acknowledge frames when paused
          await this.cdpSession.send('Page.screencastFrameAck', {
            sessionId: frameObject.sessionId
          }).catch(e => console.error(`Error acknowledging paused frame: ${e.message}`));
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error starting video recording:', error);
      this.isRecording = false;
      return false;
    }
  }

  /**
   * Stop video recording and save frames as video file
   * @param {boolean} saveVideo - Whether to keep the video (true) or delete it (false)
   * @returns {Promise<string|null>} Path to the saved video or null if recording failed/wasn't saved
   */
  async stopRecording(saveVideo = true) {
    if (!this.isRecording || !this.cdpSession) {
      console.log('No video recording in progress, nothing to stop');
      return null;
    }
    
    try {
      console.log('Stopping video recording...');
      this.isRecording = false;
      
      // If recording was paused, update total paused time
      if (this.isPaused && this.pauseStartTime) {
        this.totalPausedTime += (Date.now() - this.pauseStartTime);
        this.pauseStartTime = null;
        this.isPaused = false;
      }
      
      // Stop the screencast
      await this.cdpSession.send('Page.stopScreencast')
        .catch(e => console.error('Error stopping screencast:', e.message));
      
      const recordingDuration = (Date.now() - this.recordingStartTime - this.totalPausedTime) / 1000;
      console.log(`Video recording stopped after ${recordingDuration.toFixed(2)} seconds with ${this.frameBuffer.length} frames`);
      
      if (!saveVideo || this.frameBuffer.length === 0) {
        console.log('Not saving video recording');
        this.frameBuffer = [];
        this.recordingStartTime = null;
        this.totalPausedTime = 0;
        this.cdpSession = null;
        return null;
      }
      
      console.log(`Saving video to: ${this.videoPath}`);
      
      // Use ffmpeg to convert frames to video if available
      try {
        // Save frames to temporary directory
        const fs = require('fs');
        const path = require('path');
        const os = require('os');
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);
        
        // Create temp directory for frames
        const tempDir = path.join(os.tmpdir(), `video-frames-${Date.now()}`);
        fs.mkdirSync(tempDir, { recursive: true });
        
        // Write frames to disk
        console.log(`Writing ${this.frameBuffer.length} frames to temporary directory: ${tempDir}`);
        for (let i = 0; i < this.frameBuffer.length; i++) {
          const frame = this.frameBuffer[i];
          const frameData = Buffer.from(frame.data, 'base64');
          fs.writeFileSync(path.join(tempDir, `frame-${i.toString().padStart(6, '0')}.jpg`), frameData);
        }
        
        // Generate timestamp file for variable framerate support
        const timestampFile = path.join(tempDir, 'timestamps.txt');
        let timestampContent = '';
        for (let i = 0; i < this.frameBuffer.length; i++) {
          // Convert timestamp from ms to seconds for ffmpeg
          const timestamp = this.frameBuffer[i].timestamp / 1000;
          timestampContent += `file 'frame-${i.toString().padStart(6, '0')}.jpg'\nduration ${i > 0 ? (timestamp - this.frameBuffer[i-1].timestamp/1000).toFixed(3) : 0.04}\n`;
        }
        // Add final entry with same duration as the one before it
        if (this.frameBuffer.length > 0) {
          timestampContent += `file 'frame-${(this.frameBuffer.length-1).toString().padStart(6, '0')}.jpg'\n`;
        }
        fs.writeFileSync(timestampFile, timestampContent);
        
        // Build ffmpeg command to convert frames to video using the timestamp file for accurate timing
        const ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${timestampFile}" -c:v libvpx-vp9 -pix_fmt yuv420p -auto-alt-ref 0 "${this.videoPath}"`;
        
        console.log(`Running ffmpeg command: ${ffmpegCmd}`);
        await execPromise(ffmpegCmd);
        
        // Clean up temp files
        console.log('Cleaning up temporary frame files');
        for (let i = 0; i < this.frameBuffer.length; i++) {
          const framePath = path.join(tempDir, `frame-${i.toString().padStart(6, '0')}.jpg`);
          fs.unlinkSync(framePath);
        }
        fs.unlinkSync(timestampFile);
        fs.rmdirSync(tempDir);
        
        // Verify the video file exists and has content
        if (fs.existsSync(this.videoPath)) {
          const stats = fs.statSync(this.videoPath);
          if (stats.size > 0) {
            console.log(`Video successfully saved: ${stats.size} bytes`);
            const savedPath = this.videoPath;
            
            // Reset recording state
            this.frameBuffer = [];
            this.recordingStartTime = null;
            this.totalPausedTime = 0;
            this.videoPath = null;
            this.cdpSession = null;
            
            return savedPath;
          }
        }
      } catch (ffmpegError) {
        console.error('Error using ffmpeg to create video:', ffmpegError);
        console.log('Falling back to saving frames as individual images...');
        
        // Fallback: Save frames as individual images
        const fs = require('fs');
        const path = require('path');
        
        // Create directory for frames
        const framesDir = `${this.videoPath.replace(/\.\w+$/, '')}-frames`;
        fs.mkdirSync(framesDir, { recursive: true });
        
        // Save frames as individual images
        for (let i = 0; i < this.frameBuffer.length; i++) {
          const frame = this.frameBuffer[i];
          const frameData = Buffer.from(frame.data, 'base64');
          fs.writeFileSync(path.join(framesDir, `frame-${i.toString().padStart(6, '0')}.jpg`), frameData);
        }
        
        console.log(`Saved ${this.frameBuffer.length} frames to ${framesDir}`);
      }
      
      // Reset recording state
      this.frameBuffer = [];
      this.recordingStartTime = null;
      this.totalPausedTime = 0;
      this.videoPath = null;
      this.cdpSession = null;
      
      return null;
    } catch (error) {
      console.error('Error stopping video recording:', error);
      this.isRecording = false;
      this.frameBuffer = [];
      this.recordingStartTime = null;
      this.totalPausedTime = 0;
      this.videoPath = null;
      this.cdpSession = null;
      return null;
    }
  }

  /**
   * Pause video recording temporarily
   * @returns {Promise<boolean>} Whether the recording was successfully paused
   */
  async pauseRecording() {
    if (!this.isRecording || this.isPaused || !this.cdpSession) {
      console.log('Cannot pause recording: recording is not active or already paused');
      return false;
    }

    try {
      console.log('Pausing video recording...');
      this.isPaused = true;
      this.pauseStartTime = Date.now();
      
      // Stop receiving frames from CDP session
      await this.cdpSession.send('Page.stopScreencast')
        .catch(e => console.error('Error stopping screencast while pausing:', e.message));
      
      console.log('Video recording paused successfully');
      return true;
    } catch (error) {
      console.error('Failed to pause video recording:', error);
      return false;
    }
  }

  /**
   * Resume a paused video recording
   * @returns {Promise<boolean>} Whether the recording was successfully resumed
   */
  async resumeRecording() {
    if (!this.isRecording || !this.isPaused || !this.cdpSession) {
      console.log('Cannot resume recording: recording is not active or not paused');
      return false;
    }

    try {
      console.log('Resuming video recording...');
      
      // Calculate total pause duration
      if (this.pauseStartTime) {
        this.totalPausedTime += (Date.now() - this.pauseStartTime);
        this.pauseStartTime = null;
      }
      
      // Restart screencast
      await this.cdpSession.send('Page.startScreencast', {
        format: 'jpeg',
        quality: 90,
        everyNthFrame: 1
      });
      
      this.isPaused = false;
      console.log('Video recording resumed successfully');
      return true;
    } catch (error) {
      console.error('Failed to resume video recording:', error);
      return false;
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

  /**
   * Setup file picker mock for a specific test
   */
  async setupFileMock(content, fileName) {
    await mockFileSystemAccessAPI(this.page, content, fileName);
    console.log(`Mocked file picker for "${fileName}" with content length: ${content.length}`);
  }

  async login(username, password, loginButtonSelector = '#login-button', maxAttempts = 3) {
    let attempt = 0;
    let success = false;

    console.log(`Attempting login for user: ${username}`);
    
    while (!success && attempt < maxAttempts) {
      attempt++;
      console.log(`Login attempt ${attempt}/${maxAttempts}`);
      
      try {
        // Ensure we're on a stable page before attempting login
        await this.waitForStableState();
        
        // Use Puppeteer methods instead of jQuery to avoid dependency issues
        await this.page.waitForSelector('#username', { timeout: 10000 });
        await this.page.waitForSelector('#password', { timeout: 10000 });
        await this.page.waitForSelector(loginButtonSelector, { timeout: 10000 });
        
        // Clear fields first in case there's existing text
        await this.page.evaluate(() => {
          document.querySelector('#username').value = '';
          document.querySelector('#password').value = '';
        });

        // Type credentials with delays to simulate real user behavior
        await this.page.type('#username', username, { delay: 50 });
        await this.page.type('#password', password, { delay: 50 });
        
        // Take screenshot before login
        const beforeTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await this.page.screenshot({ 
          path: `login-before-${beforeTimestamp}.png`, 
          fullPage: true 
        });
        
        // Click the login button and wait for navigation
        await Promise.all([
          this.page.click(loginButtonSelector),
          // Wait for either navigation or an error message
          this.page.waitForNavigation({ timeout: 20000, waitUntil: 'networkidle2' })
            .catch(e => console.log('Navigation may not have completed, continuing...'))
        ]);
        
        // Take a screenshot after login attempt
        const afterTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await this.page.screenshot({ 
          path: `login-after-${afterTimestamp}.png`, 
          fullPage: true 
        });
        
        // Check if login was successful by looking for common success indicators
        const loginSuccessful = await this.page.evaluate(() => {
          // Check if we're redirected to a dashboard or home page
          const url = window.location.href;
          const logoutButton = document.querySelector('.logout-button, .sign-out, #logout');
          const errorMessages = document.querySelectorAll('.error-message, .alert-danger');
          
          // Return true if we see logout button and no error messages
          return (logoutButton !== null && errorMessages.length === 0) || 
                 url.includes('dashboard') || url.includes('home');
        });
        
        if (loginSuccessful) {
          console.log('Login successful!');
          success = true;
          break;
        } else {
          console.log(`Login attempt ${attempt} failed, checking for error messages...`);
          
          // Take a screenshot of the login error
          const errorTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
          await this.page.screenshot({ 
            path: `login-error-${errorTimestamp}-attempt-${attempt}.png`, 
            fullPage: true 
          });
          
          // Pause briefly before next attempt
          await this.sleep(2000);
        }
      } catch (error) {
        console.error(`Error during login attempt ${attempt}:`, error.message);
        
        // Take screenshot on error
        const errorTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await this.page.screenshot({ 
          path: `login-error-${errorTimestamp}-attempt-${attempt}.png`, 
          fullPage: true 
        });
        
        await this.sleep(2000);
      }
    }
    
    if (!success) {
      throw new Error(`Failed to login after ${maxAttempts} attempts`);
    }
    
    return success;
  }

  /**
   * Set up a new page with common configurations
   * @returns {Promise<Page>} The configured page
   */
  async setupPage() {
    console.log('Setting up new page...');
    
    // Create a new page if one doesn't exist
    if (!this.page) {
      this.page = await this.browser.newPage();
    }
    
    // Configure viewport for consistent testing
    await this.page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });
    
    // Set default navigation timeout
    this.page.setDefaultNavigationTimeout(30000);
    
    // Set up console logging from the browser
    this.page.on('console', message => {
      console.log(`Browser console [${message.type()}]: ${message.text()}`);
    });
    
    // Handle page errors
    this.page.on('pageerror', error => {
      console.error('Page error:', error.message);
    });
    
    // Add debugging utils to the page
    this.debugUtils = {
      takeScreenshot: async (name) => {
        try {
          const timestamp = name || `debug-${Date.now()}`;
          await this.page.screenshot({
            path: `${timestamp}-final.png`,
            fullPage: true
          });
        } catch (error) {
          console.warn(`Failed to take screenshot: ${error.message}`);
        }
      }
    };
    
    return this.page;
  }

  /**
   * Waits for the page to reach a stable state (no network activity, no animations)
   * @param {number} timeout - Optional timeout in milliseconds
   * @returns {Promise<void>}
   */
  async waitForStableState(timeout = 5000) {
    console.log("Waiting for stable page state...");
    try {
      // Wait for network to be idle
      await this.page.waitForNetworkIdle({ 
        idleTime: 1000, 
        timeout: timeout 
      }).catch(e => {
        console.warn("Network didn't reach idle state:", e.message);
      });
      
      // Wait for any animations to complete (common CSS animation durations)
      await this.safeWait(300);
      
      // Wait for loading indicators to disappear
      await this.page.waitForFunction(() => {
        const loadingElements = [
          '.loading-indicator', 
          '.x-mask-loading',
          '.spinner',
          '[aria-busy="true"]'
        ];
        
        return loadingElements.every(selector => !document.querySelector(selector));
      }, { timeout: timeout }).catch(e => {
        console.warn("Loading indicators may still be present:", e.message);
      });
      
      // Wait for any pending AJAX requests if jQuery is available
      await this.page.evaluate(() => {
        return new Promise(resolve => {
          if (typeof jQuery !== 'undefined') {
            // If jQuery is available, wait for all AJAX requests to complete
            if (jQuery.active === 0) {
              resolve();
            } else {
              jQuery(document).ajaxStop(resolve);
              // Timeout after 5 seconds in case ajaxStop never fires
              setTimeout(resolve, 5000);
            }
          } else {
            // If jQuery is not available, resolve immediately
            resolve();
          }
        });
      }).catch(e => console.log("AJAX wait error:", e.message));
      
      // Final small wait to ensure DOM updates are complete
      await this.safeWait(200);
      console.log("Page reached stable state");
    } catch (error) {
      console.warn(`Warning in waitForStableState: ${error.message}`);
      // Don't fail the test if this method encounters an error
    }
  }

  /**
   * Wait for the page to reach a stable state
   * @returns {Promise<void>}
   */
  async waitForStableState() {
    console.log("Waiting for stable page state...");
    try {
      // Wait for any network activity to settle
      await this.page.waitForNetworkIdle({
        idleTime: 500,
        timeout: 10000
      }).catch(e => console.log("Network idle timeout:", e.message));

      // Wait for any animations to complete (common CSS animation durations)
      await this.safeWait(300);

      // Wait for any pending AJAX requests
      await this.page.evaluate(() => {
        return new Promise(resolve => {
          if (typeof jQuery !== 'undefined') {
            // If jQuery is available, wait for all AJAX requests to complete
            if (jQuery.active === 0) {
              resolve();
            } else {
              jQuery(document).ajaxStop(resolve);
              // Timeout after 5 seconds in case ajaxStop never fires
              setTimeout(resolve, 5000);
            }
          } else {
            // If jQuery is not available, resolve immediately
            resolve();
          }
        });
      }).catch(e => console.log("AJAX wait error:", e.message));

      // Final small wait to ensure DOM updates are complete
      await this.safeWait(200);
      console.log("Page appears stable");
    } catch (error) {
      console.warn(`Warning in waitForStableState: ${error.message}`);
      // Don't fail the test if this method encounters an error
    }
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
   * Start recording the current test
   * @param {string} testName - Name of the test being recorded
   * @returns {Promise<void>}
   */
  async startRecording(testName) {
    if (this.recorder) {
      console.log('Video recorder already running, stopping previous recording');
      await this.stopRecording();
    }

    try {
      const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
      const path = require('path');
      const fs = require('fs');
      
      // Create directory if it doesn't exist
      const videoDir = path.join(__dirname, 'test-videos');
      if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
        console.log(`Created video directory: ${videoDir}`);
      }
      
      this.testName = testName || `test-${Date.now()}`;
      const sanitizedTestName = this.testName.replace(/[^a-zA-Z0-9-_]/g, '_');
      this.videoPath = path.join(videoDir, `${sanitizedTestName}-${Date.now()}.mp4`);
      
      const config = {
        followNewTab: true,
        fps: 25,
        videoFrame: {
          width: 1280,
          height: 720
        },
        aspectRatio: '16:9'
      };
      
      console.log(`Starting video recording for test: ${this.testName}`);
      console.log(`Video will be saved to: ${this.videoPath}`);
      
      this.recorder = new PuppeteerScreenRecorder(this.page, config);
      await this.recorder.start(this.videoPath);
      this.recordingStartTime = Date.now();
      console.log('Video recording started successfully');
      return true;
    } catch (error) {
      console.error('Failed to start video recording:', error);
      this.recorder = null;
      this.videoPath = null;
      return false;
    }
  }
  
  /**
   * Stop recording the current test
   * @returns {Promise<string|null>} Path to the recorded video or null if recording failed
   */
  async stopRecording() {
    if (!this.recorder) {
      console.log('No video recorder running, nothing to stop');
      return null;
    }
    
    try {
      console.log('Stopping video recording...');
      await this.recorder.stop();
      
      const recordingDuration = (Date.now() - this.recordingStartTime) / 1000;
      console.log(`Video recording stopped after ${recordingDuration.toFixed(2)} seconds`);
      console.log(`Video saved to: ${this.videoPath}`);
      
      const fs = require('fs');
      // Verify the video file exists and has content
      if (fs.existsSync(this.videoPath)) {
        const stats = fs.statSync(this.videoPath);
        if (stats.size > 0) {
          console.log(`Video file verified: ${stats.size} bytes`);
          const returnPath = this.videoPath;
          this.recorder = null;
          this.videoPath = null;
          this.recordingStartTime = null;
          return returnPath;
        } else {
          console.error('Video file exists but is empty');
        }
      } else {
        console.error('Video file was not created');
      }
      
      return null;
    } catch (error) {
      console.error('Error stopping video recording:', error);
      this.recorder = null;
      this.videoPath = null;
      this.recordingStartTime = null;
      return null;
    }
  }
}

module.exports = { getExtensionId, TestHelper };
