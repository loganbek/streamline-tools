const puppeteer = require('puppeteer');
require('dotenv').config({ path: './tests/.env' });

describe('Login Tests', () => {
    let browser;
    let page;

    beforeAll(async () => {
        if (!process.env.CPQ_USERNAME || !process.env.CPQ_PASSWORD) {
            throw new Error('CPQ_USERNAME and CPQ_PASSWORD environment variables must be set');
        }

        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-extensions-except=./src',
                '--load-extension=./src'
            ]
        });
        page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
    });

    afterAll(async () => {
        if (browser) {
            await browser.close();
        }
    });

    test('should login successfully', async () => {
        await page.goto('http://localhost:3000/login');
        await page.waitForSelector('#username');
        await page.type('#username', process.env.CPQ_USERNAME);
        await page.type('#password', process.env.CPQ_PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForNavigation();
        
        // Verify successful login
        const pageTitle = await page.title();
        expect(pageTitle).toContain('Dashboard');
    });
});
