const puppeteer = require('puppeteer');

describe('Chrome Extension Tests', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: false });
        page = await browser.newPage();
        await page.goto('chrome-extension://<your-extension-id>/popup.html');
    });

    afterAll(async () => {
        await browser.close();
    });

    test('should display the correct title', async () => {
        const title = await page.title();
        expect(title).toBe('Expected Title');
    });

    // Add more tests as needed
});