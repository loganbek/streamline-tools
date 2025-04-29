const { TestHelper } = require('./helpers');
const path = require('path');

describe('Commerce Actions Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should correctly handle before formulas unload/load', async () => {
        const page = helper.page;
        await page.goto(`${process.env.BASE_URL}/admin/commerce/actions`);
        
        // Test unload before formulas
        const expectedBeforeCode = 'function addVendor_quote_beforeFormulas() {\n    // Before formula code\n}';
        await helper.testUnload('actions', expectedBeforeCode, 'addVendor_quote.beforeFormulas.bml');
        
        // Test load before formulas
        const loadBeforeCode = 'function addVendor_quote_beforeFormulas() {\n    // Updated before formula\n}';
        await helper.testLoad('actions', loadBeforeCode, 'addVendor_quote.beforeFormulas.bml');
        
        // Verify validation
        const isValid = await helper.testValidation(loadBeforeCode);
        expect(isValid).toBe(true);
    });

    test('should correctly handle after formulas unload/load', async () => {
        const page = helper.page;
        
        // Test unload after formulas
        const expectedAfterCode = 'function addVendor_quote_afterFormulas() {\n    // After formula code\n}';
        await helper.testUnload('actions', expectedAfterCode, 'addVendor_quote.afterFormulas.bml');
        
        // Test load after formulas
        const loadAfterCode = 'function addVendor_quote_afterFormulas() {\n    // Updated after formula\n}';
        await helper.testLoad('actions', loadAfterCode, 'addVendor_quote.afterFormulas.bml');
        
        // Verify validation
        const isValid = await helper.testValidation(loadAfterCode);
        expect(isValid).toBe(true);
    });

    test('should handle test script unload/load', async () => {
        const page = helper.page;
        
        // Enable test script mode
        await page.evaluate(() => {
            document.getElementById('useScript').checked = true;
        });

        // Test unload test script
        const expectedTestCode = 'test("should handle vendor quote action", () => {\n    // Test code\n});';
        await helper.testUnload('actions', expectedTestCode, 'addVendor_quote.test.bml');
        
        // Test load test script
        const loadTestCode = 'test("should handle vendor quote action", () => {\n    // Updated test\n});';
        await helper.testLoad('actions', loadTestCode, 'addVendor_quote.test.bml');
        
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