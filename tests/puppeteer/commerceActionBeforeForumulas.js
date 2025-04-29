const { TestHelper } = require('./helpers');

describe('Commerce Action Before Formulas Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should navigate through commerce action before formulas', async () => {
        const page = helper.page;
        const timeout = 5000;
        page.setDefaultTimeout(timeout);

        await page.setViewport({
            width: 782,
            height: 1415
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
                    x: 15.015625,
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
                targetPage.locator('::-p-aria(Process Definition)'),
                targetPage.locator('table div:nth-of-type(1) > ul:nth-of-type(1) li:nth-of-type(1) > a:nth-of-type(1)'),
                targetPage.locator('::-p-xpath(//*[@id=\\"list-display\\"]/div[1]/ul[1]/li/ul/li[1]/a[1])'),
                targetPage.locator(':scope >>> table div:nth-of-type(1) > ul:nth-of-type(1) li:nth-of-type(1) > a:nth-of-type(1)')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 66.0625,
                    y: 8,
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
                targetPage.locator('::-p-aria(List[role=\\"link\\"])'),
                targetPage.locator('#list'),
                targetPage.locator('::-p-xpath(//*[@id=\\"list\\"])'),
                targetPage.locator(':scope >>> #list')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 16.734375,
                    y: 11,
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
                    x: 75.59375,
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
                    x: 4.59375,
                    y: 10,
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
                targetPage.locator('::-p-aria(Add[role=\\"cell\\"]) >>>> ::-p-aria([role=\\"link\\"])'),
                targetPage.locator('tr.bgcolor-list-odd-mouseover > td:nth-of-type(2) > a'),
                targetPage.locator('::-p-xpath(/html/body/table[1]/tbody/tr/td[2]/form/table[2]/tbody/tr[2]/td[2]/a)'),
                targetPage.locator(':scope >>> tr.bgcolor-list-odd-mouseover > td:nth-of-type(2) > a')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 9.734375,
                    y: 7,
                  },
                });
            await Promise.all(promises);
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria( No Advanced Modify - Before Formulas  Define Advanced Modify - Before Formulas Define Function) >>>> ::-p-aria([role=\\"link\\"])'),
                targetPage.locator('#general tr:nth-of-type(21) a'),
                targetPage.locator('::-p-xpath(//*[@id=\\"define_function\\"])'),
                targetPage.locator(':scope >>> #general tr:nth-of-type(21) a')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 63.734375,
                    y: 5.5,
                  },
                });
        }
    });
});
