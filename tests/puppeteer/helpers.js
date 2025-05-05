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
  
  return sharedBrowser;
}

class TestHelper {
  constructor() {
    this.debugUtils = new DebugUtils();
    this.recorder = null; // Add recorder property
    this.videoPath = null; // Add video path property
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
        await this.page.waitForTimeout(waitTime);
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
  
    // Check if already logged in by trying to access a protected page
    try {
      console.log("Checking if already logged in...");
      
      // Add a longer timeout and more resilient navigation
      await Promise.race([
        this.page.goto(process.env.BASE_URL, { 
          waitUntil: 'domcontentloaded', // Less strict waiting condition
          timeout: 60000  // Longer timeout
        }),
        new Promise(resolve => setTimeout(resolve, 60000))
      ]);
      
      // Give more time for JavaScript frameworks to initialize
      await this.page.waitForTimeout(5000);
      
      // Check if we're already on a logged-in page
      const title = await this.page.title();
      console.log(`Current page title: ${title}`);
      
      // If we see login form elements, we're not logged in
      const hasLoginForm = await this.page.evaluate(() => {
        return !!document.querySelector('#username') || 
               !!document.querySelector('#psword') || 
               !!document.querySelector('input[type="password"]');
      });
      
      if (!hasLoginForm && (title.includes('Home') || title.includes('Profile') || title.includes('Admin'))) {
        console.log("Already logged in!");
        isLoggedIn = true;
        return;
      } else {
        console.log("Not logged in yet, proceeding with login...");
      }
    } catch (e) {
      console.log("Error checking login status:", e.message);
      console.log("Proceeding with login attempt...");
    }
  
    // Implement login with retries and backoff
    for (let attempt = 1; attempt <= MAX_LOGIN_RETRIES; attempt++) {
      try {
        await this.waitForLoginCooldown();
        
        console.log(`Login attempt ${attempt}/${MAX_LOGIN_RETRIES}`);
        
        // More robust page navigation with error handling
        try {
          await Promise.race([
            this.page.goto(process.env.BASE_URL, { 
              waitUntil: 'domcontentloaded', // Change from networkidle2 to domcontentloaded for faster response
              timeout: 60000
            }),
            new Promise(resolve => setTimeout(resolve, 60000))
          ]);
        } catch (navError) {
          console.log("Navigation timeout or error, but continuing:", navError.message);
          // Take screenshot on navigation error
          await this.page.screenshot({ 
            path: `login-navigation-error-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, 
            fullPage: true 
          });
        }
        
        // Wait for page to stabilize
        await this.page.waitForTimeout(3000);
        
        // Wait for and fill in login form with better error handling
        console.log("Waiting for login form...");
        
        // More resilient selector waiting with longer timeouts
        const usernameSelector = await Promise.race([
          this.page.waitForSelector('#username', { timeout: 30000 }).catch(() => null),
          this.page.waitForSelector('input[name="username"]', { timeout: 30000 }).catch(() => null),
          this.page.waitForSelector('input[type="text"][id*="user"]', { timeout: 30000 }).catch(() => null)
        ]);
        
        if (!usernameSelector) {
          console.error("Username field not found after waiting");
          await this.page.screenshot({ 
            path: `login-form-missing-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, 
            fullPage: true 
          });
          throw new Error("Username field not found on login page");
        }
        
        // Clear the input field first
        await this.page.evaluate(() => {
          const usernameField = document.querySelector('#username') || 
                              document.querySelector('input[name="username"]') || 
                              document.querySelector('input[type="text"][id*="user"]');
          if (usernameField) usernameField.value = '';
        });
        
        // Try multiple focus methods to ensure the field is active
        await this.page.evaluate(() => {
          const usernameField = document.querySelector('#username') || 
                              document.querySelector('input[name="username"]') || 
                              document.querySelector('input[type="text"][id*="user"]');
          if (usernameField) {
            usernameField.focus();
            usernameField.click();
          }
        });
        
        console.log("Entering username:", username);
        await usernameSelector.type(username, { delay: 100 }); // Increase typing delay
        
        // Make sure to wait after typing username before looking for password field
        await this.page.waitForTimeout(1000);
        
        // Wait specifically for the password field with better resilience
        console.log("Waiting for password field...");
        const passwordSelector = await Promise.race([
          this.page.waitForSelector('#psword', { timeout: 30000 }).catch(() => null),
          this.page.waitForSelector('#password', { timeout: 30000 }).catch(() => null),
          this.page.waitForSelector('input[type="password"]', { timeout: 30000 }).catch(() => null)
        ]);
        
        if (!passwordSelector) {
          console.error("Password field not found after waiting");
          await this.page.screenshot({ 
            path: `password-field-missing-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, 
            fullPage: true 
          });
          throw new Error("Password field not found on login page");
        }
        
        // Clear the input field first
        await this.page.evaluate(() => {
          const passwordField = document.querySelector('#psword') || 
                              document.querySelector('#password') || 
                              document.querySelector('input[type="password"]');
          if (passwordField) passwordField.value = '';
        });
        
        // Try multiple focus methods to ensure the field is active
        await this.page.evaluate(() => {
          const passwordField = document.querySelector('#psword') || 
                              document.querySelector('#password') || 
                              document.querySelector('input[type="password"]');
          if (passwordField) {
            passwordField.focus();
            passwordField.click();
          }
        });
        
        console.log("Entering password...");
        await passwordSelector.type(password, { delay: 100 }); // Increase typing delay
        
        // Wait after entering password
        await this.page.waitForTimeout(1000);
        
        // First, dump the HTML structure to help debug the form
        const formStructure = await this.page.evaluate(() => {
          // Get form-related elements
          const formElements = document.querySelectorAll('form, button, input[type="submit"], input[type="button"]');
          const formInfo = [];
          
          formElements.forEach((el) => {
            const tagName = el.tagName;
            const id = el.id || 'no-id';
            const className = el.className || 'no-class';
            const type = el.type || 'n/a';
            const value = el.value || 'n/a';
            const text = el.textContent ? el.textContent.trim().substring(0, 50) : 'n/a';
            
            formInfo.push(`${tagName} - ID: ${id}, Class: ${className}, Type: ${type}, Value: ${value}, Text: ${text}`);
          });
          
          return formInfo.join('\n');
        });
        
        console.log("Form structure for debugging:\n", formStructure);
        
        // Look specifically for the "Continue to iterate?" button or text
        const continueButtonInfo = await this.page.evaluate(() => {
          // Look for any text mentioning "continue to iterate"
          const allElements = Array.from(document.querySelectorAll('*'));
          const elementsWithContinueText = allElements.filter(el => {
            const text = el.textContent || '';
            return text.toLowerCase().includes('continue to iterate');
          });
          
          if (elementsWithContinueText.length > 0) {
            return {
              found: true,
              count: elementsWithContinueText.length,
              text: elementsWithContinueText.map(el => ({
                tag: el.tagName,
                text: el.textContent.trim(),
                isClickable: el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'INPUT'
              }))
            };
          } else {
            return { found: false };
          }
        });
        
        if (continueButtonInfo.found) {
          console.log("Found 'Continue to iterate?' text:", JSON.stringify(continueButtonInfo, null, 2));
        }
        
        // Find submit button with more resilient selectors
        const submitSelector = [
          '#log_in', 
          'input[type="submit"]',
          'button[type="submit"]',
          'button.login-button',
          'button:contains("Login")',
          'button:contains("Sign In")',
          'input[value="Login"]',
          'input[value="Sign In"]'
        ].join(', ');
        
        // Check if standard submit button exists
        const submitExists = await this.page.evaluate((selector) => {
          return !!document.querySelector(selector);
        }, submitSelector);
        
        if (submitExists) {
          // If regular submit button exists, click it
          console.log("Clicking standard login button...");
          
          await this.page.evaluate((selector) => {
            const button = document.querySelector(selector);
            if (button) {
              button.scrollIntoView({ behavior: 'smooth', block: 'center' });
              setTimeout(() => button.click(), 500);
            }
          }, submitSelector);
        } else {
          console.log("Standard submit button not found, looking for 'Continue to iterate?' button");
          // Take screenshot for debugging
          await this.page.screenshot({ 
            path: `login-failure-${new Date().toISOString().replace(/[:.]/g, '-')}-attempt-${attempt}.png`, 
            fullPage: true 
          });
          
          // Enhanced method to find and click the "Continue to iterate?" button
          const continueBtnClicked = await this.page.evaluate(() => {
            // More aggressive approach to find the button
            
            // 1. Try direct text search first (case insensitive)
            const textSearch = (text) => {
              text = text.toLowerCase();
              return Array.from(document.querySelectorAll('button, a, input[type="submit"], input[type="button"], .btn, .button'))
                .find(el => (el.textContent && el.textContent.toLowerCase().includes(text)) || 
                           (el.value && el.value.toLowerCase().includes(text)));
            };
            
            // Try multiple text variations to find the button
            const continueBtn = 
              textSearch('continue to iterate?') || 
              textSearch('continue to iterate') || 
              textSearch('continue') ||
              // Sometimes the text might be in a span inside the button
              Array.from(document.querySelectorAll('button, a, .btn'))
                .find(el => Array.from(el.querySelectorAll('*'))
                  .some(child => child.textContent && 
                    (child.textContent.toLowerCase().includes('continue to iterate') ||
                     child.textContent.toLowerCase().includes('continue'))));
            
            if (continueBtn) {
              // Try different clicking methods
              try {
                console.log("Found continue button:", continueBtn.outerHTML);
                
                // Generate synthetic click event
                const clickEvent = new MouseEvent('click', {
                  bubbles: true,
                  cancelable: true,
                  view: window
                });
                
                // 1. Try dispatchEvent
                continueBtn.dispatchEvent(clickEvent);
                
                // 2. Try direct click
                setTimeout(() => continueBtn.click(), 200);
                
                // 3. If it's a link, try simulating href navigation
                if (continueBtn.tagName === 'A' && continueBtn.href) {
                  setTimeout(() => {
                    console.log("Using link navigation:", continueBtn.href);
                    window.location.href = continueBtn.href;
                  }, 400);
                }
                
                // 4. If it's in a form, try submitting the form
                const form = continueBtn.closest('form');
                if (form) {
                  setTimeout(() => form.submit(), 600);
                }
                
                return true;
              } catch (e) {
                console.error("Error clicking continue button:", e);
                return false;
              }
            }
            
            // Try to find and submit any form as last resort
            const loginForm = document.querySelector('form');
            if (loginForm) {
              console.log("Trying direct form submission");
              try {
                loginForm.submit();
                return true;
              } catch (e) {
                console.error("Error submitting form:", e);
                return false;
              }
            }
            
            return false;
          });
          
          if (continueBtnClicked) {
            console.log("Successfully found and clicked 'Continue' button or submitted form");
          } else {
            console.error("Failed to find any clickable Continue button or form");
            
            // As last resort, try pressing Enter key in the password field
            console.log("Trying Enter key in password field as last resort");
            try {
              await passwordSelector.press('Enter');
              console.log("Pressed Enter key in password field");
            } catch (e) {
              console.error("Error pressing Enter key:", e);
            }
          }
        }
        
        // Wait for navigation after login attempt with extended timeout
        console.log("Waiting for navigation after login attempt...");
        try {
          await Promise.race([
            this.page.waitForNavigation({ 
              waitUntil: 'domcontentloaded', 
              timeout: 60000 
            }),
            new Promise(resolve => setTimeout(resolve, 60000))
          ]);
          
          // Give page some time to fully load JavaScript
          await this.page.waitForTimeout(5000);
        } catch (e) {
          console.log("Navigation timeout after login attempt:", e.message);
        }
        
        // Check if login was successful by checking for username/password fields
        const stillOnLoginPage = await this.page.evaluate(() => {
          return !!document.querySelector('#username') || 
                 !!document.querySelector('#password') ||
                 !!document.querySelector('#psword') ||
                 !!document.querySelector('input[type="password"]');
        });
        
        if (!stillOnLoginPage) {
          console.log("Login successful!");
          isLoggedIn = true;
          lastLoginTime = Date.now();
          return;
        } else {
          console.log("Still on login page, login failed");
          if (attempt < MAX_LOGIN_RETRIES) {
            await this.handleLoginFailure(attempt);
          }
        }
      } catch (error) {
        console.error(`Login attempt ${attempt} failed with error:`, error);
        
        // Take screenshot of the error state
        await this.page.screenshot({ 
          path: `login-error-${new Date().toISOString().replace(/[:.]/g, '-')}-attempt-${attempt}.png`, 
          fullPage: true 
        });
        
        if (attempt < MAX_LOGIN_RETRIES) {
          await this.handleLoginFailure(attempt);
        } else {
          throw new Error(`Failed to login after ${MAX_LOGIN_RETRIES} attempts: ${error.message}`);
        }
      }
    }
    
    throw new Error(`Failed to login after ${MAX_LOGIN_RETRIES} attempts`);
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
          timeout: 30000
        });
        
        // Wait a moment for any page initialization
        await this.page.waitForTimeout(2000);
        
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
          await this.page.reload({ waitUntil: 'networkidle2', timeout: 20000 });
          await this.page.waitForTimeout(2000);
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
      await this.page.waitForTimeout(3000); // Wait to view the page
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
          await this.page.waitForTimeout(2000);
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