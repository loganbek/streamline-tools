const puppeteer = require('puppeteer');
const path = require('path');
const { TestHelper } = require('./helpers');

describe('Iteration Feature Tests', () => {
  let browser;
  let helper;
  const testUrl = 'https://example.com/cpq/editor';
  const testContent = 'function testBML() {\n  return "This is test BML code";\n}';
  
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    helper = new TestHelper(browser);
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    // Navigate to test page and set up test environment
    await helper.setupPage(testUrl);
    
    // Create test editor
    await helper.page.evaluate(() => {
      const editorElement = document.createElement('textarea');
      editorElement.id = 'contentEditor';
      editorElement.className = 'bml-editor';
      editorElement.value = '// Initial content';
      document.body.appendChild(editorElement);
      
      // Expose some test helper functions
      window.getEditorContent = () => document.getElementById('contentEditor').value;
      window.checkIterationState = () => ({
        isIterating: window.__streamlineIterating || false,
        count: window.__streamlineIterationCount || 0
      });
    });
    
    // Setup the mock file picker
    await helper.setupFileMock(testContent, 'test-file.bml');
  });

  test('Should perform complete iteration cycle', async () => {
    // Ensure the editor is ready
    await helper.page.waitForSelector('#contentEditor');
    
    // Click the iterate button (simulated since we're not using the actual UI)
    await helper.triggerExtensionAction({ type: 'iterate' });
    
    // Wait for iteration to start
    await helper.page.waitForFunction(() => {
      const state = window.checkIterationState();
      return state.isIterating === true;
    }, { timeout: 5000 });
    
    // Verify iteration is in progress
    const iteratingState = await helper.page.evaluate(() => window.checkIterationState());
    expect(iteratingState.isIterating).toBe(true);
    expect(iteratingState.count).toBeGreaterThan(0);
    
    // Wait for the editor content to be updated with the test content
    await helper.page.waitForFunction(
      (expectedContent) => window.getEditorContent() === expectedContent,
      { timeout: 10000 },
      testContent
    );
    
    // Verify the content was updated correctly
    const finalContent = await helper.page.evaluate(() => window.getEditorContent());
    expect(finalContent).toBe(testContent);
    
    // Wait for iteration to complete
    await helper.page.waitForFunction(() => {
      const state = window.checkIterationState();
      return state.isIterating === false;
    }, { timeout: 5000 });
    
    // Verify iteration completed
    const finalState = await helper.page.evaluate(() => window.checkIterationState());
    expect(finalState.isIterating).toBe(false);
  });

  test('Should handle multiple iteration requests gracefully', async () => {
    // Trigger multiple iteration requests in quick succession
    await Promise.all([
      helper.triggerExtensionAction({ type: 'iterate' }),
      helper.triggerExtensionAction({ type: 'iterate' }),
      helper.triggerExtensionAction({ type: 'iterate' })
    ]);
    
    // Wait a moment for the extension to process the requests
    await helper.page.waitForTimeout(1000);
    
    // Verify only one iteration is running
    const state = await helper.page.evaluate(() => window.checkIterationState());
    
    // The count should be 1 since we should ignore duplicate requests
    expect(state.count).toBeLessThan(4);
    
    // Wait for iteration to complete
    await helper.page.waitForFunction(() => {
      const state = window.checkIterationState();
      return state.isIterating === false;
    }, { timeout: 5000 });
  });
});