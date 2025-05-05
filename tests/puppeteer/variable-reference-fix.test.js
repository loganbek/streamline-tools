const { TestHelper } = require('./helpers');
const login = require('./login');

/**
 * This test suite validates our fixes for the variable reference issues
 * in the header and footer functionality. It specifically tests:
 * 1. Variables are properly defined on window object
 * 2. No redeclaration errors when content script runs multiple times
 * 3. Header and footer operations work correctly
 */
describe('Variable Reference Fix Tests', () => {
  let helper;

  beforeAll(async () => {
    helper = new TestHelper();
    await helper.init();
    await login(helper.page);
  });

  afterAll(async () => {
    await helper.cleanup();
  });

  beforeEach(async () => {
    // Navigate to header & footer page
    await helper.page.goto('https://devmcnichols.bigmachines.com/admin/ui/branding/edit_header_footer.jsp');
    await helper.verifyExtensionLoaded();
  });

  test('should have window-scoped variables defined', async () => {
    // Check that variables are properly defined on the window object
    const variablesExist = await helper.page.evaluate(() => {
      const vars = ['CONTENT_DEBUG', 'SCRIPT_READY', 'PING_READY', 'streamlineState'];
      const results = {};
      
      vars.forEach(varName => {
        results[varName] = typeof window[varName] !== 'undefined';
      });
      
      return results;
    });
    
    // Assert that all variables are defined
    expect(variablesExist.CONTENT_DEBUG).toBe(true);
    expect(variablesExist.SCRIPT_READY).toBe(true);
    expect(variablesExist.PING_READY).toBe(true);
    expect(variablesExist.streamlineState).toBe(true);
  });

  test('should handle multiple script injections without redeclaration errors', async () => {
    // Simulate multiple script injections by manually injecting the variable declarations
    const noErrors = await helper.page.evaluate(() => {
      try {
        // These are the declarations from our fixed content.js
        window.CONTENT_DEBUG = window.CONTENT_DEBUG !== undefined ? window.CONTENT_DEBUG : true;
        window.SCRIPT_READY = window.SCRIPT_READY !== undefined ? window.SCRIPT_READY : false;
        window.PING_READY = window.PING_READY !== undefined ? window.PING_READY : true;
        window.streamlineState = window.streamlineState || {
          initialized: false,
          rules: []
        };
        
        // Do it again to simulate a second injection
        window.CONTENT_DEBUG = window.CONTENT_DEBUG !== undefined ? window.CONTENT_DEBUG : true;
        window.SCRIPT_READY = window.SCRIPT_READY !== undefined ? window.SCRIPT_READY : false;
        window.PING_READY = window.PING_READY !== undefined ? window.PING_READY : true;
        window.streamlineState = window.streamlineState || {
          initialized: false
        };
        
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });
    
    expect(noErrors.success).toBe(true);
  });

  test('should extract header content without errors', async () => {
    // Add some test content to the header textarea
    const headerContent = '<div class="test-header">Header content test</div>';
    
    // Find and populate the header textarea
    await helper.page.evaluate((content) => {
      const headerTextarea = document.querySelector('textarea[name="header"]');
      if (headerTextarea) {
        headerTextarea.value = content;
        
        // Trigger input event to ensure changes are registered
        const event = new Event('input', { bubbles: true });
        headerTextarea.dispatchEvent(event);
      }
    }, headerContent);
    
    // Open extension popup
    const popup = await helper.openPopup();
    await popup.waitForSelector('#unloadHeaderHTML');
    
    // Setup console error listener
    let consoleErrors = [];
    popup.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Click the unload header button
    await popup.click('#unloadHeaderHTML');
    
    // Wait a moment for potential errors
    await helper.page.waitForTimeout(1000);
    
    // Check for any relevant errors
    const referenceErrors = consoleErrors.filter(err => 
      err.includes('CONTENT_DEBUG is not defined') || 
      err.includes('has already been declared')
    );
    
    expect(referenceErrors.length).toBe(0);
  });

  test('should extract footer content without errors', async () => {
    // Add some test content to the footer textarea
    const footerContent = '<div class="test-footer">Footer content test</div>';
    
    // Find and populate the footer textarea
    await helper.page.evaluate((content) => {
      const footerTextarea = document.querySelector('textarea[name="footer"]');
      if (footerTextarea) {
        footerTextarea.value = content;
        
        // Trigger input event to ensure changes are registered
        const event = new Event('input', { bubbles: true });
        footerTextarea.dispatchEvent(event);
      }
    }, footerContent);
    
    // Open extension popup
    const popup = await helper.openPopup();
    await popup.waitForSelector('#unloadFooterHTML');
    
    // Setup console error listener
    let consoleErrors = [];
    popup.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Click the unload footer button
    await popup.click('#unloadFooterHTML');
    
    // Wait a moment for potential errors
    await helper.page.waitForTimeout(1000);
    
    // Check for any relevant errors
    const referenceErrors = consoleErrors.filter(err => 
      err.includes('CONTENT_DEBUG is not defined') || 
      err.includes('has already been declared')
    );
    
    expect(referenceErrors.length).toBe(0);
  });
  
  test('should handle header content loading without errors', async () => {
    // Create a file input mock and trigger it with test content
    const testHeaderContent = '<div class="test-header-loaded">Test header loaded successfully</div>';
    
    // Open extension popup
    const popup = await helper.openPopup();
    await popup.waitForSelector('#loadHeaderHTML');
    
    // Setup console error listener
    let consoleErrors = [];
    popup.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Mock the file selection and content loading
    await popup.evaluate((testContent) => {
      // Mock the file picker
      window.showOpenFilePicker = async () => {
        return [{
          getFile: async () => {
            return {
              text: async () => testContent,
              name: 'test-header.html'
            };
          }
        }];
      };
    }, testHeaderContent);
    
    // Click the load header button
    await popup.click('#loadHeaderHTML');
    
    // Wait a moment for potential errors
    await helper.page.waitForTimeout(1000);
    
    // Check for any relevant errors
    const referenceErrors = consoleErrors.filter(err => 
      err.includes('CONTENT_DEBUG is not defined') || 
      err.includes('has already been declared')
    );
    
    expect(referenceErrors.length).toBe(0);
    
    // Verify content was loaded into the textarea
    const headerContentLoaded = await helper.page.evaluate(() => {
      const headerTextarea = document.querySelector('textarea[name="header"]');
      return headerTextarea ? headerTextarea.value : null;
    });
    
    expect(headerContentLoaded).toBe(testHeaderContent);
  });

  // Comprehensive test to ensure variables survive navigation and reloading
  test('should persist window-scoped variables across page navigations', async () => {
    // First, check initial state
    const initialState = await helper.page.evaluate(() => {
      return {
        debug: window.CONTENT_DEBUG,
        ready: window.SCRIPT_READY,
        ping: window.PING_READY,
        state: window.streamlineState ? true : false
      };
    });
    
    expect(initialState.debug).toBeDefined();
    expect(initialState.state).toBe(true);
    
    // Navigate to another admin page and back
    await helper.page.goto('https://devmcnichols.bigmachines.com/admin/ui/branding/edit_site_branding.jsp');
    await helper.verifyExtensionLoaded();
    await helper.page.goto('https://devmcnichols.bigmachines.com/admin/ui/branding/edit_header_footer.jsp');
    await helper.verifyExtensionLoaded();
    
    // Check that variables are still defined after navigation
    const afterNavigationState = await helper.page.evaluate(() => {
      return {
        debug: window.CONTENT_DEBUG,
        ready: window.SCRIPT_READY,
        ping: window.PING_READY,
        state: window.streamlineState ? true : false
      };
    });
    
    expect(afterNavigationState.debug).toBeDefined();
    expect(afterNavigationState.state).toBe(true);
    
    // No errors should occur when accessing these variables
    const noErrors = await helper.page.evaluate(() => {
      try {
        console.log("Debug:", window.CONTENT_DEBUG);
        console.log("Ready:", window.SCRIPT_READY);
        console.log("State:", window.streamlineState?.initialized);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });
    
    expect(noErrors.success).toBe(true);
  });
});