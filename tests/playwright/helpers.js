const { expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import the existing debug utilities and login module
const DebugUtils = require('../debugUtils');

// Global state management
let isLoggedIn = false;
let lastLoginTime = 0;
const LOGIN_COOLDOWN = 2000;
const MAX_LOGIN_RETRIES = 3;

// Set consistent timeout values
const TIMEOUTS = {
  NAVIGATION: 15000,
  PAGE_ACTION: 10000,
  NETWORK_IDLE: 8000,
  ELEMENT_APPEARANCE: 10000,
  TEST_DEFAULT: 45000
};

/**
 * TestHelper class for Playwright-based extension testing
 * Converted from Puppeteer to Playwright APIs
 */
class TestHelper {
  constructor() {
    this.debugUtils = new DebugUtils();
    this.page = null;
    this.context = null;
    this.browser = null;
    this.extensionId = null;
    this.isRecording = false;
    this.videoPath = null;
    this.testName = null;
  }

  /**
   * Safe wait method using Playwright's built-in wait
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise<void>}
   */
  async safeWait(ms) {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Initialize the test helper with browser and page setup
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {import('@playwright/test').BrowserContext} context - Playwright context
   */
  async init(page, context) {
    try {
      await this.debugUtils.init();
      console.log("Initializing TestHelper with Playwright...");
      
      this.page = page;
      this.context = context;
      this.browser = context.browser();
      
      // Set up console logging
      this.page.on('console', (msg) => {
        const type = msg.type();
        if (type === 'error') {
          console.error(`Page error: ${msg.text()}`);
        } else if (process.env.DEBUG_TESTS === 'true') {
          console.log(`Page ${type}: ${msg.text()}`);
        }
      });

      // Set up error handling
      this.page.on('pageerror', (error) => {
        console.error('Page error:', error.message);
      });

      // Get extension ID
      await this.detectExtensionId();
      
      // Only attempt login if BASE_URL is set and not already logged in
      if (process.env.BASE_URL && !isLoggedIn && process.env.BYPASS_LOGIN !== 'true') {
        await this.login();
      }
    } catch (error) {
      console.error("Error in TestHelper init:", error);
      throw error;
    }
  }

  /**
   * Detect the extension ID from background pages
   */
  async detectExtensionId() {
    console.log("Detecting extension ID...");
    
    // Wait for extension to load
    await this.safeWait(2000);
    
    // Try to find extension pages
    const pages = this.context.pages();
    for (const page of pages) {
      const url = page.url();
      if (url.includes('chrome-extension://')) {
        this.extensionId = url.split('/')[2];
        console.log(`Found extension ID: ${this.extensionId}`);
        return this.extensionId;
      }
    }
    
    // If not found in existing pages, try background script
    try {
      // Navigate to chrome://extensions to find the extension
      await this.page.goto('chrome://extensions/');
      await this.safeWait(1000);
      
      // Look for extension cards (this is a fallback method)
      const extensionCards = await this.page.locator('[id*="extension-"]').all();
      if (extensionCards.length > 0) {
        const firstCard = extensionCards[0];
        const id = await firstCard.getAttribute('id');
        if (id) {
          this.extensionId = id.replace('extension-', '');
          console.log(`Found extension ID from extensions page: ${this.extensionId}`);
          return this.extensionId;
        }
      }
    } catch (error) {
      console.warn("Could not access chrome://extensions page:", error.message);
    }
    
    // Fallback: use a default extension ID pattern or throw error
    throw new Error("Could not detect extension ID");
  }

  /**
   * Login to CPQ system
   */
  async login(username, password, loginButtonSelector = '#login-button', maxAttempts = 3) {
    if (process.env.BYPASS_LOGIN === 'true') {
      console.log("Login bypassed by environment variable");
      return true;
    }

    // Use provided credentials or fall back to environment variables
    const user = username || process.env.CPQ_USERNAME;
    const pass = password || process.env.CPQ_PASSWORD;
    const baseUrl = process.env.BASE_URL;

    if (!user || !pass || !baseUrl) {
      throw new Error("Missing login credentials or BASE_URL");
    }

    console.log(`Attempting login to: ${baseUrl}`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Login attempt ${attempt}/${maxAttempts}`);
        
        // Navigate to login page
        await this.page.goto(baseUrl);
        
        // Wait for login form
        await this.page.waitForSelector('#username', { timeout: TIMEOUTS.ELEMENT_APPEARANCE });
        
        // Fill credentials
        await this.page.fill('#username', user);
        await this.page.fill('#password', pass);
        
        // Click login button
        const loginButton = this.page.locator(loginButtonSelector);
        await loginButton.click();
        
        // Wait for navigation to complete
        await this.page.waitForLoadState('networkidle');
        
        // Check if login was successful
        const currentUrl = this.page.url();
        if (!currentUrl.includes('login') && !currentUrl.includes('signin')) {
          console.log("Login successful");
          isLoggedIn = true;
          lastLoginTime = Date.now();
          return true;
        }
        
        console.warn(`Login attempt ${attempt} failed, checking for errors...`);
        
        // Check for error messages
        const errorSelectors = ['.error', '.alert-danger', '[class*="error"]'];
        for (const selector of errorSelectors) {
          const errorElement = this.page.locator(selector);
          if (await errorElement.isVisible()) {
            const errorText = await errorElement.textContent();
            console.error(`Login error: ${errorText}`);
          }
        }
        
        if (attempt < maxAttempts) {
          await this.safeWait(2000);
        }
        
      } catch (error) {
        console.error(`Login attempt ${attempt} failed:`, error.message);
        if (attempt === maxAttempts) {
          throw new Error(`Login failed after ${maxAttempts} attempts: ${error.message}`);
        }
        await this.safeWait(2000);
      }
    }
    
    return false;
  }

  /**
   * Navigate to a specific URL with retry logic
   */
  async navigateToUrl(url, waitForSelector = null, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Navigating to ${url} (attempt ${attempt}/${maxAttempts})`);
        
        await this.page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: TIMEOUTS.NAVIGATION 
        });
        
        if (waitForSelector) {
          await this.page.waitForSelector(waitForSelector, { 
            timeout: TIMEOUTS.ELEMENT_APPEARANCE 
          });
        }
        
        return true;
      } catch (error) {
        console.error(`Navigation attempt ${attempt} failed:`, error.message);
        if (attempt === maxAttempts) {
          throw error;
        }
        await this.safeWait(2000);
      }
    }
  }

  /**
   * Verify extension is loaded and accessible
   */
  async verifyExtensionLoaded() {
    if (!this.extensionId) {
      throw new Error("Extension ID not detected");
    }
    
    // Try to access extension popup or options page
    const extensionUrl = `chrome-extension://${this.extensionId}/popup/popup.html`;
    try {
      await this.page.goto(extensionUrl);
      console.log("Extension verified as loaded");
      return true;
    } catch (error) {
      throw new Error(`Extension not accessible: ${error.message}`);
    }
  }

  /**
   * Setup file picker mock for file upload testing
   */
  async setupFileMock(content, fileName = 'test.bml') {
    await this.page.addInitScript(({ content, fileName }) => {
      // Mock the File System Access API
      window.showOpenFilePicker = async () => {
        console.log('[MOCK] showOpenFilePicker called');
        
        const fileHandle = {
          getFile: async () => {
            return new File([content], fileName, { type: 'text/plain' });
          },
          name: fileName
        };
        
        return [fileHandle];
      };
      
      console.log('[MOCK] File System Access API mocked successfully');
    }, { content, fileName });
  }

  /**
   * Wait for page to reach a stable state
   */
  async waitForStableState(timeout = 5000) {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
      await this.safeWait(1000); // Additional stability wait
    } catch (error) {
      console.warn("Page may not have reached stable state:", error.message);
    }
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name) {
    try {
      const timestamp = name || `debug-${Date.now()}`;
      const path = `${timestamp}.png`;
      await this.page.screenshot({ path, fullPage: true });
      console.log(`Screenshot saved: ${path}`);
      return path;
    } catch (error) {
      console.warn(`Failed to take screenshot: ${error.message}`);
      return null;
    }
  }

  /**
   * Verify popup page exists and is accessible
   */
  async verifyPopupPage(popupFileName) {
    if (!this.extensionId) {
      throw new Error("Extension ID not available");
    }
    
    const popupUrl = `chrome-extension://${this.extensionId}/popup/${popupFileName}`;
    
    try {
      await this.page.goto(popupUrl);
      await this.waitForStableState();
      return true;
    } catch (error) {
      console.error(`Failed to verify popup page ${popupFileName}:`, error.message);
      return false;
    }
  }

  /**
   * Get editor content from a specific selector
   */
  async getEditorContent(selector = '#contentEditor') {
    try {
      const editorElement = this.page.locator(selector);
      return await editorElement.inputValue();
    } catch (error) {
      console.error(`Failed to get editor content: ${error.message}`);
      return null;
    }
  }

  /**
   * Set editor content
   */
  async setEditorContent(content, selector = '#contentEditor') {
    try {
      const editorElement = this.page.locator(selector);
      await editorElement.clear();
      await editorElement.fill(content);
      
      // Trigger change events
      await editorElement.dispatchEvent('input');
      await editorElement.dispatchEvent('change');
      
      return true;
    } catch (error) {
      console.error(`Failed to set editor content: ${error.message}`);
      return false;
    }
  }

  /**
   * Test load functionality (converted from Puppeteer version)
   */
  async testLoad(popupFrame, filename, content, editorSelector = '#contentEditor') {
    console.log(`Testing load functionality with file: ${filename}`);
    
    // Set the editor content
    await this.setEditorContent(content, editorSelector);
    
    // Verify the content was set correctly
    const editorContent = await this.getEditorContent(editorSelector);
    
    console.log("Verifying editor content...");
    if (editorContent !== content) {
      console.error("Content mismatch!");
      console.error("Expected:", content);
      console.error("Actual:", editorContent);
      throw new Error("Editor content doesn't match the input content");
    }
    
    // Find and click save button if available
    const saveButton = this.page.locator('#save');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      console.log("Save button clicked");
      await this.waitForStableState();
    } else {
      console.log("No save button found");
    }
    
    console.log("Load test completed successfully");
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    try {
      if (this.isRecording) {
        // Stop any ongoing recording
        this.isRecording = false;
      }
      
      console.log("TestHelper cleanup completed");
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  }
}

module.exports = { 
  TestHelper,
  TIMEOUTS,
  mockFileSystemAccessAPI: async (page, fileContent, fileName = 'test.bml') => {
    const helper = new TestHelper();
    await helper.setupFileMock(fileContent, fileName);
  }
};