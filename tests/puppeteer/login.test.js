const puppeteer = require('puppeteer'); // v23.0.0 or later

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    {
        const targetPage = page;
        await targetPage.setViewport({
            width: 2148,
            height: 1908
        })
    }
    {
        const targetPage = page;
        await targetPage.goto('chrome://new-tab-page/');
    }
    {
        const targetPage = page;
        await targetPage.goto('https://devmcnichols.bigmachines.com/commerce/display_company_profile.jsp');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Username:)'),
            targetPage.locator('#username'),
            targetPage.locator('::-p-xpath(//*[@id=\\"username\\"])'),
            targetPage.locator(':scope >>> #username')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 80,
                y: 13,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Username:)'),
            targetPage.locator('#username'),
            targetPage.locator('::-p-xpath(//*[@id=\\"username\\"])'),
            targetPage.locator(':scope >>> #username')
        ])
            .setTimeout(timeout)
            .fill('cwilliams');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Tab');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.up('Tab');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Password:)'),
            targetPage.locator('#psword'),
            targetPage.locator('::-p-xpath(//*[@id=\\"psword\\"])'),
            targetPage.locator(':scope >>> #psword')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 122,
                y: 4,
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
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Password:)'),
            targetPage.locator('#psword'),
            targetPage.locator('::-p-xpath(//*[@id=\\"psword\\"])'),
            targetPage.locator(':scope >>> #psword')
        ])
            .setTimeout(timeout)
            .fill('SQq7$T^MJf%S$N^&');
    }
    {
        const targetPage = page;
        const promises = [];
        const startWaitingForEvents = () => {
            promises.push(targetPage.waitForNavigation());
        }
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Log in[role=\\"link\\"])'),
            targetPage.locator('#log_in'),
            targetPage.locator('::-p-xpath(//*[@id=\\"log_in\\"])'),
            targetPage.locator(':scope >>> #log_in'),
            targetPage.locator('::-p-text(Log in)')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
              offset: {
                x: 29,
                y: 12,
              },
            });
        await Promise.all(promises);
    }

    await browser.close();

})().catch(err => {
    console.error(err);
    process.exit(1);
});
