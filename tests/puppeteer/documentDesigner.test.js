const { TestHelper } = require('./helpers');
const login = require('./login');
const path = require('path');
const fs = require('fs').promises;

describe('Document Designer Tests', () => {
    let helper;
    let currentTestName = '';

    beforeAll(async () => {
        console.log("Setting up Document Designer Tests...");
        helper = new TestHelper();
        await helper.init();
        
        // Ensure login is performed
        try {
            console.log("Attempting to login...");
            await login(helper.page);
            console.log("Login successful");
        } catch (error) {
            console.error("Failed to login during test setup:", error.message);
            // Take screenshot but don't fail setup - tests will likely fail anyway
            await helper.page.screenshot({
                path: `document-designer-login-failure-${Date.now()}.png`,
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
        
        // Navigate to document designer page with retry logic
        console.log("Navigating to document designer page...");
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                await Promise.race([
                    helper.page.goto(`${process.env.BASE_URL}/admin/document/document-designer/edit.jsp`, {
                        waitUntil: 'domcontentloaded',
                        timeout: 20000
                    }),
                    new Promise(resolve => setTimeout(resolve, 20000))
                ]);
                
                // Wait for page to stabilize
                await helper.safeWait(3000);
                
                // Take screenshot to verify page state
                await helper.page.screenshot({
                    path: `document-designer-navigation-${Date.now()}.png`,
                    fullPage: true
                });
                
                // Try to verify extension is loaded
                try {
                    await helper.verifyExtensionLoaded();
                    console.log("Extension loaded successfully");
                    break; // Navigation and extension loading successful
                } catch (extError) {
                    console.warn(`Extension not loaded on attempt ${attempt}:`, extError.message);
                    
                    if (attempt === 3) {
                        console.error("Failed to load extension after multiple attempts");
                        // Don't throw, continue the test
                    } else {
                        // Refresh page to try again
                        await helper.page.reload({ waitUntil: 'domcontentloaded' });
                        await helper.safeWait(2000);
                    }
                }
            } catch (error) {
                console.error(`Navigation failed on attempt ${attempt}:`, error.message);
                
                if (attempt === 3) {
                    console.error("Failed to navigate to document designer page after multiple attempts");
                    // Don't throw, try to continue the test
                } else {
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

    test('should handle XSL document operations', async () => {
        console.log("Testing XSL document operations...");
        
        try {
            // Verify popup page with retry logic
            let popup = null;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    popup = await helper.verifyPopupPage('popupDocumentsXSL.html');
                    if (popup) {
                        console.log("Found popup page on attempt", attempt);
                        break;
                    }
                } catch (error) {
                    console.warn(`Failed to find popup page on attempt ${attempt}:`, error.message);
                    
                    if (attempt === 3) {
                        throw new Error(`Failed to find popup page after ${attempt} attempts: ${error.message}`);
                    }
                    
                    // Wait before retrying
                    await helper.safeWait(2000);
                }
            }
            
            expect(popup).toBeTruthy();
            
            // Get frame context with retry logic
            let frame = null;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    frame = await popup.contentFrame();
                    if (frame) {
                        console.log("Got content frame on attempt", attempt);
                        break;
                    }
                } catch (error) {
                    console.warn(`Failed to get content frame on attempt ${attempt}:`, error.message);
                    
                    if (attempt === 3) {
                        throw new Error(`Failed to get content frame after ${attempt} attempts: ${error.message}`);
                    }
                    
                    await helper.safeWait(1000);
                }
            }
            
            // Verify essential UI elements with retry logic
            let editor, validateButton, saveButton;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    editor = await frame.$('#xsl_content');
                    validateButton = await frame.$('#validateXSL');
                    saveButton = await frame.$('#save');
                    
                    if (editor && validateButton && saveButton) {
                        console.log("Found all UI elements on attempt", attempt);
                        break;
                    }
                } catch (error) {
                    console.warn(`Failed to find UI elements on attempt ${attempt}:`, error.message);
                    
                    if (attempt === 3) {
                        // Take screenshot before failing
                        await frame.screenshot({
                            path: `document-designer-ui-elements-failure-${Date.now()}.png`
                        });
                        throw error;
                    }
                    
                    await helper.safeWait(1000);
                }
            }

            expect(editor).toBeTruthy();
            expect(validateButton).toBeTruthy();
            expect(saveButton).toBeTruthy();
        } catch (error) {
            console.error("Error during XSL document test:", error.message);
            
            // Take a screenshot of current page state
            await helper.page.screenshot({
                path: `document-designer-test-failure-${Date.now()}.png`,
                fullPage: true
            });
            
            throw error;
        }
    }, 45000);

    test('should handle document variables', async () => {
        const popup = await helper.verifyPopupPage('popupDocumentsXSL.html');
        
        const variableContent = `
            var documentTitle = "Sales Quote";
            var companyDetails = {
                name: getCompanyName(),
                address: getCompanyAddress()
            };`;
        
        await helper.testLoad(popup, 'variables.js', variableContent, '#variables');
        
        // Verify variables panel exists
        const varsPanel = await popup.$('#variablesPanel');
        expect(varsPanel).toBeTruthy();
    });

    test('should handle document templates', async () => {
        const popup = await helper.verifyPopupPage('popupDocumentsXSL.html');

        const templateContent = '<template id="quote-summary"><div>{{title}}</div></template>';
        await helper.testLoad(popup, 'template.html', templateContent, '#xsl_content');
        
        // Verify template functionality
        const templateSelector = await popup.$('#templateSelector');
        expect(templateSelector).toBeTruthy();
    });

    test('should handle XSL includes', async () => {
        const popup = await helper.verifyPopupPage('popupDocumentsXSL.html');
        
        // Verify includes management UI
        const includesPanel = await popup.$('#includesPanel');
        const addIncludeButton = await popup.$('#addInclude');
        
        expect(includesPanel).toBeTruthy();
        expect(addIncludeButton).toBeTruthy();
    });
});