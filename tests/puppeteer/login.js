const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
dotenv.config({ path: './tests/.env' });

const username = process.env.CPQ_USERNAME;
const password = process.env.CPQ_PASSWORD;

if (!username || !password) {
    console.error('Error: CPQ_USERNAME and CPQ_PASSWORD environment variables must be set');
    process.exit(1);
}

async function login(page) {
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.goto(process.env.BASE_URL);
    
    // Wait for and fill in login form
    await page.waitForSelector('#username');
    await page.type('#username', process.env.USERNAME);
    await page.type('#password', process.env.PASSWORD);
    
    // Click login button and wait for navigation
    await Promise.all([
        page.waitForNavigation(),
        page.click('input[type="submit"]')
    ]);
    
    // Verify we're logged in
    const title = await page.title();
    if (!title.includes('Home')) {
        throw new Error('Login failed - could not verify successful login');
    }
}

// Export the login function to be used by other test files
module.exports = login;

// If this script is run directly, execute the login flow
if (require.main === module) {
    (async () => {
        const browser = await puppeteer.launch({
            headless: "new", // Use new headless mode
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        try {
            await login(page);
            console.log('Login successful');
        } catch (err) {
            console.error('Login failed:', err);
            process.exit(1);
        } finally {
            await browser.close();
        }
    })();
}
