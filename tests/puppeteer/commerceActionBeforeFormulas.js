const { TestHelper } = require('./helpers');

describe('Commerce Action Before Formula Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should navigate through commerce action before formula', async () => {
        const page = helper.page;
        const timeout = 5000;
        page.setDefaultTimeout(timeout);

        await page.setViewport({
            width: 782,
            height: 1415
        });

        await page.goto(`${process.env.BASE_URL}/commerce/display_company_profile.jsp?_bm_trail_refresh_=true`);

        // Rest of the test implementation...
        // Note: Keep the existing test logic but remove direct browser launch/close
    });
});