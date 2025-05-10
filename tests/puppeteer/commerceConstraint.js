const { TestHelper } = require('./helpers');

describe('Commerce Constraint Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should navigate to commerce constraint', async () => {
        const page = helper.page;
        const timeout = 5000;
        page.setDefaultTimeout(timeout);

        await page.setViewport({
            width: 782,
            height: 1415
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
                    x: 10.015625,
                    y: 10.515625,
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
                page.locator('::-p-aria(Process Definition)'),
                page.locator('table div:nth-of-type(1) > ul:nth-of-type(1) li:nth-of-type(1) > a:nth-of-type(1)'),
                page.locator('::-p-xpath(//*[@id=\\"list-display\\"]/div[1]/ul[1]/li/ul/li[1]/a[1])'),
                page.locator(':scope >>> table div:nth-of-type(1) > ul:nth-of-type(1) li:nth-of-type(1) > a:nth-of-type(1)')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 59.0625,
                    y: 0,
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
                page.locator('::-p-aria(List[role=\\"link\\"])'),
                page.locator('#list'),
                page.locator('::-p-xpath(//*[@id=\\"list\\"])'),
                page.locator(':scope >>> #list')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 0.734375,
                    y: 9,
                  },
                });
            await Promise.all(promises);
        }
        {
            await puppeteer.Locator.race([
                page.locator('tr.bgcolor-list-odd-mouseover select'),
                page.locator('::-p-xpath(/html/body/table[1]/tbody/tr/td[2]/form/table[2]/tbody/tr[2]/td[4]/select)'),
                page.locator(':scope >>> tr.bgcolor-list-odd-mouseover select')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 45.59375,
                    y: 5,
                  },
                });
        }
        {
            await puppeteer.Locator.race([
                page.locator('::-p-aria(Rules) >>>> ::-p-aria([role=\\"combobox\\"])'),
                page.locator('tr.bgcolor-list-odd-mouseover select'),
                page.locator('::-p-xpath(/html/body/table[1]/tbody/tr/td[2]/form/table[2]/tbody/tr[2]/td[4]/select)'),
                page.locator(':scope >>> tr.bgcolor-list-odd-mouseover select')
            ])
                .setTimeout(timeout)
                .fill('/admin/commerce/rules/edit_rule.jsp?document_id=4653823&process_id=4653759');
        }
        {
            const promises = [];
            const startWaitingForEvents = () => {
                promises.push(page.waitForNavigation());
            }
            await puppeteer.Locator.race([
                page.locator('td.list-options a'),
                page.locator('::-p-xpath(//*[@id=\\"list\\"])'),
                page.locator(':scope >>> td.list-options a')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 3.59375,
                    y: 13,
                  },
                });
            await Promise.all(promises);
        }
        {
            await puppeteer.Locator.race([
                page.locator('::-p-aria(constrain multiple freight grid selects)'),
                page.locator('#x-auto-10__x-auto-10_x-auto-19'),
                page.locator('::-p-xpath(//*[@id=\\"x-auto-10__x-auto-10_x-auto-19\\"])'),
                page.locator(':scope >>> #x-auto-10__x-auto-10_x-auto-19')
            ])
                .setTimeout(timeout)
                .click({
                  count: 2,
                  offset: {
                    x: 110,
                    y: 17,
                  },
                });
        }
        {
            await puppeteer.Locator.race([
                page.locator('::-p-aria(Edit Function)'),
                page.locator('#x-auto-195 button'),
                page.locator('::-p-xpath(//*[@id=\\"x-auto-415\\"]/tbody/tr[2]/td[2]/em/button)'),
                page.locator(':scope >>> #x-auto-195 button'),
                page.locator('::-p-text(Edit Function)')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 118,
                    y: 10,
                  },
                });
        }
    });
});
