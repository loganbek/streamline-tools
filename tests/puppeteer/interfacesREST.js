const puppeteer = require('puppeteer'); // v23.0.0 or later
const { TestHelper } = require('./helpers');

describe('Interfaces REST Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should navigate through REST interfaces', async () => {
        const page = helper.page;
        const timeout = 5000;
        page.setDefaultTimeout(timeout);

        await page.setViewport({
            width: 1293,
            height: 1431
        });

        await page.goto('https://devmcnichols.bigmachines.com/commerce/display_company_profile.jsp?_bm_trail_refresh_=true');

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
                    x: 1.015625,
                    y: 12.515625,
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
                targetPage.locator('::-p-aria(Interface Catalogs)'),
                targetPage.locator('div:nth-of-type(2) > ul:nth-of-type(1) li:nth-of-type(5) > a'),
                targetPage.locator('::-p-xpath(//*[@id=\\"list-display\\"]/div[2]/ul[1]/li/ul/li[5]/a)'),
                targetPage.locator(':scope >>> div:nth-of-type(2) > ul:nth-of-type(1) li:nth-of-type(5) > a')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 42.5,
                    y: 2,
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
                targetPage.locator('::-p-aria(Search[role=\\"link\\"])'),
                targetPage.locator('#search'),
                targetPage.locator('::-p-xpath(//*[@id=\\"search\\"])'),
                targetPage.locator(':scope >>> #search')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 19.5,
                    y: 10,
                  },
                });
            await Promise.all(promises);
        }
    });
});
