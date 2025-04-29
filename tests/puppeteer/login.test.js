const { TestHelper } = require('./helpers');
const login = require('./login');
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
        await login(helper.page);
        
        const title = await helper.page.title();
        expect(title).toContain('Home');
    });

    test('should handle failed login', async () => {
        const page = helper.page;
        await page.goto(process.env.BASE_URL);

        await page.type('#username', 'invalid_user');
        await page.type('#password', 'invalid_password');

        await Promise.all([
            page.waitForNavigation(),
            page.click('input[type="submit"]')
        ]);

        const errorMessage = await page.$eval('.error-message', el => el.textContent);
        expect(errorMessage).toContain('Invalid credentials');
    });

    test('should redirect to login page when session expires', async () => {
        await login(helper.page);
        
        // Wait for session timeout (mock it for test)
        await helper.page.evaluate(() => {
            localStorage.removeItem('session_token');
        });

        // Try to access protected page
        await helper.page.goto(`${process.env.BASE_URL}/admin`);
        
        const currentUrl = helper.page.url();
        expect(currentUrl).toContain('login');
    });
});
