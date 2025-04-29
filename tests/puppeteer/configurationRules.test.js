const { TestHelper } = require('./helpers');
const path = require('path');

describe('Configuration Rules Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should handle constraint rules', async () => {
        const page = helper.page;
        await page.goto(`${process.env.BASE_URL}/admin/configuration/rules`);
        
        // Verify constraint rule UI elements
        const editor = await page.$('#constraintEditor');
        const validateButton = await page.$('#validateConstraint');
        const saveButton = await page.$('#saveConstraint');
        
        expect(editor).toBeTruthy();
        expect(validateButton).toBeTruthy();
        expect(saveButton).toBeTruthy();
    });

    test('should handle hiding rules', async () => {
        const page = helper.page;
        await page.goto(`${process.env.BASE_URL}/admin/configuration/hiding`);
        
        // Verify hiding rule UI elements
        const editor = await page.$('#hidingEditor');
        const validateButton = await page.$('#validateHiding');
        const saveButton = await page.$('#saveHiding');
        
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