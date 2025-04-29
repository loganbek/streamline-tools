const { TestHelper } = require('./helpers');
const dotenv = require('dotenv');
dotenv.config({ path: './tests/.env' });

/**
 * Performs login using the shared browser instance
 * @param {Object} page - The page from TestHelper instance
 */
async function login(page) {
    if (!process.env.BASE_URL) {
        throw new Error('BASE_URL environment variable must be set');
    }
    
    // Get the TestHelper instance that owns this page
    const helper = new TestHelper();
    helper.page = page;
    await helper.login();
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
