const { TestHelper } = require('./helpers');
const path = require('path');

describe('Commerce Rules Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should handle basic rule operations', async () => {
        const page = helper.page;
        await page.goto(`${process.env.BASE_URL}/admin/commerce/rules`);
        
        // Verify UI elements
        const editor = await page.$('#codeEditor');
        const validateButton = await page.$('#validate');
        const saveButton = await page.$('#save');
        
        expect(editor).toBeTruthy();
        expect(validateButton).toBeTruthy();
        expect(saveButton).toBeTruthy();
    });

    test('should handle test script operations', async () => {
        const page = helper.page;
        
        // Check test script UI elements
        const testScriptToggle = await page.$('#useScript');
        const testEditor = await page.$('#testEditor');
        const runTestButton = await page.$('#runTest');

        expect(testScriptToggle).toBeTruthy();
        expect(testEditor).toBeTruthy();
        expect(runTestButton).toBeTruthy();
    });
});