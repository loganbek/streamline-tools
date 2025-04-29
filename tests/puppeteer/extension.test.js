const puppeteer = require('puppeteer');
const path = require('path');
require('dotenv').config({ path: './tests/.env' });
const { getExtensionId, TestHelper } = require('./helpers');

describe('Chrome Extension Tests', () => {
    let helper;
    let extensionId;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
        extensionId = await helper.getExtensionId(helper.browser);
        
        if (!extensionId) {
            throw new Error('Failed to get extension ID - extension may not have loaded properly');
        }
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    beforeEach(async () => {
        await helper.page.goto(`chrome-extension://${extensionId}/options/options.html`, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
    });

    test('should load extension options page', async () => {
        await helper.page.waitForSelector('body');
        const title = await helper.page.title();
        expect(title).toBe('Streamline CPQ Tools Options');
    });

    // Add more extension-specific tests here...
});