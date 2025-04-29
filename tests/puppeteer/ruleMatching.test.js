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

    // Group rules by AppArea for organized testing
    const rulesByArea = rulesData.reduce((acc, rule) => {
        if (!rule.AppArea) return acc;
        if (!acc[rule.AppArea]) acc[rule.AppArea] = [];
        acc[rule.AppArea].push(rule);
        return acc;
    }, {});

    // Test one representative URL from each AppArea
    Object.entries(rulesByArea).forEach(([area, rules]) => {
        const testRule = rules[0]; // Use first rule as representative
        
        test(`${area} - should match rules and load correct UI`, async () => {
            const testUrl = testRule.URL.replace(/\*/g, 'devmcnichols');
            
            await helper.page.goto(testUrl);
            await helper.verifyExtensionLoaded();
            
            // Verify correct popup UI is loaded
            const popup = await helper.verifyPopupPage(testRule.ui);
            expect(popup).toBeTruthy();

            // Verify code selector exists if specified
            if (testRule.codeSelector) {
                const element = await helper.page.$(testRule.codeSelector);
                expect(element).toBeTruthy();
            }

            // If it's a test-enabled rule, verify test elements
            if (testRule.hasTest === "TRUE") {
                const testElement = await helper.page.$('textarea[name="testScript"]');
                expect(testElement).toBeTruthy();
            }
        });
    });

    test('should handle navigation without reload', async () => {
        // Test navigation between different rule types
        const configRule = rulesByArea.Config[0];
        const commerceRule = rulesByArea.Commerce[0];

        await helper.page.goto(configRule.URL.replace(/\*/g, 'devmcnichols'));
        await helper.verifyExtensionLoaded();
        let popup = await helper.verifyPopupPage(configRule.ui);
        expect(popup).toBeTruthy();

        await helper.page.goto(commerceRule.URL.replace(/\*/g, 'devmcnichols'));
        await helper.verifyExtensionLoaded();
        popup = await helper.verifyPopupPage(commerceRule.ui);
        expect(popup).toBeTruthy();
    });
});