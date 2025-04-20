const puppeteer = require('puppeteer'); // v23.0.0 or later

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    {
        const targetPage = page;
        await targetPage.setViewport({
            width: 782,
            height: 1415
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
                x: 6.015625,
                y: 14.515625,
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
                x: 69.0625,
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
            targetPage.locator('::-p-aria(List[role=\\"link\\"])'),
            targetPage.locator('#list'),
            targetPage.locator('::-p-xpath(//*[@id=\\"list\\"])'),
            targetPage.locator(':scope >>> #list')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
              offset: {
                x: 9.1875,
                y: 13,
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
                x: 102.8125,
                y: 9,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Hiding Attributes) >>>> ::-p-aria([role=\\"combobox\\"])'),
            targetPage.locator('select'),
            targetPage.locator('::-p-xpath(/html/body/table[1]/tbody/tr/td[2]/form/table[1]/tbody/tr[2]/td[4]/select)'),
            targetPage.locator(':scope >>> select'),
            targetPage.locator('::-p-text(2&2)')
        ])
            .setTimeout(timeout)
            .fill('11&2');
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
                x: 13.8125,
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
            targetPage.locator('::-p-aria(Hiding Advanced Options)'),
            targetPage.locator('tr.bgcolor-list-odd-mouseover a'),
            targetPage.locator('::-p-xpath(/html/body/table[1]/tbody/tr/td[2]/form/table[2]/tbody/tr[2]/td[3]/a)'),
            targetPage.locator(':scope >>> tr.bgcolor-list-odd-mouseover a'),
            targetPage.locator('::-p-text(Hiding Advanced)')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
              offset: {
                x: 96.640625,
                y: 3,
              },
            });
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Advanced Condition[role=\\"cell\\"]) >>>> ::-p-aria([role=\\"generic\\"])'),
            targetPage.locator('#x-auto-54'),
            targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-54\\"])'),
            targetPage.locator(':scope >>> #x-auto-54')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 16.65625,
                y: 17,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(View/Edit the BML Function)'),
            targetPage.locator('#x-auto-14 button'),
            targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-78\\"]/tbody/tr[2]/td[2]/em/button)'),
            targetPage.locator(':scope >>> #x-auto-14 button'),
            targetPage.locator('::-p-text(View/Edit the)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 123,
                y: 0,
              },
            });
    }

    await browser.close();

})().catch(err => {
    console.error(err);
    process.exit(1);
});
