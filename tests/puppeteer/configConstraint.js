const { TestHelper } = require('./helpers');

describe('Config Constraint Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should navigate through constraint configuration', async () => {
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
                    x: 6.015625,
                    y: 9.515625,
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
                targetPage.locator('::-p-aria(Catalog Definition)'),
                targetPage.locator('div:nth-of-type(3) > ul:nth-of-type(1) li:nth-of-type(2) > a:nth-of-type(1)'),
                targetPage.locator('::-p-xpath(//*[@id=\\"list-display\\"]/div[3]/ul[1]/li/ul/li[2]/a[1])'),
                targetPage.locator(':scope >>> div:nth-of-type(3) > ul:nth-of-type(1) li:nth-of-type(2) > a:nth-of-type(1)')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 65.0625,
                    y: 5,
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
                    x: 12.1875,
                    y: 21,
                  },
                });
            await Promise.all(promises);
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria(Product Lines) >>>> ::-p-aria([role=\\"combobox\\"])'),
                targetPage.locator('select'),
                targetPage.locator('::-p-xpath(/html/body/table[1]/tbody/tr/td[2]/form/table[1]/tbody/tr[2]/td[4]/select)'),
                targetPage.locator(':scope >>> select'),
                targetPage.locator('::-p-text(2&2)')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 105.8125,
                    y: 17,
                  },
                });
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria(Constraints) >>>> ::-p-aria([role=\\"combobox\\"])'),
                targetPage.locator('select'),
                targetPage.locator('::-p-xpath(/html/body/table[1]/tbody/tr/td[2]/form/table[1]/tbody/tr[2]/td[4]/select)'),
                targetPage.locator(':scope >>> select'),
                targetPage.locator('::-p-text(2&2)')
            ])
                .setTimeout(timeout)
                .fill('10&2');
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
                    x: 7.8125,
                    y: 19,
                  },
                });
            await Promise.all(promises);
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria(Constraint Product Types When Product = Accessories \\(constraintProductTypesWhenProductAccessories\\))'),
                targetPage.locator('tr.bgcolor-list-odd-mouseover > td:nth-of-type(3)'),
                targetPage.locator('::-p-xpath(/html/body/table[1]/tbody/tr/td[2]/form/table[2]/tbody/tr[2]/td[3])'),
                targetPage.locator(':scope >>> tr.bgcolor-list-odd-mouseover > td:nth-of-type(3)')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 209.09375,
                    y: 1,
                  },
                });
        }
        {
            const targetPage = page;
            const promises = [];
            const startWaitingForEvents = () => {
                promises.push(targetPage.waitForNavigation());
            }
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria(Constraint Product Types When Product = Accessories)'),
                targetPage.locator('tr.bgcolor-list-odd-mouseover a'),
                targetPage.locator('::-p-xpath(/html/body/table[1]/tbody/tr/td[2]/form/table[2]/tbody/tr[2]/td[3]/a)'),
                targetPage.locator(':scope >>> tr.bgcolor-list-odd-mouseover a'),
                targetPage.locator('::-p-text(Constraint Product Types When Product = Accessories)')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 195.09375,
                    y: 4,
                  },
                });
            await Promise.all(promises);
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria(Advanced Condition[role=\\"radio\\"])'),
                targetPage.locator('#x-auto-53'),
                targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-53\\"])'),
                targetPage.locator(':scope >>> #x-auto-53')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 10.65625,
                    y: 6,
                  },
                });
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria(View/Edit the BML Function)'),
                targetPage.locator('#x-auto-166 button'),
                targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-167\\"]/tbody/tr[2]/td[2]/em/button)'),
                targetPage.locator(':scope >>> #x-auto-166 button'),
                targetPage.locator('::-p-text(View/Edit the)')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 122,
                    y: 5,
                  },
                });
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('#x-auto-179 div.x-grid3-scroller'),
                targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-193\\"]/div[1]/div[1]/div[2])'),
                targetPage.locator(':scope >>> #x-auto-179 div.x-grid3-scroller'),
                targetPage.locator('::-p-text(Product LineproductNameAdd)')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 275,
                    y: 178,
                  },
                });
        }
    });
});
