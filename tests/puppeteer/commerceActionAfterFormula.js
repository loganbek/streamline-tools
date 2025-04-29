const { TestHelper } = require('./helpers');

describe('Commerce Action After Formula Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should navigate through commerce action after formula', async () => {
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
                    x: 23.015625,
                    y: 13.515625,
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
                targetPage.locator('::-p-aria(Process Definition)'),
                targetPage.locator('table div:nth-of-type(1) > ul:nth-of-type(1) li:nth-of-type(1) > a:nth-of-type(1)'),
                targetPage.locator('::-p-xpath(//*[@id=\\"list-display\\"]/div[1]/ul[1]/li/ul/li[1]/a[1])'),
                targetPage.locator(':scope >>> table div:nth-of-type(1) > ul:nth-of-type(1) li:nth-of-type(1) > a:nth-of-type(1)')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 67.0625,
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
                targetPage.locator('table:nth-of-type(1) table:nth-of-type(2) div'),
                targetPage.locator('::-p-xpath(/html/body/table[1]/tbody/tr/td[2]/form/table[2]/tbody/tr[2]/td[4]/table/tbody/tr/td[2]/div)'),
                targetPage.locator(':scope >>> table:nth-of-type(1) table:nth-of-type(2) div')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 6.734375,
                    y: 12,
                  },
                });
            await Promise.all(promises);
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('tr.bgcolor-list-odd-mouseover select'),
                targetPage.locator('::-p-xpath(/html/body/table[1]/tbody/tr/td[2]/form/table[2]/tbody/tr[2]/td[4]/select)'),
                targetPage.locator(':scope >>> tr.bgcolor-list-odd-mouseover select')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 64.59375,
                    y: 8,
                  },
                });
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria(Actions) >>>> ::-p-aria([role=\\"combobox\\"])'),
                targetPage.locator('tr.bgcolor-list-odd-mouseover select'),
                targetPage.locator('::-p-xpath(/html/body/table[1]/tbody/tr/td[2]/form/table[2]/tbody/tr[2]/td[4]/select)'),
                targetPage.locator(':scope >>> tr.bgcolor-list-odd-mouseover select')
            ])
                .setTimeout(timeout)
                .fill('/admin/commerce/actions/list_actions.jsp?doc_id=4653823');
        }
        {
            const targetPage = page;
            const promises = [];
            const startWaitingForEvents = () => {
                promises.push(targetPage.waitForNavigation());
            }
            await puppeteer.Locator.race([
                targetPage.locator('td.list-options a'),
                targetPage.locator('::-p-xpath(//*[@id=\\"list\\"])'),
                targetPage.locator(':scope >>> td.list-options a')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 9.59375,
                    y: 12,
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
                targetPage.locator('::-p-aria(Add Freight[role=\\"link\\"])'),
                targetPage.locator('tr.bgcolor-list-even-mouseover > td:nth-of-type(2) > a'),
                targetPage.locator('::-p-xpath(/html/body/table[1]/tbody/tr/td[2]/form/table[2]/tbody/tr[3]/td[2]/a)'),
                targetPage.locator(':scope >>> tr.bgcolor-list-even-mouseover > td:nth-of-type(2) > a'),
                targetPage.locator('::-p-text(Add Freight)')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 34.734375,
                    y: 10,
                  },
                });
            await Promise.all(promises);
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria( No Advanced Modify - After Formulas  Define Advanced Modify - After Formulas Define Function) >>>> ::-p-aria([role=\\"link\\"])'),
                targetPage.locator('tr:nth-of-type(23) a'),
                targetPage.locator('::-p-xpath(//*[@id=\\"define_function\\"])'),
                targetPage.locator(':scope >>> tr:nth-of-type(23) a')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 58.40625,
                    y: 11.5,
                  },
                });
        }
    });
});
