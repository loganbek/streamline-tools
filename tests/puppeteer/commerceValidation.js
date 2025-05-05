const puppeteer = require('puppeteer'); // v23.0.0 or later

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    {
        const targetPage = page;
        await targetPage.setViewport({
            width: 347,
            height: 1408
        })
    }
    {
        const targetPage = page;
        await targetPage.goto('https://devmcnichols.bigmachines.com/commerce/display_company_profile.jsp');
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
                x: 19,
                y: 7.734375,
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
                y: 5.125,
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
                x: 7.84375,
                y: 15.125,
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
                x: 84.34375,
                y: 8.125,
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
                x: 9.34375,
                y: 5.125,
              },
            });
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#x-auto-10_x-auto-93 span.x-tree3-node-text'),
            targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-10__x-auto-10_x-auto-93\\"]/span[3])'),
            targetPage.locator(':scope >>> #x-auto-10_x-auto-93 span.x-tree3-node-text'),
            targetPage.locator('::-p-text(Required Fields for Order)')
        ])
            .setTimeout(timeout)
            .click({
              count: 2,
              offset: {
                x: 66,
                y: 0.125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('td:nth-of-type(3) label'),
            targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-412\\"]/label)'),
            targetPage.locator(':scope >>> td:nth-of-type(3) label')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 27.734375,
                y: 10,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Define Function)'),
            targetPage.locator('#x-auto-438 button'),
            targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-439\\"]/tbody/tr[2]/td[2]/em/button)'),
            targetPage.locator(':scope >>> #x-auto-438 button'),
            targetPage.locator('::-p-text(Define Function)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 105,
                y: 3,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#x-auto-438 td.x-btn-tc'),
            targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-439\\"]/tbody/tr[1]/td[2])'),
            targetPage.locator(':scope >>> #x-auto-438 td.x-btn-tc')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 118,
                y: 2,
              },
            });
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.down('Control');
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.down('Control');
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.up('Control');
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Define Function)'),
            targetPage.locator('#x-auto-438 button'),
            targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-439\\"]/tbody/tr[2]/td[2]/em/button)'),
            targetPage.locator(':scope >>> #x-auto-438 button'),
            targetPage.locator('::-p-text(Define Function)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 105,
                y: 6,
              },
            });
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.down('Control');
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.down('Control');
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        const promises = [];
        const startWaitingForEvents = () => {
            promises.push(targetPage.waitForNavigation());
        }
        await targetPage.keyboard.down('Control');
        await Promise.all(promises);
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.down('Control');
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.down('Control');
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.down('Control');
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.down('Control');
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.down('Control');
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.down('Control');
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.down('Control');
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.down('Control');
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.down('Control');
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.down('Control');
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.down('Control');
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.down('Control');
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await targetPage.keyboard.up('Control');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Define Function)'),
            targetPage.locator('#x-auto-438 button'),
            targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-439\\"]/tbody/tr[2]/td[2]/em/button)'),
            targetPage.locator(':scope >>> #x-auto-438 button'),
            targetPage.locator('::-p-text(Define Function)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 105,
                y: 6,
              },
            });
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Next[role=\\"link\\"])'),
            targetPage.locator('#next'),
            targetPage.locator('::-p-xpath(//*[@id=\\"next\\"])'),
            targetPage.locator(':scope >>> #next'),
            targetPage.locator('::-p-text(Next)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 17.703125,
                y: 15,
              },
            });
    }
    {
        const target = await browser.waitForTarget(t => t.url() === 'https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp', { timeout });
        const targetPage = await target.page();
        targetPage.setDefaultTimeout(timeout);
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Next[role=\\"link\\"])'),
            targetPage.locator('#next'),
            targetPage.locator('::-p-xpath(//*[@id=\\"next\\"])'),
            targetPage.locator(':scope >>> #next'),
            targetPage.locator('::-p-text(Next)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 17.703125,
                y: 15,
              },
            });
    }

    await browser.close();

})().catch(err => {
    console.error(err);
    process.exit(1);
});
