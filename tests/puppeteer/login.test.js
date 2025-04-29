const { TestHelper } = require('./helpers');
require('dotenv').config({ path: './tests/.env' });

describe('Login Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
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
