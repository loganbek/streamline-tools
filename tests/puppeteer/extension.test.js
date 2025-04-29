const puppeteer = require('puppeteer');
const path = require('path');
require('dotenv').config({ path: './tests/.env' });
const { getExtensionId } = require('./helpers');

describe('Chrome Extension Tests', () => {
    let browser;
    let page;
    let extensionId;

    beforeAll(async () => {
        const extensionPath = path.resolve(__dirname, '../../src');
        
        try {
            browser = await puppeteer.launch({
                headless: false,
                args: [
                    `--disable-extensions-except=${extensionPath}`,
                    `--load-extension=${extensionPath}`,
                    '--no-sandbox',
                    '--disable-dev-shm-usage'
                ],
                timeout: 30000
            });

            // Wait for extension to be properly loaded
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            page = await browser.newPage();
            extensionId = await getExtensionId(browser);
            
            if (!extensionId) {
                throw new Error('Failed to get extension ID - extension may not have loaded properly');
            }
        } catch (error) {
            console.error('Failed to initialize extension testing:', error);
            if (browser) {
                await browser.close();
            }
            throw error;
        }
    });

    afterAll(async () => {
        try {
            if (page) {
                await page.close();
            }
            if (browser) {
                await browser.close();
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    });

    beforeEach(async () => {
        try {
            await page.goto(`chrome-extension://${extensionId}/options/options.html`, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
        } catch (error) {
            console.error('Failed to load options page:', error);
            throw error;
        }
    });

    test('should load extension options page', async () => {
        // Verify the options page loads correctly
        await page.waitForSelector('body');
        const title = await page.title();
        expect(title).toBe('Streamline CPQ Tools Options');
    });
});