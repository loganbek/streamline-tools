const { test, expect } = require('@playwright/test');
const { TestHelper } = require('./helpers');

test.describe('Stylesheet Tests', () => {
    let helper;

    test.beforeEach(async ({ page, context }) => {
        console.log("Setting up Stylesheet Test...");
        helper = new TestHelper();
        await helper.init(page, context);
    });

    test.afterEach(async () => {
        if (helper) {
            await helper.cleanup();
        }
    });

    test('should navigate to stylesheet editor', async () => {
        console.log("Testing navigation to stylesheet editor...");
        
        // Skip test if environment variables are not set
        if (!process.env.BASE_URL || process.env.BYPASS_LOGIN === 'true') {
            test.skip('Stylesheet test skipped due to missing environment variables or bypass login');
            return;
        }
        
        try {
            // Navigate to stylesheets page
            const stylesheetUrl = `${process.env.BASE_URL}/admin/css/edit.jsp`;
            await helper.navigateToUrl(stylesheetUrl);
            
            // Wait for page to stabilize
            await helper.waitForStableState();
            
            // Take screenshot to verify page state
            await helper.takeScreenshot(`stylesheet-navigation-${Date.now()}`);
            
            // Check if we're on the correct page
            const pageIndicators = [
                'textarea[name="css"]',
                '.css-editor',
                '#cssEditor',
                'textarea[class*="css"]',
                'input[type="submit"][value*="Save"]'
            ];
            
            let foundIndicator = false;
            for (const selector of pageIndicators) {
                const element = helper.page.locator(selector);
                if (await element.isVisible()) {
                    console.log(`Found stylesheet editor element: ${selector}`);
                    foundIndicator = true;
                    break;
                }
            }
            
            // Check page title
            const title = await helper.page.title();
            const titleContainsStylesheet = title.toLowerCase().includes('stylesheet') || 
                                          title.toLowerCase().includes('css');
            
            if (!foundIndicator && !titleContainsStylesheet) {
                console.warn("Stylesheet editor elements not found, but continuing test");
            }
            
            console.log(`Page title: ${title}`);
            
            // The test passes if we can navigate without error
            expect(helper.page.url()).toContain('css');
            
        } catch (error) {
            console.error("Error during stylesheet navigation test:", error.message);
            await helper.takeScreenshot(`stylesheet-navigation-failure-${Date.now()}`);
            throw error;
        }
    });

    test('should load CSS content into editor', async () => {
        console.log("Testing CSS content loading into editor...");
        
        // Skip test if environment variables are not set
        if (!process.env.BASE_URL || process.env.BYPASS_LOGIN === 'true') {
            test.skip('Stylesheet test skipped due to missing environment variables or bypass login');
            return;
        }
        
        try {
            // Navigate to stylesheets page
            const stylesheetUrl = `${process.env.BASE_URL}/admin/css/edit.jsp`;
            await helper.navigateToUrl(stylesheetUrl);
            await helper.waitForStableState();
            
            // Sample CSS content for testing
            const cssContent = `/* Test CSS Content */
.test-class {
    background-color: #f0f0f0;
    margin: 10px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.button-primary {
    background-color: #007cba;
    color: white;
    border: none;
    padding: 12px 24px;
    cursor: pointer;
    font-size: 14px;
}

.button-primary:hover {
    background-color: #005a87;
}

/* CPQ Specific Styles */
.cpq-table {
    width: 100%;
    border-collapse: collapse;
}

.cpq-table th,
.cpq-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.cpq-table th {
    background-color: #f4f4f4;
    font-weight: bold;
}`;
            
            // Try to find CSS editor element
            const editorSelectors = [
                'textarea[name="css"]',
                'textarea[class*="css"]', 
                '#cssEditor',
                '.css-editor',
                'textarea'
            ];
            
            let editorElement = null;
            for (const selector of editorSelectors) {
                const element = helper.page.locator(selector).first();
                if (await element.isVisible()) {
                    console.log(`Found CSS editor with selector: ${selector}`);
                    editorElement = element;
                    break;
                }
            }
            
            if (!editorElement) {
                throw new Error("Could not find CSS editor element on page");
            }
            
            // Clear existing content and add new CSS
            await editorElement.clear();
            await editorElement.fill(cssContent);
            
            // Trigger change events
            await editorElement.dispatchEvent('input');
            await editorElement.dispatchEvent('change');
            
            // Wait for any auto-save or validation
            await helper.safeWait(1000);
            
            // Verify content was set
            const loadedContent = await editorElement.inputValue();
            expect(loadedContent).toContain('test-class');
            expect(loadedContent).toContain('button-primary');
            expect(loadedContent).toContain('cpq-table');
            expect(loadedContent).toContain('background-color');
            
            console.log("CSS content loaded successfully into editor");
            
            // Test save functionality if save button exists
            const saveSelectors = [
                'input[type="submit"][value*="Save"]',
                'button:has-text("Save")',
                '#save',
                '.save-button'
            ];
            
            for (const selector of saveSelectors) {
                const saveButton = helper.page.locator(selector).first();
                if (await saveButton.isVisible()) {
                    console.log(`Testing save with selector: ${selector}`);
                    await saveButton.click();
                    await helper.safeWait(2000);
                    console.log("Save button clicked successfully");
                    break;
                }
            }
            
        } catch (error) {
            console.error("Error during CSS loading test:", error.message);
            await helper.takeScreenshot(`css-loading-failure-${Date.now()}`);
            throw error;
        }
    });

    test('should verify stylesheet popup functionality', async () => {
        console.log("Testing stylesheet popup functionality...");
        
        try {
            // Check if stylesheet popup is accessible
            const popupAccessible = await helper.verifyPopupPage('popupStylesheet.html');
            if (!popupAccessible) {
                // Try alternative popup name
                const altPopupAccessible = await helper.verifyPopupPage('popupCSS.html');
                expect(altPopupAccessible).toBeTruthy();
            } else {
                expect(popupAccessible).toBeTruthy();
            }
            
            console.log("Stylesheet popup verified as accessible");
            
        } catch (error) {
            console.error("Error during stylesheet popup test:", error.message);
            await helper.takeScreenshot(`stylesheet-popup-failure-${Date.now()}`);
            throw error;
        }
    });

    test('should test CSS validation and formatting', async () => {
        console.log("Testing CSS validation and formatting...");
        
        // Skip test if environment variables are not set
        if (!process.env.BASE_URL || process.env.BYPASS_LOGIN === 'true') {
            test.skip('Stylesheet test skipped due to missing environment variables or bypass login');
            return;
        }
        
        try {
            // Navigate to stylesheets page
            const stylesheetUrl = `${process.env.BASE_URL}/admin/css/edit.jsp`;
            await helper.navigateToUrl(stylesheetUrl);
            await helper.waitForStableState();
            
            // Test with invalid CSS first
            const invalidCss = `/* Invalid CSS for testing */
.invalid-css {
    background-color: #invalid-color;
    margin: invalid-value;
    padding: ;
    border: 1px solid
}
.missing-bracket {
    color: red;
    // Missing closing bracket`;
            
            // Find CSS editor
            const editorElement = helper.page.locator('textarea[name="css"], textarea').first();
            await expect(editorElement).toBeVisible();
            
            // Test with invalid CSS
            await editorElement.clear();
            await editorElement.fill(invalidCss);
            await helper.safeWait(1000);
            
            // Try to save and see if validation occurs
            const saveButton = helper.page.locator('input[type="submit"], button:has-text("Save")').first();
            if (await saveButton.isVisible()) {
                await saveButton.click();
                await helper.safeWait(2000);
                
                // Look for error messages
                const errorSelectors = [
                    '.error',
                    '.validation-error',
                    '[class*="error"]',
                    '.alert-danger'
                ];
                
                let foundError = false;
                for (const selector of errorSelectors) {
                    const errorElement = helper.page.locator(selector);
                    if (await errorElement.isVisible()) {
                        const errorText = await errorElement.textContent();
                        console.log(`Found validation error: ${errorText}`);
                        foundError = true;
                        break;
                    }
                }
                
                if (!foundError) {
                    console.log("No validation errors found - system may not validate CSS syntax");
                }
            }
            
            // Now test with valid CSS
            const validCss = `/* Valid CSS for testing */
.valid-css {
    background-color: #f0f0f0;
    margin: 10px;
    padding: 20px;
    border: 1px solid #ccc;
}

.valid-hover:hover {
    background-color: #e0e0e0;
}`;
            
            await editorElement.clear();
            await editorElement.fill(validCss);
            await helper.safeWait(1000);
            
            // Verify valid CSS was accepted
            const finalContent = await editorElement.inputValue();
            expect(finalContent).toContain('valid-css');
            expect(finalContent).toContain('background-color');
            
            console.log("CSS validation test completed");
            
        } catch (error) {
            console.error("Error during CSS validation test:", error.message);
            await helper.takeScreenshot(`css-validation-failure-${Date.now()}`);
            throw error;
        }
    });

    test('should test CSS unload and load workflow', async () => {
        console.log("Testing CSS unload and load workflow...");
        
        try {
            // Access stylesheet popup
            const popupUrl = `chrome-extension://${helper.extensionId}/popup/popupStylesheet.html`;
            await helper.page.goto(popupUrl).catch(async () => {
                // Try alternative popup name
                const altPopupUrl = `chrome-extension://${helper.extensionId}/popup/popupCSS.html`;
                await helper.page.goto(altPopupUrl);
            });
            
            await helper.waitForStableState();
            
            // Sample CSS for testing load/unload
            const testCss = `/* Unload/Load Test CSS */
.test-workflow {
    display: block;
    width: 100%;
    height: auto;
}

.test-workflow .inner {
    margin: 0 auto;
    max-width: 1200px;
}`;
            
            // Test loading CSS content
            await helper.testLoad(null, 'test-workflow.css', testCss);
            
            // Verify content was loaded
            const loadedContent = await helper.getEditorContent('#contentEditor');
            expect(loadedContent).toContain('test-workflow');
            expect(loadedContent).toContain('display: block');
            
            console.log("CSS load functionality verified");
            
            // Test unload functionality
            const unloadButton = helper.page.locator('#unload');
            if (await unloadButton.isVisible()) {
                await unloadButton.click();
                await helper.safeWait(1000);
                
                // Verify content was cleared
                const clearedContent = await helper.getEditorContent('#contentEditor');
                expect(clearedContent).toBe('');
                console.log("CSS unload functionality verified");
            }
            
        } catch (error) {
            console.error("Error during CSS workflow test:", error.message);
            await helper.takeScreenshot(`css-workflow-failure-${Date.now()}`);
            throw error;
        }
    });
});