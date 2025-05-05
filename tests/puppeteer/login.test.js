const { TestHelper } = require('./helpers');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: './tests/.env' });

describe('Login Tests', () => {
    let helper;
    let currentTestName = ''; // Track current test name for video naming

    beforeAll(async () => {
        console.log("Setting up Login Tests...");
        helper = new TestHelper();
        await helper.init();
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
    });

    afterEach(async () => {
        // Stop recording and always save the video
        console.log(`Test "${currentTestName}" finished`);
        await helper.stopRecording(true); // Always save the video
        currentTestName = '';
    });

    test('should successfully login', async () => {
        console.log("Testing successful login flow...");
        const page = helper.page;
        
        // Navigate to login page with retry logic
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Navigating to login page (attempt ${attempt}/3)...`);
                await Promise.race([
                    page.goto(process.env.BASE_URL, {
                        waitUntil: 'domcontentloaded',
                        timeout: 20000
                    }),
                    new Promise(resolve => setTimeout(resolve, 20000))
                ]);
                
                // Wait for page to stabilize
                await helper.safeWait(2000);
                
                // Take screenshot after navigation
                await page.screenshot({
                    path: `login-navigation-${Date.now()}.png`,
                    fullPage: true
                });
                break;
            } catch (error) {
                console.error(`Navigation error on attempt ${attempt}:`, error.message);
                
                if (attempt === 3) {
                    throw new Error(`Failed to navigate to login page after 3 attempts: ${error.message}`);
                }
                
                // Wait before retrying
                await helper.safeWait(2000);
            }
        }
        
        // Verify login form elements with retry logic
        let usernameField, passwordField, submitButton;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Checking for login form elements (attempt ${attempt}/3)...`);
                
                usernameField = await page.waitForSelector('#username', { timeout: 10000 })
                    .catch(() => page.waitForSelector('input[name="username"]', { timeout: 5000 }))
                    .catch(() => page.waitForSelector('input[type="text"][id*="user"]', { timeout: 5000 }))
                    .catch(() => null);
                    
                passwordField = await page.waitForSelector('#password', { timeout: 5000 })
                    .catch(() => page.waitForSelector('#psword', { timeout: 5000 }))
                    .catch(() => page.waitForSelector('input[type="password"]', { timeout: 5000 }))
                    .catch(() => null);
                    
                submitButton = await page.waitForSelector('input[type="submit"]', { timeout: 5000 })
                    .catch(() => page.waitForSelector('button[type="submit"]', { timeout: 5000 }))
                    .catch(() => page.waitForSelector('#log_in', { timeout: 5000 }))
                    .catch(() => null);
                
                if (usernameField && passwordField && submitButton) {
                    console.log("Found all login form elements!");
                    break;
                }
                
                if (attempt < 3) {
                    console.log("Some login form elements not found, waiting to retry...");
                    await helper.safeWait(2000);
                }
            } catch (error) {
                console.error(`Error checking login form elements on attempt ${attempt}:`, error.message);
                
                if (attempt === 3) {
                    // Take screenshot before failing
                    await page.screenshot({
                        path: `login-form-missing-${Date.now()}.png`,
                        fullPage: true
                    });
                    throw error;
                }
                
                await helper.safeWait(2000);
            }
        }
        
        // Perform login with better error handling
        try {
            console.log("Entering login credentials...");
            await usernameField.click({ clickCount: 3 }); // Select all text
            await usernameField.type(process.env.CPQ_USERNAME);
            
            await passwordField.click({ clickCount: 3 }); // Select all text
            await passwordField.type(process.env.CPQ_PASSWORD);
            
            console.log("Submitting login form...");
            await Promise.race([
                Promise.all([
                    page.waitForNavigation({ timeout: 30000 }),
                    submitButton.click()
                ]),
                new Promise(resolve => setTimeout(resolve, 30000))
            ]);
            
            // Wait for page to stabilize after login
            await helper.safeWait(3000);
            
            // Take screenshot after login
            await page.screenshot({
                path: `post-login-${Date.now()}.png`,
                fullPage: true
            });
            
            // Verify successful login
            const title = await page.title();
            console.log(`Page title after login: ${title}`);
            
            // Check if we're still on the login page
            const stillOnLoginPage = await page.evaluate(() => {
                return !!document.querySelector('#username') || 
                       !!document.querySelector('#password') ||
                       !!document.querySelector('#psword') ||
                       !!document.querySelector('input[type="password"]');
            });
            
            expect(stillOnLoginPage).toBe(false);
            console.log("Login successful!");
        } catch (error) {
            console.error("Login failed:", error.message);
            
            // Take screenshot on failure
            await page.screenshot({
                path: `login-failure-${Date.now()}.png`,
                fullPage: true
            });
            
            throw error;
        }
    }, 45000);

    test('should handle failed login', async () => {
        console.log("Testing invalid login flow...");
        const page = helper.page;
        
        // Navigate to login page with retry logic
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Navigating to login page (attempt ${attempt}/3)...`);
                await Promise.race([
                    page.goto(process.env.BASE_URL, {
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
                    throw new Error(`Failed to navigate to login page after 3 attempts: ${error.message}`);
                }
                
                // Wait before retrying
                await helper.safeWait(2000);
            }
        }

        // Find form elements with retry logic
        let usernameField, passwordField, submitButton;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                usernameField = await page.waitForSelector('#username', { timeout: 5000 })
                    .catch(() => page.waitForSelector('input[name="username"]', { timeout: 5000 }))
                    .catch(() => page.waitForSelector('input[type="text"][id*="user"]', { timeout: 5000 }))
                    .catch(() => null);
                    
                passwordField = await page.waitForSelector('#password', { timeout: 5000 })
                    .catch(() => page.waitForSelector('#psword', { timeout: 5000 }))
                    .catch(() => page.waitForSelector('input[type="password"]', { timeout: 5000 }))
                    .catch(() => null);
                    
                submitButton = await page.waitForSelector('input[type="submit"]', { timeout: 5000 })
                    .catch(() => page.waitForSelector('button[type="submit"]', { timeout: 5000 }))
                    .catch(() => page.waitForSelector('#log_in', { timeout: 5000 }))
                    .catch(() => null);
                
                if (usernameField && passwordField && submitButton) {
                    console.log("Found all login form elements!");
                    break;
                }
                
                if (attempt < 3) {
                    console.log("Some login form elements not found, waiting to retry...");
                    await helper.safeWait(2000);
                }
            } catch (error) {
                console.error(`Error checking login form elements on attempt ${attempt}:`, error.message);
                
                if (attempt === 3) {
                    throw error;
                }
                
                await helper.safeWait(2000);
            }
        }

        // Attempt login with invalid credentials
        try {
            console.log("Entering invalid credentials...");
            await usernameField.click({ clickCount: 3 }); // Select all text
            await usernameField.type('invalid_user');
            
            await passwordField.click({ clickCount: 3 }); // Select all text
            await passwordField.type('invalid_password');
            
            console.log("Submitting invalid login...");
            await Promise.race([
                Promise.all([
                    page.waitForNavigation({ timeout: 20000 }).catch(() => {}), // Navigation might not happen with invalid login
                    submitButton.click()
                ]),
                new Promise(resolve => setTimeout(resolve, 20000))
            ]);
            
            // Wait for error message to appear
            await helper.safeWait(3000);
            
            // Check for error message or still being on login page
            const hasErrorMessage = await page.evaluate(() => {
                // Look for any error message element using various common selectors
                const errorSelectors = [
                    '.error-message', 
                    '.error', 
                    '.alert-danger',
                    '.login-error',
                    '#error-message',
                    '[role="alert"]'
                ];
                
                // If any error message is found, return true
                for (const selector of errorSelectors) {
                    const el = document.querySelector(selector);
                    if (el && el.textContent.trim().length > 0) return true;
                }
                
                // Also check for login form still being visible
                return !!document.querySelector('#username') || 
                       !!document.querySelector('#password') ||
                       !!document.querySelector('input[type="password"]');
            });
            
            // Take screenshot of error state
            await page.screenshot({
                path: `invalid-login-result-${Date.now()}.png`,
                fullPage: true
            });
            
            expect(hasErrorMessage).toBe(true);
            console.log("Invalid login test passed - error was shown or remained on login page");
        } catch (error) {
            console.error("Error during invalid login test:", error.message);
            
            // Take screenshot on failure
            await page.screenshot({
                path: `invalid-login-test-failure-${Date.now()}.png`,
                fullPage: true
            });
            
            throw error;
        }
    }, 45000);
});
