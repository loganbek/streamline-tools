const { TestHelper } = require('./helpers');
const path = require('path');
const fs = require('fs').promises;

describe('Configuration Rules Tests', () => {
    let helper;
    let currentTestName = '';

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    beforeEach(async () => {
        // Get current test name for video file naming
        currentTestName = expect.getState().currentTestName.replace(/\s+/g, '_');
        
        // Set up video directory
        const videoDir = path.join(__dirname, 'test-videos');
        await fs.mkdir(videoDir, { recursive: true }).catch(err => {
            if (err.code !== 'EEXIST') console.error("Error creating video directory:", err);
        });
        
        // Start recording this test
        console.log(`Starting recording for test: ${currentTestName}`);
        await helper.startRecording(path.join(videoDir, `${currentTestName}.webm`));
    });

    afterEach(async () => {
        // Stop recording and always save the video
        console.log(`Test "${currentTestName}" finished`);
        await helper.stopRecording(true); // Always save the video
        currentTestName = '';
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