const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: './tests/.env' });

/**
 * Performs login using the page instance with improved error handling and hard timeout
 * @param {Object} page - The page object from Puppeteer
 * @returns {Promise<boolean>} - True if login successful, false otherwise
 */
async function login(page) {
    if (!process.env.BASE_URL) {
        throw new Error('BASE_URL environment variable must be set');
    }
    
    console.log(`Login attempt started at ${new Date().toISOString()}`);
    
    // Take screenshot before login attempt
    try {
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        await page.screenshot({
            path: path.join(__dirname, `pre-login-${timestamp}.png`),
            fullPage: true
        });
    } catch (err) {
        console.warn("Couldn't take pre-login screenshot:", err.message);
    }
    
    // Create a hard timeout for the entire login process
    const LOGIN_HARD_TIMEOUT = 60 * 1000; // 60 seconds max for login
    const loginTimeout = setTimeout(() => {
        console.error('⚠️ HARD TIMEOUT: Login process took too long, forcing failure');
        throw new Error('Login process timed out after ' + (LOGIN_HARD_TIMEOUT/1000) + ' seconds');
    }, LOGIN_HARD_TIMEOUT);
    
    try {
        // Perform login directly without relying on TestHelper
        if (!process.env.BASE_URL) {
            throw new Error('BASE_URL environment variable must be set');
        }
    
        const username = process.env.CPQ_USERNAME;
        const password = process.env.CPQ_PASSWORD;
    
        if (!username || !password) {
            throw new Error('CPQ_USERNAME and CPQ_PASSWORD environment variables must be set');
        }
    
        console.log("Using credentials - Username:", username);
        console.log("Base URL:", process.env.BASE_URL);
        
        // Navigate to login page
        try {
            await Promise.race([
                page.goto(process.env.BASE_URL, { 
                    waitUntil: ['domcontentloaded'],
                    timeout: 30000
                }),
                new Promise(resolve => setTimeout(resolve, 30000))
            ]);
        } catch (navError) {
            console.log("Navigation timeout or error, but continuing:", navError.message);
        }
        
        // Wait for stability
        await page.waitForTimeout(2000);
        
        // Unified login field selectors
        const userNameSelectors = ['#username', 'input[name="username"]', 'input[type="text"][id*="user"]', 'input[type="email"]'];
        const passwordSelectors = ['#password', '#psword', 'input[name="password"]', 'input[type="password"]'];
        const submitSelectors = ['#log_in', 'input[type="submit"]', 'button[type="submit"]', 'button.login-button'];
        
        // Fill username with waiting and fallback strategy
        let userFieldFound = false;
        for (const selector of userNameSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 5000 })
                    .then(async (el) => {
                        console.log(`Found username field with selector: ${selector}`);
                        await el.click({ clickCount: 3 }); 
                        await el.type(username, { delay: 50 });
                        userFieldFound = true;
                    })
                    .catch(() => {});
                    
                if (userFieldFound) break;
            } catch (e) {}
        }
        
        if (!userFieldFound) {
            console.log("Could not find username field with any selector");
            throw new Error("Could not find username field");
        }
        
        // Fill password with waiting and fallback strategy
        let passFieldFound = false;
        for (const selector of passwordSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 5000 })
                    .then(async (el) => {
                        console.log(`Found password field with selector: ${selector}`);
                        await el.click({ clickCount: 3 });
                        await el.type(password, { delay: 50 });
                        passFieldFound = true;
                    })
                    .catch(() => {});
                    
                if (passFieldFound) break;
            } catch (e) {}
        }
        
        if (!passFieldFound) {
            console.log("Could not find password field with any selector");
            throw new Error("Could not find password field");
        }
        
        // Submit form with multiple strategies
        let submitted = false;
        
        // 1. Try submit button click
        for (const selector of submitSelectors) {
            if (submitted) break;
            try {
                await page.waitForSelector(selector, { timeout: 5000 })
                    .then(async (button) => {
                        console.log(`Found submit button with selector: ${selector}`);
                        await Promise.all([
                            button.click(),
                            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
                                .catch(() => console.log("Navigation promise after submit resolved or timed out"))
                        ]);
                        submitted = true;
                    })
                    .catch(() => {});
            } catch (e) {}
        }
        
        // 2. If button click failed, try pressing Enter on password field
        if (!submitted) {
            try {
                const passwordField = await page.$('input[type="password"]');
                if (passwordField) {
                    console.log("Submitting by pressing Enter on password field");
                    await Promise.all([
                        passwordField.press('Enter'),
                        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
                            .catch(() => console.log("Navigation after Enter key resolved or timed out"))
                    ]);
                    submitted = true;
                }
            } catch (e) {}
        }
        
        // 3. If that also failed, try submitting the form directly
        if (!submitted) {
            try {
                console.log("Trying to submit form directly");
                const formSubmitted = await page.evaluate(() => {
                    const form = document.querySelector('form');
                    if (form) {
                        form.submit();
                        return true;
                    }
                    return false;
                });
                
                if (formSubmitted) {
                    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
                        .catch(() => console.log("Navigation after form submit resolved or timed out"));
                    submitted = true;
                }
            } catch (e) {}
        }
        
        if (!submitted) {
            console.log("Could not submit login form with any method");
            throw new Error("Could not submit login form");
        }
        
        // Wait for page to load after login
        await page.waitForTimeout(5000);
        
        // Check login success with comprehensive verification
        const loginSuccess = await page.evaluate(() => {
            // Elements that indicate we're still on the login page
            const loginPageSelectors = [
                '#username', 
                '#password', 
                'input[type="password"]',
                '.login-form',
                'form[action*="login"]'
            ];
            
            // Elements that indicate we're logged in
            const loggedInSelectors = [
                '.user-profile', 
                '.logged-in-user',
                '.logout-button',
                '#logout',
                'a[href*="logout"]',
                '.user-account',
                '.header-user-info',
                '#navUserMenu'
            ];
            
            // Error message indicators
            const errorSelectors = [
                '.error', 
                '.error-message', 
                '.alert-danger', 
                '[role="alert"]', 
                '#errorMessage',
                '.login-error'
            ];
            
            const stillOnLoginPage = loginPageSelectors.some(selector => 
                document.querySelector(selector) !== null
            );
            
            const hasLoggedInIndicators = loggedInSelectors.some(selector => 
                document.querySelector(selector) !== null
            );
            
            const hasErrorMessages = errorSelectors.some(selector => {
                const el = document.querySelector(selector);
                return el && el.textContent.trim().length > 0;
            });
            
            return {
                success: !stillOnLoginPage && hasLoggedInIndicators && !hasErrorMessages,
                stillOnLoginPage,
                hasLoggedInIndicators,
                hasErrorMessages,
                url: window.location.href,
                title: document.title
            };
        });

        if (!loginSuccess.success) {
            throw new Error(`Login verification failed: ${JSON.stringify(loginSuccess)}`);
        }

        console.log(`Login successful at ${new Date().toISOString()}`);
        clearTimeout(loginTimeout);
        return true;
    } catch (err) {
        clearTimeout(loginTimeout);
        console.error(`Login failed at ${new Date().toISOString()}:`, err.message);
        
        // Take final screenshot on failure
        try {
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            await page.screenshot({
                path: path.join(__dirname, `login-failure-${timestamp}.png`),
                fullPage: true
            });
        } catch (screenshotErr) {
            console.warn("Couldn't take login failure screenshot:", screenshotErr.message);
        }
        
        // Return false instead of rethrowing to prevent test from hanging
        return false;
    }
}

module.exports = login;

// If this script is run directly, execute the login flow
if (require.main === module) {
    const puppeteer = require('puppeteer');
    
    (async () => {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });
        
        const page = await browser.newPage();
        
        try {
            const success = await login(page);
            console.log('Login process completed, success:', success);
            
            if (!success) {
                process.exit(1);
            }
        } catch (err) {
            console.error('Login error:', err);
            process.exit(1);
        } finally {
            await browser.close();
        }
    })();
}
