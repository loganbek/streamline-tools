const { TestHelper } = require('./helpers');

describe('StyleSheet Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should navigate through stylesheet', async () => {
        const page = helper.page;
        const timeout = 5000;
        page.setDefaultTimeout(timeout);

        await page.setViewport({
            width: 782,
            height: 1415
        });

        await page.goto(`${process.env.BASE_URL}/commerce/display_company_profile.jsp?_bm_trail_refresh_=true`);

        {
            const targetPage = page;
            const promises = [];
            const startWaitingForEvents = () => {
                promises.push(targetPage.waitForNavigation());
            }
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria(Admin[role=\\"image\\"])'),
                targetPage.locator('#ui-id-4 span.oj-navigationlist-item-icon'),
                targetPage.locator('::-p-xpath(//*[@id=\\"ui-id-4\\"]/a/span[1])'),
                targetPage.locator(':scope >>> #ui-id-4 span.oj-navigationlist-item-icon')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 13.015625,
                    y: 8.515625,
                  },
                });
            await Promise.all(promises);
        }
        {
            const targetPage = page;
            const promises = [];
            const startWaitingForEvents = () => {
                promises.push(targetPage.waitForNavigation());
            }
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria(Stylesheet)'),
                targetPage.locator('div:nth-of-type(3) > ul:nth-of-type(2) li:nth-of-type(6) > a'),
                targetPage.locator('::-p-xpath(//*[@id=\\"list-display\\"]/div[3]/ul[2]/li/ul/li[6]/a)'),
                targetPage.locator(':scope >>> div:nth-of-type(3) > ul:nth-of-type(2) li:nth-of-type(6) > a')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 38.5,
                    y: 1,
                  },
                });
            await Promise.all(promises);
        }
    });
});
