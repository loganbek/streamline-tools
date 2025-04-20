const puppeteer = require('puppeteer'); // v23.0.0 or later

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    {
        const targetPage = page;
        await targetPage.setViewport({
            width: 1611,
            height: 1431
        })
    }
    {
        const targetPage = page;
        await targetPage.goto('https://devmcnichols.bigmachines.com/commerce/display_company_profile.jsp');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Admin[role=\\"image\\"])'),
            targetPage.locator('#ui-id-4 span.oj-navigationlist-item-icon'),
            targetPage.locator('::-p-xpath(//*[@id=\\"ui-id-4\\"]/a/span[1])'),
            targetPage.locator(':scope >>> #ui-id-4 span.oj-navigationlist-item-icon')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 7.015625,
                y: 23.515625,
              },
            });
    }
    {
        const targetPage = page;
        await targetPage.goto('https://devmcnichols.bigmachines.com/admin/configuration/rules/edit_rule.jsp?rule_id=5268044&rule_type=1&pline_id=-1&segment_id=11&model_id=-1&fromList=true');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#x-auto-14 td:nth-of-type(3) label'),
            targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-54\\"]/label)'),
            targetPage.locator(':scope >>> #x-auto-14 td:nth-of-type(3) label'),
            targetPage.locator('::-p-text(Advanced Condition)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 39.15625,
                y: 5,
              },
            });
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.up('Control');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(View/Edit the BML Function)'),
            targetPage.locator('#x-auto-14 button'),
            targetPage.locator('::-p-xpath(//*[@id=\\"x-auto-142\\"]/tbody/tr[2]/td[2]/em/button)'),
            targetPage.locator(':scope >>> #x-auto-14 button'),
            targetPage.locator('::-p-text(View/Edit the)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 137.5,
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
        await targetPage.keyboard.up('Control');
    }

    await browser.close();

})().catch(err => {
    console.error(err);
    process.exit(1);
});
