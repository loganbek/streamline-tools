const { TestHelper } = require('./helpers');

describe('Document Designer Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should navigate through document designer', async () => {
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
                    x: 12.015625,
                    y: 16.515625,
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
                    x: 25.5,
                    y: 4,
                  },
                });
            await Promise.all(promises);
        }
        {
            const timeout = 5000;
            const targetPage = page;
            await waitForElement({
                type: 'waitForElement',
                timeout: 5000,
                selectors: [
                    'aria/Quote Template (Master)'
                ]
            }, targetPage, timeout);
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
                  delay: 50,
                  offset: {
                    x: 70.90625,
                    y: 4.796875,
                  },
                });
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria( Body - Line Items Continuous Section Full View Delete Component)'),
                targetPage.locator('#content li:nth-of-type(4) a'),
                targetPage.locator('::-p-xpath(//*[@id=\\"oj-collapsible-5-header\\"]/a)'),
                targetPage.locator(':scope >>> #content li:nth-of-type(4) a')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 6.65625,
                    y: 14.5,
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
                    x: 7.703125,
                    y: 7,
                  },
                });
        }
        {
            const targetPage = page;
            await puppeteer.Locator.race([
                targetPage.locator('#modifier-advanced_oj67\\|text > span'),
                targetPage.locator('::-p-xpath(//*[@id=\\"modifier-advanced_oj67|text\\"]/span)'),
                targetPage.locator(':scope >>> #modifier-advanced_oj67\\|text > span')
            ])
                .setTimeout(timeout)
                .click({
                  offset: {
                    x: 16.46875,
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
                    x: 531.5,
                    y: 199.09375,
                  },
                });
        }

        async function waitForElement(step, frame, timeout) {
            const { selectors } = step;
            const elements = await querySelectorsAll(selectors, frame);
            if (elements.length > 0) {
                return elements[0];
            }
            throw new Error('Element not found');
        }

        async function querySelectorsAll(selectors, frame) {
            for (const selector of selectors) {
                const result = await querySelectorAll(selector, frame);
                if (result.length) {
                    return result;
                }
            }
            return [];
        }

        async function querySelectorAll(selector, frame) {
            if (!Array.isArray(selector)) {
                selector = [selector];
            }
            if (!selector.length) {
                throw new Error('Empty selector provided to querySelectorAll');
            }
            let elements = [];
            for (let i = 0; i < selector.length; i++) {
                const part = selector[i];
                if (i === 0) {
                    elements = await frame.$$(part);
                } else {
                    const tmpElements = elements;
                    elements = [];
                    for (const el of tmpElements) {
                        elements.push(...(await el.$$(part)));
                    }
                }
                if (elements.length === 0) {
                    return [];
                }
                if (i < selector.length - 1) {
                    const tmpElements = [];
                    for (const el of elements) {
                        const newEl = (await el.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
                        if (newEl) {
                            tmpElements.push(newEl);
                        }
                    }
                    elements = tmpElements;
                }
            }
            return elements;
        }
    });
});
