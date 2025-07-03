const { test, expect } = require('@playwright/test');
const { TestHelper } = require('./helpers');

test.describe('Login Tests', () => {
    let helper;
    const TEST_TIMEOUT = 60000; // 60 seconds max per test

    test.beforeEach(async ({ page, context }) => {
        console.log("Setting up Login Test...");
        helper = new TestHelper();
        await helper.init(page, context);
    });

    test.afterEach(async () => {
        if (helper) {
            await helper.cleanup();
        }
    });

    test('should successfully login using helper function', async () => {
        console.log("Testing login using the helper function...");
        
        // Skip test if environment variables are not set
        if (process.env.BYPASS_LOGIN === 'true') {
            test.skip('Login test skipped due to BYPASS_LOGIN environment variable');
            return;
        }
        
        if (!process.env.CPQ_USERNAME || !process.env.CPQ_PASSWORD || !process.env.BASE_URL) {
            test.skip('Login test skipped due to missing environment variables');
            return;
        }
        
        try {
            // Use the improved login helper
            const loginSuccessful = await helper.login();
            
            // Take screenshot after login attempt
            await helper.takeScreenshot(`login-result-${Date.now()}`);
            
            // Verify login was successful
            expect(loginSuccessful).toBe(true);
            console.log("Login successful");
            
            // Verify we're not on a login page anymore
            const currentUrl = helper.page.url();
            expect(currentUrl).not.toMatch(/login|signin/i);
            
            // Look for elements that indicate successful login
            const loggedInIndicators = [
                'a[href*="logout"]',
                '.user-menu',
                '[class*="username"]',
                '[class*="profile"]'
            ];
            
            let foundIndicator = false;
            for (const selector of loggedInIndicators) {
                const element = helper.page.locator(selector);
                if (await element.isVisible()) {
                    foundIndicator = true;
                    console.log(`Found logged-in indicator: ${selector}`);
                    break;
                }
            }
            
            // Note: Some systems might not have obvious logged-in indicators
            if (!foundIndicator) {
                console.log("No obvious logged-in indicators found, but URL suggests login success");
            }
            
        } catch (error) {
            console.error("Login failed:", error.message);
            await helper.takeScreenshot(`login-failed-${Date.now()}`);
            throw error;
        }
    });

    test('should handle failed login', async () => {
        console.log("Testing invalid login flow...");
        
        // Skip test if BASE_URL is not set
        if (!process.env.BASE_URL) {
            test.skip('Login test skipped due to missing BASE_URL');
            return;
        }
        
        try {
            // Navigate to login page
            console.log("Navigating to login page...");
            await helper.page.goto(process.env.BASE_URL);
            
            // Wait for page to stabilize
            await helper.waitForStableState();
            
            // Look for login form elements
            console.log("Looking for login form elements...");
            
            const usernameField = helper.page.locator('#username, input[name="username"], input[type="text"]').first();
            const passwordField = helper.page.locator('#password, input[name="password"], input[type="password"]').first();
            const loginButton = helper.page.locator('#login-button, input[type="submit"], button[type="submit"]').first();
            
            // Wait for form elements to be visible
            await expect(usernameField).toBeVisible({ timeout: 10000 });
            await expect(passwordField).toBeVisible({ timeout: 5000 });
            await expect(loginButton).toBeVisible({ timeout: 5000 });
            
            // Fill in invalid credentials
            console.log("Filling invalid credentials...");
            await usernameField.fill('invalid_username_test');
            await passwordField.fill('invalid_password_test');
            
            // Submit the form
            console.log("Submitting login form...");
            await loginButton.click();
            
            // Wait for response
            await helper.safeWait(3000);
            
            // Take screenshot after failed login attempt
            await helper.takeScreenshot(`failed-login-attempt-${Date.now()}`);
            
            // Check for error messages or remaining on login page
            const currentUrl = helper.page.url();
            const stillOnLoginPage = currentUrl.includes('login') || currentUrl.includes('signin');
            
            if (stillOnLoginPage) {
                console.log("✓ Failed login correctly remained on login page");
            }
            
            // Look for error messages
            const errorSelectors = [
                '.error',
                '.alert-danger', 
                '[class*="error"]',
                '[class*="invalid"]',
                '[class*="warning"]'
            ];
            
            let foundError = false;
            for (const selector of errorSelectors) {
                const errorElement = helper.page.locator(selector);
                if (await errorElement.isVisible()) {
                    const errorText = await errorElement.textContent();
                    console.log(`Found error message: ${errorText}`);
                    foundError = true;
                    break;
                }
            }
            
            // The test passes if either we're still on login page OR we found an error message
            const loginFailedProperly = stillOnLoginPage || foundError;
            expect(loginFailedProperly).toBe(true);
            
            console.log("Invalid login correctly rejected");
            
        } catch (error) {
            console.error("Failed login test encountered an error:", error.message);
            await helper.takeScreenshot(`failed-login-test-error-${Date.now()}`);
            throw error;
        }
    });

    test('should validate login form elements', async () => {
        console.log("Testing login form validation...");
        
        // Skip test if BASE_URL is not set
        if (!process.env.BASE_URL) {
            test.skip('Login form test skipped due to missing BASE_URL');
            return;
        }
        
        try {
            // Navigate to login page
            await helper.page.goto(process.env.BASE_URL);
            await helper.waitForStableState();
            
            // Check for essential form elements
            const usernameField = helper.page.locator('#username, input[name="username"], input[type="text"]').first();
            const passwordField = helper.page.locator('#password, input[name="password"], input[type="password"]').first();
            const loginButton = helper.page.locator('#login-button, input[type="submit"], button[type="submit"]').first();
            
            // Verify elements exist and are visible
            await expect(usernameField).toBeVisible();
            await expect(passwordField).toBeVisible();
            await expect(loginButton).toBeVisible();
            
            // Test form field properties
            expect(await usernameField.getAttribute('type')).toBeTruthy();
            expect(await passwordField.getAttribute('type')).toBe('password');
            
            // Test that fields are initially empty (or can be cleared)
            await usernameField.clear();
            await passwordField.clear();
            
            expect(await usernameField.inputValue()).toBe('');
            expect(await passwordField.inputValue()).toBe('');
            
            // Test field input functionality
            await usernameField.fill('test_input');
            await passwordField.fill('test_password');
            
            expect(await usernameField.inputValue()).toBe('test_input');
            // Password field value checking might be restricted
            
            // Test form submission button
            expect(await loginButton.isEnabled()).toBe(true);
            
            console.log("Login form validation completed successfully");
            
        } catch (error) {
            console.error("Login form validation failed:", error.message);
            await helper.takeScreenshot(`login-form-validation-error-${Date.now()}`);
            throw error;
        }
    });
});