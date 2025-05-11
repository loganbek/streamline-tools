const { TestHelper } = require('./helpers');
const path = require('path');

describe('Utility Library Tests', () => {
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
        await page.goto(`${process.env.BASE_URL}/admin/library/utility`);
        
        // Test unload utility function
        const expectedCode = 'function calculateVolumePrice() {\n    // Utility function code\n}';
        await helper.testUnload('util', expectedCode, 'calculateVolumePrice.bml');
        
        // Test load utility function
        const loadCode = 'function calculateVolumePrice() {\n    // Updated utility function\n}';
        await helper.testLoad('util', loadCode, 'calculateVolumePrice.bml');
        
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
        const expectedTestCode = 'test("should calculate volume pricing", () => {\n    // Test code\n});';
        await helper.testUnload('util', expectedTestCode, 'calculateVolumePrice.test.bml');
        
        // Test load test script
        const loadTestCode = 'test("should calculate volume pricing", () => {\n    // Updated test\n});';
        await helper.testLoad('util', loadTestCode, 'calculateVolumePrice.test.bml');
        
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