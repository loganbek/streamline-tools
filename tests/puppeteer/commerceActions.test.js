const { TestHelper } = require('./helpers');
const login = require('./login');
const path = require('path');
const fs = require('fs').promises;

describe('Commerce Actions Tests', () => {
    let helper;
    let currentTestName = '';

    beforeAll(async () => {
        console.log("Setting up Commerce Actions Tests...");
        helper = new TestHelper();
        await helper.init();
        
        // Ensure login is performed
        try {
            await login(helper.page);
        } catch (error) {
            console.error("Failed to login during test setup:", error.message);
            // Take screenshot but don't fail setup - tests will likely fail anyway
            await helper.page.screenshot({
                path: `commerce-actions-login-failure-${Date.now()}.png`,
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
        await fs.mkdir(videoDir, { recursive: true }).catch(err => {
            if (err.code !== 'EEXIST') console.error("Error creating video directory:", err);
        });
        
        // Start recording this test
        console.log(`Starting recording for test: ${currentTestName}`);
        await helper.startRecording(path.join(videoDir, `${currentTestName}.webm`));
    });

    afterEach(async () => {
        // Stop recording and always save the video
        console.log(`Test "${currentTestName}" finished`);
        await helper.stopRecording(true); // Always save the video
        currentTestName = '';
    });

    test('should handle before formulas operations', async () => {
        console.log("Testing before formulas operations...");
        const page = helper.page;
        
        // Use retry pattern for navigation
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Navigating to Commerce Actions page (attempt ${attempt}/3)...`);
                await Promise.race([
                    page.goto(`${process.env.BASE_URL}/admin/commerce/actions`, { 
                        waitUntil: 'domcontentloaded',
                        timeout: 20000
                    }),
                    new Promise(resolve => setTimeout(resolve, 20000))
                ]);
                
                // Wait for page to stabilize
                await helper.safeWait(3000);
                
                // Take screenshot after navigation
                await page.screenshot({ 
                    path: `commerce-actions-navigation-${Date.now()}.png`,
                    fullPage: true 
                });
                
                // Check if we're on the right page
                const pageTitle = await page.title();
                console.log(`Current page title: ${pageTitle}`);
                
                break; // If we got here, navigation was successful
            } catch (error) {
                console.error(`Navigation error on attempt ${attempt}:`, error.message);
                
                if (attempt === 3) {
                    throw new Error(`Failed to navigate to Commerce Actions page after 3 attempts: ${error.message}`);
                }
                
                // Wait before retrying
                await helper.safeWait(2000);
            }
        }
        
        // Verify before formulas UI elements with retry logic
        let editor, validateButton, saveButton;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Checking for UI elements (attempt ${attempt}/3)...`);
                
                editor = await page.waitForSelector('#beforeFormulasEditor', { timeout: 10000 })
                    .catch(() => null);
                    
                validateButton = await page.waitForSelector('#validateBefore', { timeout: 5000 })
                    .catch(() => null);
                    
                saveButton = await page.waitForSelector('#saveBefore', { timeout: 5000 })
                    .catch(() => null);
                
                if (editor && validateButton && saveButton) {
                    console.log("Found all required UI elements!");
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
                    await page.screenshot({ 
                        path: `commerce-actions-ui-failure-${Date.now()}.png`,
                        fullPage: true 
                    });
                    throw error;
                }
                
                await helper.safeWait(2000);
            }
        }
        
        // Final verification
        expect(editor).toBeTruthy();
        expect(validateButton).toBeTruthy();
        expect(saveButton).toBeTruthy();
    }, 45000);

    test('should handle after formulas operations', async () => {
        console.log("Testing after formulas operations...");
        const page = helper.page;
        
        // Check if we need to navigate or if we're already on the page
        const currentUrl = await page.url();
        if (!currentUrl.includes('/admin/commerce/actions')) {
            console.log("Not on Commerce Actions page, navigating there...");
            await Promise.race([
                page.goto(`${process.env.BASE_URL}/admin/commerce/actions`, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 20000
                }),
                new Promise(resolve => setTimeout(resolve, 20000))
            ]);
            
            // Wait for page to stabilize
            await helper.safeWait(3000);
        } else {
            console.log("Already on Commerce Actions page");
        }
        
        // Verify after formulas UI elements with retry logic
        let editor, validateButton, saveButton;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Checking for after formulas UI elements (attempt ${attempt}/3)...`);
                
                editor = await page.waitForSelector('#afterFormulasEditor', { timeout: 10000 })
                    .catch(() => null);
                    
                validateButton = await page.waitForSelector('#validateAfter', { timeout: 5000 })
                    .catch(() => null);
                    
                saveButton = await page.waitForSelector('#saveAfter', { timeout: 5000 })
                    .catch(() => null);
                
                if (editor && validateButton && saveButton) {
                    console.log("Found all required UI elements!");
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
                    await page.screenshot({ 
                        path: `commerce-actions-after-formulas-failure-${Date.now()}.png`,
                        fullPage: true 
                    });
                    throw error;
                }
                
                await helper.safeWait(2000);
            }
        }
        
        // Final verification
        expect(editor).toBeTruthy();
        expect(validateButton).toBeTruthy();
        expect(saveButton).toBeTruthy();
    }, 45000);

    test('should handle test script operations', async () => {
        const page = helper.page;
        
        // Check test script UI elements
        const testScriptToggle = await page.$('#useScript');
        const testEditor = await page.$('#testEditor');
        const runTestButton = await page.$('#runTest');

        expect(testScriptToggle).toBeTruthy();
        expect(testEditor).toBeTruthy();
        expect(runTestButton).toBeTruthy();
    });
});