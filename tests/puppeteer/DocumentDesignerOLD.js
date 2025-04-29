const { TestHelper } = require('./helpers');

describe('Document Designer Legacy Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should navigate through legacy document designer', async () => {
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
                    x: 6.015625,
                    y: 11.515625,
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
                targetPage.locator('::-p-aria(Document Designer)'),
                targetPage.locator('table div:nth-of-type(1) > ul:nth-of-type(1) li:nth-of-type(5) > a'),
                targetPage.locator('::-p-xpath(//*[@id=\\"list-display\\"]/div[1]/ul[1]/li/ul/li[5]/a)'),
                targetPage.locator(':scope >>> table div:nth-of-type(1) > ul:nth-of-type(1) li:nth-of-type(5) > a')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 29.5,
                    y: 3,
                  },
                });
            await Promise.all(promises);
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria(Quote Template \\(Master\\))'),
                targetPage.locator('tr.oj-hover a'),
                targetPage.locator('::-p-xpath(//*[@id=\\"docs-list:-23082017_1\\"]/a)'),
                targetPage.locator(':scope >>> tr.oj-hover a')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 85.90625,
                    y: 2.796875,
                  },
                });
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria( Body - Quote Info Start of continuous block Full View Delete Component)'),
                targetPage.locator('#content li:nth-of-type(3) a'),
                targetPage.locator('::-p-xpath(//*[@id=\\"oj-collapsible-4-header\\"]/a)'),
                targetPage.locator(':scope >>> #content li:nth-of-type(3) a')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 13.65625,
                    y: 17.5,
                  },
                });
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('#oj-collapsible-8-header > div'),
                targetPage.locator('::-p-xpath(//*[@id=\\"oj-collapsible-8-header\\"]/div)'),
                targetPage.locator(':scope >>> #oj-collapsible-8-header > div')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 391.65625,
                    y: 10.015625,
                  },
                });
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria( Body - Line Items Continuous Section Full View Delete Component)'),
                targetPage.locator('#page-content-container > li:nth-of-type(4) a'),
                targetPage.locator('::-p-xpath(//*[@id=\\"oj-collapsible-5-header\\"]/a)'),
                targetPage.locator(':scope >>> #page-content-container > li:nth-of-type(4) a')
            ])
                .setTimeout(timeout)
                .click({
                  button: 'right',
                  offset: {
                    x: 9.65625,
                    y: 12.5625,
                  },
                });
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria( Body - Line Items Continuous Section Full View Delete Component)'),
                targetPage.locator('#page-content-container > li:nth-of-type(4) a'),
                targetPage.locator('::-p-xpath(//*[@id=\\"oj-collapsible-5-header\\"]/a)'),
                targetPage.locator(':scope >>> #page-content-container > li:nth-of-type(4) a')
            ])
                .setTimeout(timeout)
                .click({
                  button: 'right',
                  offset: {
                    x: 3.65625,
                    y: 20.5625,
                  },
                });
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria( Body - Line Items Continuous Section Full View Delete Component)'),
                targetPage.locator('#page-content-container > li:nth-of-type(4) a'),
                targetPage.locator('::-p-xpath(//*[@id=\\"oj-collapsible-5-header\\"]/a)'),
                targetPage.locator(':scope >>> #page-content-container > li:nth-of-type(4) a')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 4.65625,
                    y: 19.5625,
                  },
                });
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('td.cell-1-11 > li:nth-of-type(1) span.modifiers > span'),
                targetPage.locator('::-p-xpath(//*[@id=\\"oj-collapsible-5-content\\"]/li[1]/div/div/table/tbody/tr[2]/td[12]/li[1]/div/span[3]/span)'),
                targetPage.locator(':scope >>> td.cell-1-11 > li:nth-of-type(1) span.modifiers > span')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 8.703125,
                    y: 3.0625,
                  },
                });
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('#modifier-advanced_oj68\\|text > span'),
                targetPage.locator('::-p-xpath(//*[@id=\\"modifier-advanced_oj68|text\\"]/span)'),
                targetPage.locator(':scope >>> #modifier-advanced_oj68\\|text > span')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 24.46875,
                    y: 3.78125,
                  },
                });
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('div.ace_scroller > div'),
                targetPage.locator('::-p-xpath(//*[@id=\\"scriptEditor\\"]/div[2]/div)'),
                targetPage.locator(':scope >>> div.ace_scroller > div')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 492.5,
                    y: 104.09375,
                  },
                });
        }
    });
});
