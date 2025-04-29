const { TestHelper } = require('./helpers');

describe('Interfaces SOAP Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should navigate through SOAP interfaces', async () => {
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
                        x: 17.015625,
                        y: 19.515625,
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
                page.locator('::-p-aria(Interface Catalogs)'),
                page.locator('div:nth-of-type(2) > ul:nth-of-type(1) li:nth-of-type(5) > a'),
                page.locator('::-p-xpath(//*[@id=\\"list-display\\"]/div[2]/ul[1]/li/ul/li[5]/a)'),
                page.locator(':scope >>> div:nth-of-type(2) > ul:nth-of-type(1) li:nth-of-type(5) > a')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                    offset: {
                        x: 84.5,
                        y: 5,
                    },
                });
            await Promise.all(promises);
        }

        {
            await puppeteer.Locator.race([
                page.locator('::-p-aria(REST) >>>> ::-p-aria([role=\\"combobox\\"])'),
                page.locator('select'),
                page.locator('::-p-xpath(/html/body/table[1]/tbody/tr/td[2]/form/table[1]/tbody/tr[3]/td[2]/select)'),
                page.locator(':scope >>> select')
            ])
                .setTimeout(timeout)
                .click({
                    offset: {
                        x: 29.5,
                        y: 12,
                    },
                });
        }

        {
            await puppeteer.Locator.race([
                page.locator('::-p-aria(SOAP) >>>> ::-p-aria([role=\\"combobox\\"])'),
                page.locator('select'),
                page.locator('::-p-xpath(/html/body/table[1]/tbody/tr/td[2]/form/table[1]/tbody/tr[3]/td[2]/select)'),
                page.locator(':scope >>> select')
            ])
                .setTimeout(timeout)
                .fill('SOAP');
        }

        {
            const promises = [];
            const startWaitingForEvents = () => {
                promises.push(page.waitForNavigation());
            }
            await puppeteer.Locator.race([
                page.locator('::-p-aria(Search[role=\\"link\\"])'),
                page.locator('#search'),
                page.locator('::-p-xpath(//*[@id=\\"search\\"])'),
                page.locator(':scope >>> #search')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                    offset: {
                        x: 23.5,
                        y: 11,
                    },
                });
            await Promise.all(promises);
        }
    });
});
