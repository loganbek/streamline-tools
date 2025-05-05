const { TestHelper } = require('./helpers');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: './tests/.env' });

describe('Login Tests', () => {
    let helper;
    let currentTestName = ''; // Track current test name for video naming

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

    test('should successfully login', async () => {
        const page = helper.page;
        await page.goto(process.env.BASE_URL);
        
        // Verify login form elements
        await page.waitForSelector('#username');
        await page.waitForSelector('#password');
        await page.waitForSelector('input[type="submit"]');

        // Perform login
        await page.type('#username', process.env.CPQ_USERNAME);
        await page.type('#password', process.env.CPQ_PASSWORD);
        await Promise.all([
            page.waitForNavigation(),
            page.click('input[type="submit"]')
        ]);

        // Verify successful login
        const title = await page.title();
        expect(title).toContain('Home');
    });

    test('should handle failed login', async () => {
        const page = helper.page;
        await page.goto(process.env.BASE_URL);

        // Attempt login with invalid credentials
        await page.type('#username', 'invalid_user');
        await page.type('#password', 'invalid_password');
        await Promise.all([
            page.waitForNavigation(),
            page.click('input[type="submit"]')
        ]);

        // Verify error message is present
        const errorElement = await page.$('.error-message');
        expect(errorElement).toBeTruthy();
    });
});
