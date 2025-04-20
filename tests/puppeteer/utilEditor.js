const puppeteer = require('puppeteer'); // v23.0.0 or later

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    {
        const targetPage = page;
        await targetPage.setViewport({
            width: 1293,
            height: 1431
        })
    }
    {
        const targetPage = page;
        await targetPage.goto('https://devmcnichols.bigmachines.com/commerce/display_company_profile.jsp?_bm_trail_refresh_=true');
    }
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
                x: 3.015625,
                y: 23.515625,
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
            targetPage.locator('::-p-aria(BML Library)'),
            targetPage.locator('div:nth-of-type(1) > ul:nth-of-type(2) li:nth-of-type(2) > a'),
            targetPage.locator('::-p-xpath(//*[@id=\\"list-display\\"]/div[1]/ul[2]/li/ul/li[2]/a)'),
            targetPage.locator(':scope >>> div:nth-of-type(1) > ul:nth-of-type(2) li:nth-of-type(2) > a')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
              offset: {
                x: 33.5,
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
            targetPage.locator('::-p-aria(getVolumePricing[role=\\"link\\"])'),
            targetPage.locator('tr.bgcolor-list-odd-mouseover > td:nth-of-type(2) > a'),
            targetPage.locator('::-p-xpath(/html/body/table[1]/tbody/tr[2]/td/table/tbody/tr/td[3]/form/table[2]/tbody/tr[2]/td[2]/a)'),
            targetPage.locator(':scope >>> tr.bgcolor-list-odd-mouseover > td:nth-of-type(2) > a')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
              offset: {
                x: 57.3125,
                y: 6.5,
              },
            });
        await Promise.all(promises);
    }

    await browser.close();

})().catch(err => {
    console.error(err);
    process.exit(1);
});
