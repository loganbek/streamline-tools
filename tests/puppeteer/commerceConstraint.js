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
                x: 10.015625,
                y: 10.515625,
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
                x: 59.0625,
                y: 0,
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
                x: 0.734375,
                y: 9,
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
                x: 45.59375,
                y: 5,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Rules) >>>> ::-p-aria([role=\\"combobox\\"])'),
            targetPage.locator('tr.bgcolor-list-odd-mouseover select'),
            targetPage.locator('::-p-xpath(/html/body/table[1]/tbody/tr/td[2]/form/table[2]/tbody/tr[2]/td[4]/select)'),
            targetPage.locator(':scope >>> tr.bgcolor-list-odd-mouseover select')
        ])
            .setTimeout(timeout)
            .fill('/admin/commerce/rules/edit_rule.jsp?document_id=4653823&process_id=4653759');
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
                x: 3.59375,
                y: 13,
              },
            });
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(constrain multiple freight grid selects)'),
            targetPage.locator('#x-auto-10__x-auto-10_x-auto-19'),
            targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-10__x-auto-10_x-auto-19\\"])'),
            targetPage.locator(':scope >>> #x-auto-10__x-auto-10_x-auto-19')
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
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Edit Function)'),
            targetPage.locator('#x-auto-195 button'),
            targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-415\\"]/tbody/tr[2]/td[2]/em/button)'),
            targetPage.locator(':scope >>> #x-auto-195 button'),
            targetPage.locator('::-p-text(Edit Function)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 118,
                y: 10,
              },
            });
    }

    await browser.close();

})().catch(err => {
    console.error(err);
    process.exit(1);
});
