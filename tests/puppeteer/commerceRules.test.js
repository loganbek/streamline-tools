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

    test('should correctly handle unload/load functionality', async () => {
        const page = helper.page;
        await page.goto(`${process.env.BASE_URL}/admin/commerce/rules`);
        
        // Test unload
        const expectedCode = 'function constrainMultipleFreightGridSelects() {\n    // Test code\n}';
        await helper.testUnload('rules', expectedCode, 'constrainMultipleFreightGridSelects.bml');
        
        // Test load
        const loadCode = 'function constrainMultipleFreightGridSelects() {\n    // Updated code\n}';
        await helper.testLoad('rules', loadCode, 'constrainMultipleFreightGridSelects.bml');
        
        // Verify validation works
        const isValid = await helper.testValidation(loadCode);
        expect(isValid).toBe(true);
    });

    test('should handle test script unload/load', async () => {
        const page = helper.page;
        
        // Enable test script mode
        await page.evaluate(() => {
            document.getElementById('useScript').checked = true;
        });

        // Test unload test script
        const expectedTestCode = 'test("should validate freight grid", () => {\n    // Test code\n});';
        await helper.testUnload('rules', expectedTestCode, 'constrainMultipleFreightGridSelects.test.bml');
        
        // Test load test script
        const loadTestCode = 'test("should validate freight grid", () => {\n    // Updated test\n});';
        await helper.testLoad('rules', loadTestCode, 'constrainMultipleFreightGridSelects.test.bml');
        
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