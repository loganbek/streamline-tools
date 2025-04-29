const { TestHelper } = require('./helpers');
const login = require('./login');

describe('Configuration Recommendation Rule Editor Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should navigate through recommendation rule editor', async () => {
        const page = helper.page;
        const timeout = 5000;
        page.setDefaultTimeout(timeout);

        await page.goto(`${process.env.BASE_URL}/admin/configuration/rules/edit_rule.jsp?rule_id=5268044&rule_type=1&pline_id=-1&segment_id=11&model_id=-1&fromList=true`, {
            waitUntil: 'networkidle0'
        });

        // Wait for page to load
        await page.waitForSelector('#x-auto-14', { timeout: 10000 });

        // Verify we're on the correct page
        const pageTitle = await page.title();
        expect(pageTitle).toContain('Rule Editor');

        // Click Advanced Condition if it exists
        try {
            await page.click('#x-auto-14 td:nth-of-type(3) label');
        } catch (e) {
            console.log('Advanced Condition button not found or not clickable');
        }

        // Extension specific tests
        // Verify the extension popup is set correctly for this URL
        const extensionPopup = await browser.evaluate(() => {
            return new Promise((resolve) => {
                chrome.action.getPopup({ tabId: chrome.tabs.getCurrent().id }, (popup) => {
                    resolve(popup);
                });
            });
        });

        expect(extensionPopup).toContain('popup/popup.html');
    }, 30000);
});
