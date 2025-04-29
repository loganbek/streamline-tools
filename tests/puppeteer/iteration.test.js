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
        const timeout = 5000;
        page.setDefaultTimeout(timeout);

        // Set up iteration state tracking
        let iterationStartCount = 0;
        let iterationEndCount = 0;

        // Monitor iteration events
        await page.evaluate(() => {
            window.addEventListener('startIteration', () => {
                window._iterationStartCount = (window._iterationStartCount || 0) + 1;
            });
            window.addEventListener('endIteration', () => {
                window._iterationEndCount = (window._iterationEndCount || 0) + 1;
            });
        });

        // Trigger iteration
        await page.evaluate(() => {
            chrome.runtime.sendMessage({ type: 'iterate' });
        });

        // Wait for iteration to complete and verify counts
        await page.waitForFunction(() => {
            return window._iterationStartCount === window._iterationEndCount;
        }, { timeout: 10000 });

        const counts = await page.evaluate(() => ({
            starts: window._iterationStartCount,
            ends: window._iterationEndCount
        }));

        expect(counts.starts).toBe(1);
        expect(counts.ends).toBe(1);
    });

    test('should prevent concurrent iterations', async () => {
        const page = helper.page;
        
        // Try to start multiple iterations rapidly
        const results = await page.evaluate(async () => {
            const attempts = [];
            for (let i = 0; i < 3; i++) {
                attempts.push(new Promise(resolve => {
                    chrome.runtime.sendMessage({ type: 'iterate' }, response => {
                        resolve(response);
                    });
                }));
            }
            return Promise.all(attempts);
        });

        // Verify only first iteration was allowed
        const successCount = results.filter(r => r.success).length;
        expect(successCount).toBe(1);
    });
});