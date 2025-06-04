const { TestHelper } = require('./helpers');
const path = require('path');
const fs = require('fs').promises;
const { setupVideoRecording, getSafeTestName, bypassLogin, createMockPageForRule } = require('./videoHelper');

// Import a subset of key rules for focused testing
const fullRulesList = require('../../src/rulesList.json');
const rulesList = [
  // Select one rule from each major AppArea for comprehensive testing
  fullRulesList.find(r => r.AppArea === 'Config' && r.RuleName === 'Recommendation'),
  fullRulesList.find(r => r.AppArea === 'Commerce' && r.RuleName === 'Library Rule'),
  fullRulesList.find(r => r.AppArea === 'Stylesheets' && r.RuleName === 'Header & Footer'),
  fullRulesList.find(r => r.AppArea === 'Interfaces' && r.RuleName === 'REST'),
  fullRulesList.find(r => r.AppArea === 'Utils')
].filter(Boolean);

describe('Unload/Load Workflow Tests', () => {
  let helper;
  let currentTestName = '';
  const TEST_TIMEOUT = 90000; // 90 seconds max per test
  
  // Sample test content for modifications
  const mockContent = {
    bml: `// Original BML code for testing
function testFunction() {
  return "Hello world!";
}`,
    css: `/* Original CSS code for testing */
.header {
  color: #333;
  font-size: 16px;
}`,
    html: `<!-- Original HTML code for testing -->
<div class="header">
  <h1>Test Header</h1>
</div>`,
    json: `{
  "name": "Test Object",
  "version": "1.0",
  "properties": {
    "active": true
  }
}`,
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <element>Test Element</element>
</root>`
  };

  // Modified content to load back
  const modifiedContent = {
    bml: `// Modified BML code for testing
function testFunction() {
  return "Hello updated world!";
}
// Added a new function
function anotherFunction() {
  return "New addition";
}`,
    css: `/* Modified CSS code for testing */
.header {
  color: #0066cc;
  font-size: 18px;
  font-weight: bold;
}`,
    html: `<!-- Modified HTML code for testing -->
<div class="header">
  <h1>Updated Test Header</h1>
  <p>New paragraph element added</p>
</div>`,
    json: `{
  "name": "Test Object",
  "version": "1.1",
  "properties": {
    "active": true,
    "updated": true,
    "timestamp": "${new Date().toISOString()}"
  }
}`,
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <element>Updated Test Element</element>
  <newElement>Added Element</newElement>
</root>`
  };

  beforeAll(async () => {
    console.log("Setting up Unload/Load Workflow Tests...");
    helper = new TestHelper();
    
    // Always bypass login for workflow tests
    bypassLogin(helper);
    await helper.init();
        
    // Set up temporary files for each type
    const tempDir = path.join(__dirname, 'temp-files');
    await fs.mkdir(tempDir, { recursive: true }).catch(() => {});
    
    // Create temporary files for loading
    for (const [fileType, content] of Object.entries(modifiedContent)) {
      await fs.writeFile(path.join(tempDir, `test.${fileType}`), content);
    }
    
    console.log(`Created temp files in: ${tempDir}`);
    console.log("Test setup complete");
  }, 180000); // 3 minutes for setup

  afterAll(async () => {
    try {
      // Clean up temp files
      const tempDir = path.join(__dirname, 'temp-files');
      await fs.rmdir(tempDir, { recursive: true });
      console.log("Cleaned up temporary files");
    } catch (error) {
      console.error("Error cleaning up temporary files:", error);
    }
    
    await helper.cleanup();
  });

  beforeEach(async () => {
    // Get current test name with safe formatting
    currentTestName = getSafeTestName();
    
    // Set up video recording with improved naming
    await setupVideoRecording(helper, expect.getState().currentTestName);
    
    // Set test timeout
    jest.setTimeout(TEST_TIMEOUT);
  });

  afterEach(async () => {
    // Stop recording and always save the video
    console.log(`Test "${currentTestName}" completed`);
    await helper.stopRecording(true);
    currentTestName = '';
  });

  /**
   * Simulate file selection for load operation
   * @param {string} fileType - File extension (e.g., 'bml', 'css')
   * @returns {Promise<void>}
   */
  async function simulateFileSelection(fileType) {
    // In a real test with file picker:
    // 1. Would mock the file input and selection process
    // 2. Here we simulate successful file selection
    
    const mockFilePath = path.join(__dirname, 'temp-files', `test.${fileType}`);
    
    // Log the simulated file selection
    console.log(`Simulating file selection: ${mockFilePath}`);
    
    // Set the file content in the page
    await helper.page.evaluate((content) => {
      // Create a mock FileReader result event
      const mockFileReaderEvent = new Event('load');
      mockFileReaderEvent.target = { result: content };
      
      // Store the mock file content in a global variable for the extension to access
      window._mockFileContent = content;
      
      // If there's any handler waiting for file content, trigger it
      if (window._onFileLoaded) {
        window._onFileLoaded(mockFileReaderEvent);
      }
    }, modifiedContent[fileType]);
    
    return true;
  }
  
  /**
   * Click button with retry logic
   * @param {string} buttonId - Button ID to click
   * @returns {Promise<boolean>} - True if successful
   */
  async function clickButton(buttonId) {
    try {
      return await helper.page.evaluate((id) => {
        const button = document.getElementById(id);
        if (button) {
          console.log(`Clicking button: ${id}`);
          button.click();
          return true;
        }
        return false;
      }, buttonId);
    } catch (error) {
      console.error(`Error clicking button ${buttonId}:`, error);
      return false;
    }
  }
  
  /**
   * Verify content in DOM
   * @param {Object} rule - Rule definition
   * @param {string} expectedContent - Content to verify
   * @returns {Promise<boolean>} - True if content matches
   */
  async function verifyContent(rule, expectedContent) {
    try {
      // Get content using rule's codeSelector
      const content = await helper.page.evaluate((selector) => {
        try {
          return eval(selector) || '';
        } catch {
          return '';
        }
      }, rule.codeSelector);
      
      console.log('Expected content length:', expectedContent.length);
      console.log('Actual content length:', content.length);
      
      // For debugging, log content samples
      console.log('Expected content sample:', expectedContent.substring(0, 50));
      console.log('Actual content sample:', content.substring(0, 50));
      
      // Compare content (ignoring whitespace variations)
      const normalizedExpected = expectedContent.replace(/\s+/g, ' ').trim();
      const normalizedActual = content.replace(/\s+/g, ' ').trim();
      
      return normalizedActual === normalizedExpected;
    } catch (error) {
      console.error('Error verifying content:', error);
      return false;
    }
  }

  // Generate tests for each rule in our subset
  for (const rule of rulesList) {
    test(`should unload and load ${rule.AppArea} - ${rule.RuleName} content`, async () => {
      console.log(`Testing unload/load workflow for ${rule.AppArea} - ${rule.RuleName}`);
      
      // Step 1: Create mock page with original content
      const fileType = rule.fileType.toLowerCase();
      const originalContent = mockContent[fileType] || `// Original content for ${fileType}`;
      
      // Create a custom mock page for this test
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
            <textarea id="textarea" style="width: 100%; height: 300px;">${originalContent}</textarea>
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
      
      // Screenshot before any actions
      await helper.page.screenshot({
        path: `${rule.AppArea}-${rule.RuleName}-initial-${Date.now()}.png`,
        fullPage: true
      });
      
      // Step 2: Verify the original content is in place
      const hasOriginalContent = await verifyContent(rule, originalContent);
      expect(hasOriginalContent).toBe(true);
      console.log('Original content verified ✓');
      
      // Step 3: Unload content
      const unloadBtnId = `unload${rule.fileType.toUpperCase()}`;
      const unloadClicked = await clickButton(unloadBtnId);
      expect(unloadClicked).toBe(true);
      
      // Wait for unload to take effect
      await helper.safeWait(1000);
      
      // Screenshot after unload
      await helper.page.screenshot({
        path: `${rule.AppArea}-${rule.RuleName}-after-unload-${Date.now()}.png`,
        fullPage: true
      });
      
      console.log('Content unloaded ✓');
      
      // Step 4: Simulate file selection to load modified content
      const fileSelected = await simulateFileSelection(fileType);
      expect(fileSelected).toBe(true);
      
      // Step 5: Load the modified content
      const loadBtnId = `load${rule.fileType.toUpperCase()}`;
      const loadClicked = await clickButton(loadBtnId);
      expect(loadClicked).toBe(true);
      
      // Wait for load to take effect
      await helper.safeWait(1000);
      
      // Screenshot after load
      await helper.page.screenshot({
        path: `${rule.AppArea}-${rule.RuleName}-after-load-${Date.now()}.png`,
        fullPage: true
      });
      
      // Step 6: Verify the modified content is in place
      const hasModifiedContent = await verifyContent(rule, modifiedContent[fileType]);
      expect(hasModifiedContent).toBe(true);
      console.log('Modified content verified ✓');
      
      console.log(`Unload/load workflow test for ${rule.AppArea} - ${rule.RuleName} passed!`);
    }, TEST_TIMEOUT);
  }
});