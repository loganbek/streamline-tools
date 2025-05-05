const { TestHelper } = require('./helpers');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: './tests/.env' });

/**
 * Performs login using the shared browser instance with improved error handling
 * @param {Object} page - The page from TestHelper instance
 * @returns {Promise<boolean>} - True if login successful, false otherwise
 */
async function login(page) {
    if (!process.env.BASE_URL) {
        throw new Error('BASE_URL environment variable must be set');
    }
    
    console.log(`Login attempt started at ${new Date().toISOString()}`);
    
    // Get the TestHelper instance that owns this page
    const helper = new TestHelper();
    helper.page = page;
    
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
    
    // Attempt login with better error handling
    try {
        await helper.login();
        console.log(`Login successful at ${new Date().toISOString()}`);
        return true;
    } catch (err) {
        console.error(`Login failed at ${new Date().toISOString()}:`, err.message);
        
        // Take screenshot on failure
        try {
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            await page.screenshot({
                path: path.join(__dirname, `login-failure-${timestamp}.png`),
                fullPage: true
            });
        } catch (screenshotErr) {
            console.warn("Couldn't take login failure screenshot:", screenshotErr.message);
        }
        
        // Rethrow to let calling code handle the error
        throw new Error(`Login failed: ${err.message}`);
    }
}

module.exports = login;

// If this script is run directly, execute the login flow
if (require.main === module) {
    (async () => {
        const helper = new TestHelper();
        await helper.init();
        
        try {
            await helper.login();
            console.log('Login successful');
        } catch (err) {
            console.error('Login failed:', err);
            process.exit(1);
        } finally {
            await helper.cleanup();
        }
    })();
}
