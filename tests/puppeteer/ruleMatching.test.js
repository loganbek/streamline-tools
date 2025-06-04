const puppeteer = require('puppeteer');
require('dotenv').config({ path: './tests/.env' });
const { TestHelper } = require('./helpers');
const login = require('./login');
const rulesData = require('../../src/rulesList.json');

describe('Rule Matching Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
        await login(helper.page);
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    // Test main rule categories
    const mainCategories = ['Config', 'Commerce', 'Utils', 'Interfaces', 'Stylesheets', 'Documents'];
    
    mainCategories.forEach(category => {
        test(`${category} - should match rules and load correct UI`, async () => {
            const categoryRules = rulesData.filter(rule => rule.AppArea === category);
            if (categoryRules.length === 0) {
                return; // Skip if no rules for this category
            }

            const testRule = categoryRules[0];
            const testUrl = testRule.URL.replace(/\*/g, 'devmcnichols');
            
            await helper.page.goto(testUrl);
            await helper.verifyExtensionLoaded();
            
            // Verify correct popup UI loads
            const popup = await helper.verifyPopupPage(testRule.ui);
            expect(popup).toBeTruthy();

            // Verify basic UI elements
            if (testRule.hasTest === "TRUE") {
                const testButton = await popup.$('#runTest');
                expect(testButton).toBeTruthy();
            }

            const actionButtons = await popup.$$('button');
            expect(actionButtons.length).toBeGreaterThan(0);
        });
    });

    test('should handle navigation between pages', async () => {
        const configRule = rulesData.find(r => r.AppArea === 'Config');
        const commerceRule = rulesData.find(r => r.AppArea === 'Commerce');

        if (configRule && commerceRule) {
            // Test navigation between different rule types
            await helper.page.goto(configRule.URL.replace(/\*/g, 'devmcnichols'));
            await helper.verifyExtensionLoaded();
            const configPopup = await helper.verifyPopupPage(configRule.ui);
            expect(configPopup).toBeTruthy();

            await helper.page.goto(commerceRule.URL.replace(/\*/g, 'devmcnichols'));
            await helper.verifyExtensionLoaded();
            const commercePopup = await helper.verifyPopupPage(commerceRule.ui);
            expect(commercePopup).toBeTruthy();
        }
    });
});