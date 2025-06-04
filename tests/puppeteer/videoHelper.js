/**
 * Video recording helpers for tests
 */
const path = require('path');
const fs = require('fs').promises;

/**
 * Sets up video recording for a test
 * @param {TestHelper} helper - The TestHelper instance
 * @param {string} testName - The name of the test from expect.getState()
 * @returns {Promise<string>} - The path to the video file
 */
async function setupVideoRecording(helper, testName) {
  // Create a safe filename from the test name
  const safeFileName = testName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')  // Replace any non-alphanumeric chars with underscore
    .replace(/_+/g, '_')          // Replace multiple underscores with a single one
    .replace(/^_|_$/g, '')        // Remove leading/trailing underscores
    .substring(0, 50);            // Limit length
    
  // Add timestamp for uniqueness
  const timestamp = Date.now();
  const videoFileName = `${safeFileName}_${timestamp}.mp4`;
  
  // Set up video directory
  const videoDir = path.join(__dirname, 'test-videos');
  await fs.mkdir(videoDir, { recursive: true }).catch(err => {
    if (err.code !== 'EEXIST') console.error("Error creating video directory:", err);
  });
  
  // Full path to video file
  const videoPath = path.join(videoDir, videoFileName);
  
  console.log(`Starting recording for test: ${testName}`);
  console.log(`Video will be saved to: ${videoPath}`);
  await helper.startRecording(videoPath);
  
  return videoPath;
}

/**
 * Get current test name with safe formatting
 * @returns {string} Sanitized test name
 */
function getSafeTestName() {
  const currentTestName = expect.getState().currentTestName || 'unknown_test';
  return currentTestName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 50);
}

/**
 * Enhanced function to completely bypass login process for testing
 * This creates a more effective bypass than just replacing the login method
 * @param {TestHelper} helper - The TestHelper instance
 */
function bypassLogin(helper) {
  console.log("Completely bypassing login process for testing");
  
  // Store original methods
  const originalInit = helper.init;
  const originalLogin = helper.login;
  
  // Replace init method to skip the login part
  helper.init = async function() {
    try {
      console.log("Initializing browser with login bypass");
      
      // Launch browser without logging in
      if (!this.browser) {
        await this.launchBrowser();
        console.log("Browser launched successfully");
      }
      
      // Set up new page
      if (!this.page) {
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1366, height: 768 });
        console.log("Page created successfully");
      }
      
      // Set extensionId if needed for tests
      if (!this.extensionId && this.browser) {
        // Try to get extension ID
        try {
          const targets = await this.browser.targets();
          const extensionTarget = targets.find(target => 
            target.type() === 'background_page' || 
            (target.type() === 'page' && target.url().includes('chrome-extension'))
          );
          
          if (extensionTarget) {
            this.extensionId = extensionTarget.url().split('/')[2];
            console.log(`Found extension ID: ${this.extensionId}`);
          }
        } catch (e) {
          console.warn("Could not get extension ID:", e.message);
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error in bypassed init:", error);
      throw error;
    }
  };
  
  // Override login method to do nothing
  helper.login = async function() {
    console.log("Login completely bypassed");
    return true;
  };
  
  // Return function to restore original methods if needed
  return function restoreOriginalMethods() {
    helper.init = originalInit;
    helper.login = originalLogin;
    console.log("Restored original login methods");
  };
}

/**
 * Create a mock page for testing without actual navigation
 * @param {TestHelper} helper - The TestHelper instance  
 * @param {Object} rule - The rule object from rulesList.json
 */
async function createMockPageForRule(helper, rule) {
  console.log(`Creating mock page for ${rule.AppArea} - ${rule.RuleName}`);
  
  // Get proper URL from rule
  const url = rule.URL.replace('*', process.env.SITE_SUBDOMAIN || 'devmcnichols');
  
  // Set page content with basic structure that includes expected elements
  await helper.page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${rule.AppArea} - ${rule.RuleName}</title>
    </head>
    <body>
      <h1>${rule.AppArea} - ${rule.RuleName} Test Page</h1>
      
      <!-- Mock editor area -->
      <div class="editor-container">
        <textarea id="textarea" style="width: 100%; height: 300px;">${rule.code || '// Sample code for testing'}</textarea>
      </div>
      
      <!-- Mock extension buttons -->
      <div class="action-buttons">
        <button id="unload${rule.fileType.toUpperCase()}">Unload ${rule.fileType.toUpperCase()}</button>
        <button id="load${rule.fileType.toUpperCase()}">Load ${rule.fileType.toUpperCase()}</button>
      </div>
      
      <!-- Mock filename input if needed -->
      <div class="filename-container">
        <input name="varName" value="testFileName" />
      </div>
    </body>
    </html>
  `);
  
  // Set location to match expected URL for navigation testing
  await helper.page.evaluate((pageUrl) => {
    // Mock the location object
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: pageUrl }
    });
  }, url);
  
  console.log(`Mock page created for ${rule.AppArea} - ${rule.RuleName}`);
  return true;
}

module.exports = {
  setupVideoRecording,
  getSafeTestName,
  bypassLogin,
  createMockPageForRule
};