const puppeteer = require('puppeteer');
require('dotenv').config({ path: './tests/.env' });

describe('Rule Matching Tests', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--disable-extensions-except=./src',
                '--load-extension=./src'
            ]
        });
        page = await browser.newPage();
    });

    afterAll(async () => {
        if (browser) {
            await browser.close();
        }
    });

    beforeEach(async () => {
        await page.goto('http://localhost:3000/rules');
    });

    test('should match recommendation rule URL', async () => {
        const rulesList = await page.$$('.rule-item');
        expect(rulesList.length).toBeGreaterThan(0);
        
        const firstRule = rulesList[0];
        await firstRule.click();
        
        const ruleUrl = await page.url();
        expect(ruleUrl).toContain('/rules/');
    });
});