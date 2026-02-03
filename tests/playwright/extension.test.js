const { test, expect } = require('@playwright/test');
const { TestHelper } = require('./helpers');

test.describe('Chrome Extension Tests', () => {
    let helper;
    let extensionId;

    test.beforeAll(async ({ browser }) => {
        console.log("Setting up Chrome Extension Tests...");
    });

    test.beforeEach(async ({ page, context }) => {
        helper = new TestHelper();
        await helper.init(page, context);
        extensionId = helper.extensionId;
    });

    test.afterEach(async () => {
        if (helper) {
            await helper.cleanup();
        }
    });

    test('should load extension options page', async () => {
        console.log("Testing extension options page loading...");
        
        if (!extensionId) {
            throw new Error("Extension ID not available");
        }
        
        // Navigate to options page with retry logic
        const optionsUrl = `chrome-extension://${extensionId}/options/options.html`;
        
        await helper.navigateToUrl(optionsUrl);
        
        // Wait for page to stabilize
        await helper.waitForStableState();
        
        // Take screenshot after navigation
        await helper.takeScreenshot(`extension-options-navigation-${Date.now()}`);
        
        // Check page title
        const title = await helper.page.title();
        console.log(`Options page title: ${title}`);
        
        expect(title).toContain('Options');
    });

    test('should validate options page interface', async () => {
        console.log("Testing options page interface validation...");
        
        if (!extensionId) {
            throw new Error("Extension ID not available");
        }
        
        // Navigate to options page
        const optionsUrl = `chrome-extension://${extensionId}/options/options.html`;
        await helper.navigateToUrl(optionsUrl);
        
        // Wait for page to stabilize
        await helper.waitForStableState();
        
        // Verify options page elements
        const debugToggle = helper.page.locator('#debugMode');
        const autoSaveToggle = helper.page.locator('#autoSave'); 
        const saveButton = helper.page.locator('#save');
        
        // Check that elements exist and are visible
        await expect(debugToggle).toBeVisible();
        await expect(autoSaveToggle).toBeVisible();
        await expect(saveButton).toBeVisible();
        
        console.log("Found all options UI elements!");
        
        // Test interaction with debug toggle
        const debugInitialState = await debugToggle.isChecked();
        await debugToggle.click();
        await helper.safeWait(500);
        const debugNewState = await debugToggle.isChecked();
        
        expect(debugNewState).not.toBe(debugInitialState);
        console.log(`Debug toggle changed from ${debugInitialState} to ${debugNewState}`);
        
        // Test interaction with auto-save toggle
        const autoSaveInitialState = await autoSaveToggle.isChecked();
        await autoSaveToggle.click();
        await helper.safeWait(500);
        const autoSaveNewState = await autoSaveToggle.isChecked();
        
        expect(autoSaveNewState).not.toBe(autoSaveInitialState);
        console.log(`Auto-save toggle changed from ${autoSaveInitialState} to ${autoSaveNewState}`);
        
        // Test save button functionality
        await saveButton.click();
        await helper.safeWait(1000);
        
        console.log("Options page interface validation completed successfully");
    });

    test('should verify extension popup availability', async () => {
        console.log("Testing extension popup availability...");
        
        if (!extensionId) {
            throw new Error("Extension ID not available");
        }
        
        // Try to access various popup pages
        const popupPages = [
            'popup.html',
            'popupCommerce.html', 
            'popupConfig.html',
            'popupDocument.html'
        ];
        
        for (const popupPage of popupPages) {
            try {
                const isAccessible = await helper.verifyPopupPage(popupPage);
                if (isAccessible) {
                    console.log(`✓ ${popupPage} is accessible`);
                } else {
                    console.log(`✗ ${popupPage} is not accessible`);
                }
            } catch (error) {
                console.log(`✗ ${popupPage} failed to load: ${error.message}`);
            }
        }
        
        // At minimum, the main popup should be accessible
        const mainPopupAccessible = await helper.verifyPopupPage('popup.html');
        expect(mainPopupAccessible).toBeTruthy();
    });

    test('should handle extension popup button states', async () => {
        console.log("Testing extension popup button states...");
        
        if (!extensionId) {
            throw new Error("Extension ID not available");
        }
        
        // Navigate to main popup
        const popupUrl = `chrome-extension://${extensionId}/popup/popup.html`;
        await helper.navigateToUrl(popupUrl);
        await helper.waitForStableState();
        
        // Common button selectors to check
        const buttonSelectors = [
            '#unload',
            '#load', 
            '#save',
            '#options',
            '.action-button'
        ];
        
        let foundButtons = 0;
        
        for (const selector of buttonSelectors) {
            try {
                const button = helper.page.locator(selector);
                if (await button.isVisible()) {
                    foundButtons++;
                    const buttonText = await button.textContent();
                    const isEnabled = await button.isEnabled();
                    
                    console.log(`Button "${buttonText}" (${selector}): ${isEnabled ? 'enabled' : 'disabled'}`);
                    
                    // Test button hover state if enabled
                    if (isEnabled) {
                        await button.hover();
                        await helper.safeWait(200);
                    }
                }
            } catch (error) {
                // Button might not exist, which is fine
                console.log(`Button ${selector} not found or not accessible`);
            }
        }
        
        console.log(`Found ${foundButtons} accessible buttons in popup`);
        
        // Take final screenshot
        await helper.takeScreenshot(`extension-popup-button-states-${Date.now()}`);
    });
});