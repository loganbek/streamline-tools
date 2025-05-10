const { TestHelper } = require('./helpers');

describe('Return Home Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should return to home page', async () => {
        const page = helper.page;
        const timeout = 5000;
        page.setDefaultTimeout(timeout);

        await page.setViewport({
            width: 1293,
            height: 1431
        });

        await page.goto('https://devmcnichols.bigmachines.com/commerce/display_company_profile.jsp?_bm_trail_refresh_=true');

        const promises = [];
        const startWaitingForEvents = () => {
            promises.push(page.waitForNavigation());
        }
        await puppeteer.Locator.race([
            page.locator('::-p-aria(Home[role=\\"image\\"])'),
            page.locator('#ui-id-2 span.oj-navigationlist-item-icon'),
            page.locator('::-p-xpath(//*[@id=\\"ui-id-2\\"]/a/span[1])'),
            page.locator(':scope >>> #ui-id-2 span.oj-navigationlist-item-icon')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
                offset: {
                    x: 10.015625,
                    y: 9.515625,
                },
            });
        await Promise.all(promises);
    });
});
