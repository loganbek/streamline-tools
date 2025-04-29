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

    test('should correctly handle constraint rules unload/load', async () => {
        const page = helper.page;
        await page.goto(`${process.env.BASE_URL}/admin/configuration/rules`);
        
        // Test unload constraint rule
        const expectedCode = 'function constrainProductType() {\n    // Constraint rule code\n}';
        await helper.testUnload('config', expectedCode, 'constrainProductType.bml');
        
        // Test load constraint rule
        const loadCode = 'function constrainProductType() {\n    // Updated constraint rule\n}';
        await helper.testLoad('config', loadCode, 'constrainProductType.bml');
        
        // Verify validation works
        const isValid = await helper.testValidation(loadCode);
        expect(isValid).toBe(true);
    });

    test('should correctly handle hiding rules unload/load', async () => {
        const page = helper.page;
        await page.goto(`${process.env.BASE_URL}/admin/configuration/hiding`);
        
        // Test unload hiding rule
        const expectedCode = 'function hideProductAttributes() {\n    // Hiding rule code\n}';
        await helper.testUnload('config', expectedCode, 'hideProductAttributes.bml');
        
        // Test load hiding rule
        const loadCode = 'function hideProductAttributes() {\n    // Updated hiding rule\n}';
        await helper.testLoad('config', loadCode, 'hideProductAttributes.bml');
        
        // Verify validation works
        const isValid = await helper.testValidation(loadCode);
        expect(isValid).toBe(true);
    });

    test('should handle test script unload/load for configuration rules', async () => {
        const page = helper.page;
        
        // Enable test script mode
        await page.evaluate(() => {
            document.getElementById('useScript').checked = true;
        });

        // Test unload test script
        const expectedTestCode = 'test("should apply configuration rule", () => {\n    // Test code\n});';
        await helper.testUnload('config', expectedTestCode, 'constrainProductType.test.bml');
        
        // Test load test script
        const loadTestCode = 'test("should apply configuration rule", () => {\n    // Updated test\n});';
        await helper.testLoad('config', loadTestCode, 'constrainProductType.test.bml');
        
        // Verify test runs successfully
        await page.click('#runTest');
        await helper.waitForStableState();
        
        const testResult = await page.evaluate(() => {
            const resultEl = document.querySelector('.test-result');
            return resultEl ? resultEl.textContent : null;
        });
        
        expect(testResult).toContain('1 passed');
    });
});