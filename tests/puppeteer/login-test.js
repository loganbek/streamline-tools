/**
 * Simple login test to verify we can authenticate with the BigMachines instance
 */
const { TestHelper } = require('./helpers');

describe('CPQ Login Test', () => {
    let helper;
    
    beforeAll(async () => {
        console.log('Setting up test helper...');
        helper = new TestHelper();
    }, 30000);
    
    afterAll(async () => {
        console.log('Cleaning up...');
        if (helper) {
            try {
                await helper.cleanup();
            } catch (e) {
                console.error('Error during cleanup:', e);
            }
        }
    }, 30000);
    
    test('Should connect to BigMachines and login successfully', async () => {
        try {
            console.log(`Attempting to initialize with BASE_URL: ${process.env.BASE_URL}`);
            await helper.init();
            
            console.log('TestHelper initialized successfully');
            
            // Navigate to the homepage after login
            const page = helper.page;
            
            console.log('Navigating to homepage...');
            await page.goto(process.env.BASE_URL, { 
                waitUntil: ['domcontentloaded', 'networkidle2'],
                timeout: 45000
            });
            
            // Take a screenshot
            await page.screenshot({ path: 'login-test-homepage.png', fullPage: true });
            
            // Check for login status
            const isLoggedIn = await page.evaluate(() => {
                // Common login page elements
                const loginElements = [
                    '#username', 
                    '#password',
                    'input[name="username"]',
                    'input[type="password"]',
                    'form[action*="login"]',
                    'input[type="submit"][value="Login"]',
                    'button[type="submit"]'
                ];
                
                // Common logged-in indicators
                const loggedInElements = [
                    '.user-profile',
                    '.logged-in-user',
                    '.logout-button',
                    '#logout',
                    'a[href*="logout"]',
                    '.header-user-info',
                    '.user-name',
                    '#navUserMenu',
                    '.nx-header',
                    '.crm-ribbon'
                ];
                
                // Check if any login elements exist
                const hasLoginElements = loginElements.some(selector => 
                    document.querySelector(selector) !== null
                );
                
                // Check if any logged-in indicators exist
                const hasLoggedInIndicators = loggedInElements.some(selector => 
                    document.querySelector(selector) !== null
                );
                
                return {
                    hasLoginElements,
                    hasLoggedInIndicators,
                    url: window.location.href,
                    title: document.title
                };
            });
            
            console.log('Login status:', JSON.stringify(isLoggedIn, null, 2));
            
            // Output current URL
            console.log('Current URL:', await page.url());
            console.log('Page title:', await page.title());
            
            // Get page content for debugging
            const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
            console.log('Page content (truncated):', bodyText);
            
            // Take another screenshot
            await page.screenshot({ path: 'login-test-final.png', fullPage: true });
            
            if (isLoggedIn.hasLoginElements) {
                console.warn('WARNING: Login elements still visible, login may have failed');
            }
            
            expect(isLoggedIn.hasLoggedInIndicators).toBe(true);
            expect(isLoggedIn.hasLoginElements).toBe(false);
            
        } catch (error) {
            console.error('Error during login test:', error);
            
            // Try to take a screenshot even if there's an error
            try {
                if (helper && helper.page) {
                    await helper.page.screenshot({ path: 'login-test-error.png', fullPage: true });
                }
            } catch (screenshotError) {
                console.error('Could not take error screenshot:', screenshotError);
            }
            
            throw error;
        }
    }, 120000);
});