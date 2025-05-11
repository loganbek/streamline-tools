const { TestHelper } = require('./helpers');
const { setupVideoRecording, getSafeTestName } = require('./videoHelper');

describe('Chrome Extension Tests', () => {
    let helper;
    let extensionId;
    let currentTestName = '';

    beforeAll(async () => {
        console.log("Setting up Chrome Extension Tests...");
        helper = new TestHelper();
        await helper.init();
        
        try {
            // Get extension ID from the first extension target with retry logic
            let extensionTarget = null;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    console.log(`Trying to get extension ID (attempt ${attempt}/3)...`);
                    const targets = await helper.browser.targets();
                    extensionTarget = targets.find(target => 
                        target.type() === 'background_page' || 
                        (target.type() === 'page' && target.url().includes('chrome-extension'))
                    );
                    
                    if (extensionTarget) {
                        extensionId = extensionTarget.url().split('/')[2];
                        console.log(`Found extension ID: ${extensionId}`);
                        break;
                    } else {
                        console.warn(`No extension target found on attempt ${attempt}`);
                        if (attempt < 3) {
                            await helper.safeWait(2000);
                        }
                    }
                } catch (error) {
                    console.error(`Error getting extension ID on attempt ${attempt}:`, error.message);
                    if (attempt === 3) throw error;
                    await helper.safeWait(2000);
                }
            }
            
            if (!extensionId) {
                throw new Error("Could not find extension ID after multiple attempts");
            }
            
            // Store extension ID on helper for other tests to use
            helper.extensionId = extensionId;
        } catch (error) {
            console.error("Failed to get extension ID:", error.message);
            throw error;
        }
    }, 60000);

    afterAll(async () => {
        await helper.cleanup();
    });
    
    beforeEach(async () => {
        // Get current test name with safe formatting
        currentTestName = getSafeTestName();
        
        // Set up video recording with improved naming
        await setupVideoRecording(helper, expect.getState().currentTestName);
        
        // Set test timeout
        jest.setTimeout(45000);
    });

    afterEach(async () => {
        // Stop recording and always save the video
        console.log(`Test "${currentTestName}" finished`);
        await helper.stopRecording(true); // Always save the video
        currentTestName = '';
    });

    test('should load extension options page', async () => {
        console.log("Testing extension options page loading...");
        
        // Navigate to options page with retry logic
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Navigating to options page (attempt ${attempt}/3)...`);
                await Promise.race([
                    helper.page.goto(`chrome-extension://${extensionId}/options/options.html`, {
                        waitUntil: 'domcontentloaded',
                        timeout: 20000
                    }),
                    new Promise(resolve => setTimeout(resolve, 20000))
                ]);
                
                // Wait for page to stabilize
                await helper.safeWait(2000);
                
                // Take screenshot after navigation
                await helper.page.screenshot({
                    path: `extension-options-navigation-${Date.now()}.png`,
                    fullPage: true
                });
                break;
            } catch (error) {
                console.error(`Navigation error on attempt ${attempt}:`, error.message);
                
                if (attempt === 3) {
                    throw new Error(`Failed to navigate to options page after 3 attempts: ${error.message}`);
                }
                
                await helper.safeWait(2000);
            }
        }
        
        // Check page title with retry logic
        let title;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                title = await helper.page.title();
                console.log(`Options page title: ${title}`);
                
                if (title && title.includes('Options')) {
                    break;
                }
                
                if (attempt < 3) {
                    console.log("Unexpected title, waiting to retry...");
                    await helper.safeWait(1000);
                }
            } catch (error) {
                console.error(`Error getting page title on attempt ${attempt}:`, error.message);
                
                if (attempt === 3) {
                    throw error;
                }
                
                await helper.safeWait(1000);
            }
        }
        
        expect(title).toContain('Options');

        // Verify essential options UI elements with retry logic
        let saveButton, optionsForm;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Checking for UI elements (attempt ${attempt}/3)...`);
                
                saveButton = await helper.page.$('#save')
                    .catch(() => null);
                    
                optionsForm = await helper.page.$('form')
                    .catch(() => null);
                
                if (saveButton && optionsForm) {
                    console.log("Found all options page UI elements!");
                    break;
                }
                
                if (attempt < 3) {
                    console.log("Some UI elements not found, waiting to retry...");
                    await helper.safeWait(2000);
                }
            } catch (error) {
                console.error(`Error checking UI elements on attempt ${attempt}:`, error.message);
                
                if (attempt === 3) {
                    // Take screenshot before failing
                    await helper.page.screenshot({
                        path: `extension-options-ui-failure-${Date.now()}.png`,
                        fullPage: true
                    });
                    throw error;
                }
                
                await helper.safeWait(2000);
            }
        }
        
        expect(saveButton).toBeTruthy();
        expect(optionsForm).toBeTruthy();
    }, 45000);

    test('should load main popup interface', async () => {
        console.log("Testing main popup interface loading...");
        
        // Navigate to popup page with retry logic
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Navigating to popup page (attempt ${attempt}/3)...`);
                await Promise.race([
                    helper.page.goto(`chrome-extension://${extensionId}/popup/popup.html`, {
                        waitUntil: 'domcontentloaded',
                        timeout: 20000
                    }),
                    new Promise(resolve => setTimeout(resolve, 20000))
                ]);
                
                // Wait for page to stabilize
                await helper.safeWait(2000);
                
                // Take screenshot after navigation
                await helper.page.screenshot({
                    path: `extension-popup-navigation-${Date.now()}.png`,
                    fullPage: true
                });
                break;
            } catch (error) {
                console.error(`Navigation error on attempt ${attempt}:`, error.message);
                
                if (attempt === 3) {
                    throw new Error(`Failed to navigate to popup page after 3 attempts: ${error.message}`);
                }
                
                await helper.safeWait(2000);
            }
        }

        // Verify essential popup UI elements with retry logic
        let unloadButton, loadButton, optionsButton;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Checking for popup UI elements (attempt ${attempt}/3)...`);
                
                unloadButton = await helper.page.$('#unloadBML')
                    .catch(() => null);
                    
                loadButton = await helper.page.$('#loadBML')
                    .catch(() => null);
                    
                optionsButton = await helper.page.$('#options')
                    .catch(() => null);
                
                if (unloadButton && loadButton && optionsButton) {
                    console.log("Found all popup UI elements!");
                    break;
                }
                
                if (attempt < 3) {
                    console.log("Some UI elements not found, waiting to retry...");
                    await helper.safeWait(2000);
                }
            } catch (error) {
                console.error(`Error checking UI elements on attempt ${attempt}:`, error.message);
                
                if (attempt === 3) {
                    // Take screenshot before failing
                    await helper.page.screenshot({
                        path: `extension-popup-ui-failure-${Date.now()}.png`,
                        fullPage: true
                    });
                    throw error;
                }
                
                await helper.safeWait(2000);
            }
        }

        expect(unloadButton).toBeTruthy();
        expect(loadButton).toBeTruthy();
        expect(optionsButton).toBeTruthy();

        // Verify button states
        try {
            const isUnloadDisabled = await helper.page.evaluate(button => button.disabled, unloadButton);
            const isLoadDisabled = await helper.page.evaluate(button => button.disabled, loadButton);
            
            expect(isUnloadDisabled).toBe(true);
            expect(isLoadDisabled).toBe(true);
        } catch (error) {
            console.error("Error checking button states:", error.message);
            
            // Take screenshot before failing
            await helper.page.screenshot({
                path: `extension-popup-button-states-failure-${Date.now()}.png`,
                fullPage: true
            });
            
            throw error;
        }
    }, 45000);

    test('should validate options page interface', async () => {
        console.log("Testing options page interface validation...");
        
        // Navigate to options page with retry logic
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Navigating to options page (attempt ${attempt}/3)...`);
                await Promise.race([
                    helper.page.goto(`chrome-extension://${extensionId}/options/options.html`, {
                        waitUntil: 'domcontentloaded',
                        timeout: 20000
                    }),
                    new Promise(resolve => setTimeout(resolve, 20000))
                ]);
                
                // Wait for page to stabilize
                await helper.safeWait(2000);
                break;
            } catch (error) {
                console.error(`Navigation error on attempt ${attempt}:`, error.message);
                
                if (attempt === 3) {
                    throw new Error(`Failed to navigate to options page after 3 attempts: ${error.message}`);
                }
                
                await helper.safeWait(2000);
            }
        }

        // Verify options page elements with retry logic
        let debugToggle, autoSaveToggle, saveButton;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Checking for options UI elements (attempt ${attempt}/3)...`);
                
                debugToggle = await helper.page.$('#debugMode')
                    .catch(() => null);
                    
                autoSaveToggle = await helper.page.$('#autoSave')
                    .catch(() => null);
                    
                saveButton = await helper.page.$('#save')
                    .catch(() => null);
                
                if (debugToggle && autoSaveToggle && saveButton) {
                    console.log("Found all options UI elements!");
                    break;
                }
                
                if (attempt < 3) {
                    console.log("Some UI elements not found, waiting to retry...");
                    await helper.safeWait(2000);
                }
            } catch (error) {
                console.error(`Error checking UI elements on attempt ${attempt}:`, error.message);
                
                if (attempt === 3) {
                    // Take screenshot before failing
                    await helper.page.screenshot({
                        path: `extension-options-validation-failure-${Date.now()}.png`,
                        fullPage: true
                    });
                    throw error;
                }
                
                await helper.safeWait(2000);
            }
        }

        expect(debugToggle).toBeTruthy();
        expect(autoSaveToggle).toBeTruthy();
        expect(saveButton).toBeTruthy();
        
        // Test saving options
        try {
            console.log("Testing options saving functionality...");
            
            // Toggle debug mode
            await debugToggle.click();
            
            // Click save button
            await saveButton.click();
            
            // Wait for save to complete
            await helper.safeWait(1000);
            
            // Verify save was successful (looking for success message or checking localStorage)
            const saveSuccessful = await helper.page.evaluate(() => {
                // Check for success message
                const message = document.querySelector('.success-message, #statusMessage');
                if (message && message.textContent.includes('saved')) {
                    return true;
                }
                
                // Or verify localStorage was updated
                const debugMode = localStorage.getItem('debugMode');
                return debugMode === 'true';
            });
            
            expect(saveSuccessful).toBe(true);
            console.log("Options save test passed!");
        } catch (error) {
            console.error("Error testing options saving:", error.message);
            
            // Take screenshot before failing
            await helper.page.screenshot({
                path: `extension-options-save-failure-${Date.now()}.png`,
                fullPage: true
            });
            
            throw error;
        }
    }, 45000);
});