const puppeteer = require('puppeteer');
const path = require('path');

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

// import puppeteer from 'puppeteer';
// import path from 'path';

// const pathToExtension = path.join(process.cwd(), 'streamline-tools');
// const browser = await puppeteer.launch({
//   args: [
//     `--disable-extensions-except=${pathToExtension}`,
//     `--load-extension=${pathToExtension}`,
//   ],
// });

// const workerTarget = await browser.waitForTarget(
//   // Assumes that there is only one service worker created by the extension and its URL ends with background.js.
//   target =>
//     target.type() === 'service_worker' &&
//     target.url().endsWith('background.js'),
// );

// const worker = await workerTarget.worker();

// // Open a popup (available for Canary channels).
// await worker.evaluate('chrome.action.openPopup();');

// const popupTarget = await browser.waitForTarget(
//   // Assumes that there is only one page with the URL ending with popup.html and that is the popup created by the extension.
//   target => target.type() === 'page' && target.url().endsWith('popup.html'),
// );

// const popupPage = popupTarget.asPage();

// // Test the popup page as you would any other page.

// await browser.close();