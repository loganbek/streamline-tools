const { TestHelper } = require('./helpers');

describe('Header & Footer Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should navigate through header and footer', async () => {
        const page = helper.page;
        const timeout = 5000;
        page.setDefaultTimeout(timeout);

        await page.setViewport({
            width: 1293,
            height: 1431
        });

        await page.goto('https://devmcnichols.bigmachines.com/commerce/display_company_profile.jsp?_bm_trail_refresh_=true');
        
        {
            const promises = [];
            const startWaitingForEvents = () => {
                promises.push(page.waitForNavigation());
            }
            await puppeteer.Locator.race([
                page.locator('::-p-aria(Admin[role=\\"image\\"])'),
                page.locator('#ui-id-4 span.oj-navigationlist-item-icon'),
                page.locator('::-p-xpath(//*[@id=\\"ui-id-4\\"]/a/span[1])'),
                page.locator(':scope >>> #ui-id-4 span.oj-navigationlist-item-icon')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                    offset: {
                        x: 14.015625,
                        y: 14.515625,
                    },
                });
            await Promise.all(promises);
        }

        {
            const promises = [];
            const startWaitingForEvents = () => {
                promises.push(page.waitForNavigation());
            }
            await puppeteer.Locator.race([
                page.locator('::-p-aria(Header & Footer)'),
                page.locator('div:nth-of-type(3) > ul:nth-of-type(2) > li > ul > li:nth-of-type(1) > a'),
                page.locator('::-p-xpath(//*[@id=\\"list-display\\"]/div[3]/ul[2]/li/ul/li[1]/a)'),
                page.locator(':scope >>> div:nth-of-type(3) > ul:nth-of-type(2) > li > ul > li:nth-of-type(1) > a')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                    offset: {
                        x: 69.5,
                        y: 6,
                    },
                });
            await Promise.all(promises);
        }
    });
});
