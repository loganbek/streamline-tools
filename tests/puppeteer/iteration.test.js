const { TestHelper } = require('./helpers');

describe('Iteration Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should handle basic iteration', async () => {
        const page = helper.page;
        await page.evaluate(() => {
            window._iterationStarted = false;
            window._iterationEnded = false;
            
            window.addEventListener('startIteration', () => {
                window._iterationStarted = true;
            });
            
            window.addEventListener('endIteration', () => {
                window._iterationEnded = true;
            });
        });

        await page.evaluate(() => {
            chrome.runtime.sendMessage({ type: 'iterate' });
        });

        // Wait for iteration to complete
        await page.waitForFunction(() => {
            return window._iterationStarted && window._iterationEnded;
        }, { timeout: 5000 });

        const result = await page.evaluate(() => ({
            started: window._iterationStarted,
            ended: window._iterationEnded
        }));

        expect(result.started).toBe(true);
        expect(result.ended).toBe(true);
    });

    test('should have iteration controls', async () => {
        const page = helper.page;

        // Verify iteration UI elements
        const startButton = await page.$('#startIteration');
        const stopButton = await page.$('#stopIteration');
        const statusIndicator = await page.$('#iterationStatus');

        expect(startButton).toBeTruthy();
        expect(stopButton).toBeTruthy();
        expect(statusIndicator).toBeTruthy();
    });
});