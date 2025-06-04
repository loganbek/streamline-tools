const puppeteer = require('puppeteer'); // v23.0.0 or later

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    {
        const targetPage = page;
        await targetPage.setViewport({
            width: 1815,
            height: 1431
        })
    }
    {
        const targetPage = page;
        await targetPage.goto('https://devmcnichols.bigmachines.com/admin/index.jsp?_bm_trail_refresh_=true');
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
                x: 78.5,
                y: 1,
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
                x: 7.4375,
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
                x: 18.40625,
                y: 3,
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
                x: 8.40625,
                y: 4,
              },
            });
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#x-auto-10_x-auto-28 span.x-tree3-node-text'),
            targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-10__x-auto-10_x-auto-28\\"]/span[3])'),
            targetPage.locator(':scope >>> #x-auto-10_x-auto-28 span.x-tree3-node-text'),
            targetPage.locator('::-p-text(Hide HTML Ship)')
        ])
            .setTimeout(timeout)
            .click({
              count: 2,
              offset: {
                x: 53.5,
                y: 10,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('td:nth-of-type(3) label'),
            targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-410\\"]/label)'),
            targetPage.locator(':scope >>> td:nth-of-type(3) label')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 30.234375,
                y: 9,
              },
            });
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Define Function)'),
            targetPage.locator('#x-auto-436 button'),
            targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-437\\"]/tbody/tr[2]/td[2]/em/button)'),
            targetPage.locator(':scope >>> #x-auto-436 button'),
            targetPage.locator('::-p-text(Define Function)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 87.5,
                y: 15,
              },
            });
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }

    await browser.close();

})().catch(err => {
    console.error(err);
    process.exit(1);
});
