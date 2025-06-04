const { TestHelper } = require('./helpers');
const login = require('./login');
const path = require('path');
const fs = require('fs').promises;

describe('Interfaces Tests', () => {
    let helper;
    let currentTestName = '';

    beforeAll(async () => {
        console.log("Setting up Interfaces Tests...");
        helper = new TestHelper();
        await helper.init();
        
        try {
            console.log("Attempting to login...");
            await login(helper.page);
            console.log("Login successful");
        } catch (error) {
            console.error("Failed to login during test setup:", error.message);
            // Take screenshot but don't fail setup - tests will likely fail anyway
            await helper.page.screenshot({
                path: `interfaces-login-failure-${Date.now()}.png`,
                fullPage: true
            });
        }
    }, 60000);

    afterAll(async () => {
        await helper.cleanup();
    });

    beforeEach(async () => {
        // Get current test name for video file naming
        currentTestName = expect.getState().currentTestName.replace(/\s+/g, '_');
        
        // Set up video directory
        const videoDir = path.join(__dirname, 'test-videos');
        try {
            await fs.mkdir(videoDir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                console.error("Error creating video directory:", error);
            }
        }
        
        // Start recording this test
        console.log(`Starting recording for test: ${currentTestName}`);
        await helper.startRecording(path.join(videoDir, `${currentTestName}.webm`));
        
        // Verify extension is loaded with retry logic
        console.log("Verifying extension is loaded...");
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                await helper.verifyExtensionLoaded();
                console.log("Extension verified as loaded");
                break;
            } catch (error) {
                console.warn(`Failed to verify extension on attempt ${attempt}:`, error.message);
                
                if (attempt === 3) {
                    console.error("Failed to verify extension after multiple attempts");
                    // Don't throw, try to continue the test
                } else {
                    // Wait and try again
                    await helper.safeWait(2000);
                }
            }
        }
    }, 45000);

    afterEach(async () => {
        // Stop recording and always save the video
        console.log(`Test "${currentTestName}" finished`);
        await helper.stopRecording(true); // Always save the video
        currentTestName = '';
    });

    test('should navigate to interfaces REST page', async () => {
        console.log("Testing navigation to interfaces REST page...");
        
        const page = helper.page;
        
        // Use retry pattern for navigation
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Navigating to interfaces page (attempt ${attempt}/3)...`);
                await Promise.race([
                    page.goto(`${process.env.BASE_URL}/admin/interfaceCatalogs/list_ics_resources.jsp`, { 
                        waitUntil: 'domcontentloaded',
                        timeout: 20000
                    }),
                    new Promise(resolve => setTimeout(resolve, 20000))
                ]);
                
                // Wait for page to stabilize
                await helper.safeWait(3000);
                
                // Take screenshot after navigation
                await page.screenshot({ 
                    path: `interfaces-rest-navigation-${Date.now()}.png`,
                    fullPage: true 
                });
                
                // Check if we're on the right page by looking for key elements
                const onCorrectPage = await page.evaluate(() => {
                    return !!document.querySelector('a[name="display_resource"]');
                });
                
                if (onCorrectPage) {
                    console.log("Successfully navigated to interfaces REST page");
                    break;
                } else {
                    console.warn("Navigation seems successful but page doesn't have expected elements");
                    
                    if (attempt === 3) {
                        throw new Error("Could not find expected elements on interfaces page");
                    }
                    
                    // Wait and try again
                    await helper.safeWait(2000);
                }
            } catch (error) {
                console.error(`Navigation error on attempt ${attempt}:`, error.message);
                
                if (attempt === 3) {
                    throw new Error(`Failed to navigate to interfaces page after 3 attempts: ${error.message}`);
                }
                
                // Wait before retrying
                await helper.safeWait(2000);
            }
        }
        
        // Verify REST interfaces UI elements with retry logic
        let displayResourceLink = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Checking for UI elements (attempt ${attempt}/3)...`);
                
                displayResourceLink = await page.waitForSelector('a[name="display_resource"]', { timeout: 10000 })
                    .catch(() => null);
                
                if (displayResourceLink) {
                    console.log("Found display resource link!");
                    break;
                }
                
                if (attempt < 3) {
                    console.log("Display resource link not found, waiting to retry...");
                    await helper.safeWait(2000);
                }
            } catch (error) {
                console.error(`Error checking UI elements on attempt ${attempt}:`, error.message);
                
                if (attempt === 3) {
                    // Take screenshot before failing
                    await page.screenshot({ 
                        path: `interfaces-rest-ui-failure-${Date.now()}.png`,
                        fullPage: true 
                    });
                    throw error;
                }
                
                await helper.safeWait(2000);
            }
        }
        
        // Verify interfaces REST popup
        console.log("Verifying interfaces REST popup...");
        let popup = null;
        try {
            popup = await helper.verifyPopupPage('popupInterfacesREST.html');
            expect(popup).toBeTruthy();
        } catch (error) {
            console.error("Failed to verify interfaces REST popup:", error.message);
            
            // Take screenshot before failing
            await page.screenshot({
                path: `interfaces-rest-popup-failure-${Date.now()}.png`,
                fullPage: true
            });
            throw error;
        }
        
        // Final verification
        expect(displayResourceLink).toBeTruthy();
    }, 45000);

    test('should navigate to interfaces SOAP page', async () => {
        console.log("Testing navigation to interfaces SOAP page...");
        
        const page = helper.page;
        
        // Navigate to interfaces page with retry logic
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Navigating to interfaces page (attempt ${attempt}/3)...`);
                await Promise.race([
                    page.goto(`${process.env.BASE_URL}/admin/interfaceCatalogs/list_ics_resources.jsp`, { 
                        waitUntil: 'domcontentloaded',
                        timeout: 20000
                    }),
                    new Promise(resolve => setTimeout(resolve, 20000))
                ]);
                
                // Wait for page to stabilize
                await helper.safeWait(3000);
                
                // Find and click on the SOAP tab with retry logic
                const soapTabFound = await page.evaluate(() => {
                    // Find tab that contains text "SOAP"
                    const tabs = Array.from(document.querySelectorAll('a, button, li'));
                    const soapTab = tabs.find(el => el.textContent && el.textContent.includes('SOAP'));
                    
                    if (soapTab) {
                        soapTab.click();
                        return true;
                    }
                    return false;
                });
                
                if (soapTabFound) {
                    console.log("SOAP tab found and clicked");
                    await helper.safeWait(2000); // Wait for tab content to load
                    break;
                } else {
                    console.warn("SOAP tab not found on attempt", attempt);
                    
                    if (attempt === 3) {
                        console.error("SOAP tab not found after multiple attempts");
                        // Take a screenshot for debugging
                        await page.screenshot({
                            path: `interfaces-soap-tab-missing-${Date.now()}.png`, 
                            fullPage: true
                        });
                        throw new Error("Could not find SOAP tab");
                    }
                    
                    // Take screenshot for debugging
                    await page.screenshot({
                        path: `interfaces-soap-attempt-${attempt}-${Date.now()}.png`,
                        fullPage: true
                    });
                    
                    await helper.safeWait(2000);
                }
            } catch (error) {
                console.error(`Error on attempt ${attempt}:`, error.message);
                
                if (attempt === 3) {
                    throw error;
                }
                
                await helper.safeWait(2000);
            }
        }
        
        // Verify interfaces SOAP popup
        console.log("Verifying interfaces SOAP popup...");
        let popup = null;
        try {
            popup = await helper.verifyPopupPage('popupInterfacesSOAP.html');
            expect(popup).toBeTruthy();
        } catch (error) {
            console.error("Failed to verify interfaces SOAP popup:", error.message);
            
            // Take screenshot before failing
            await page.screenshot({
                path: `interfaces-soap-popup-failure-${Date.now()}.png`,
                fullPage: true
            });
            throw error;
        }
    }, 45000);

    test('should handle REST metadata operations', async () => {
        console.log("Testing REST metadata operations...");
        
        try {
            // Navigate to REST interfaces page
            await helper.page.goto(`${process.env.BASE_URL}/admin/interfaceCatalogs/list_ics_resources.jsp`, { 
                waitUntil: 'domcontentloaded',
                timeout: 20000
            });
            
            // Wait for page to load
            await helper.safeWait(3000);
            
            // Verify popup with retry logic
            let popup = null;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    popup = await helper.verifyPopupPage('popupInterfacesREST.html');
                    if (popup) break;
                } catch (error) {
                    console.warn(`Failed to verify popup on attempt ${attempt}:`, error.message);
                    
                    if (attempt === 3) {
                        throw error;
                    }
                    
                    await helper.safeWait(2000);
                }
            }
            
            // Sample JSON metadata
            const jsonMetadata = `{
                "name": "CommerceAPI",
                "version": "1.0",
                "description": "Commerce API for testing",
                "endpoints": [
                    {
                        "path": "/orders",
                        "method": "GET",
                        "description": "List all orders"
                    }
                ]
            }`;
            
            // Test loading metadata
            await helper.testLoad(popup, 'api-metadata.json', jsonMetadata);
            
            // Verify content was loaded properly
            const frame = await popup.contentFrame();
            const loadedMetadata = await frame.evaluate(() => {
                return document.querySelector('#contentEditor').value;
            });
            
            // Use a flexible comparison to check if key parts are present
            expect(loadedMetadata).toContain('CommerceAPI');
            expect(loadedMetadata).toContain('endpoints');
            console.log("REST metadata loaded successfully");
        } catch (error) {
            console.error("Error during REST metadata test:", error.message);
            
            // Take screenshot of the current state
            await helper.page.screenshot({
                path: `rest-metadata-test-failure-${Date.now()}.png`,
                fullPage: true
            });
            
            throw error;
        }
    }, 45000);
});