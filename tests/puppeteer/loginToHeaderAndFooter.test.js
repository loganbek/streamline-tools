const puppeteer = require('puppeteer'); // v23.0.0 or later
require('dotenv').config(); // Add this to load environment variables

(async () => {
    // Check if password environment variable exists
    if (!process.env.CPQ_PASSWORD) {
        console.error('Error: CPQ_PASSWORD environment variable is not set');
        process.exit(1);
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    {
        const targetPage = page;
        await targetPage.setViewport({
            width: 759,
            height: 882
        })
    }
    {
        const targetPage = page;
        await targetPage.goto('https://devmcnichols.bigmachines.com/commerce/display_company_profile.jsp?redirectUrl=%2Flogout.jsp%3F_bm_trail_refresh_%3Dtrue&hash_param=');
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
                x: 73.33333206176758,
                y: 3.666656494140625,
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
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Password:)'),
            targetPage.locator('#psword'),
            targetPage.locator('::-p-xpath(//*[@id=\\"psword\\"])'),
            targetPage.locator(':scope >>> #psword')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 85.33333206176758,
                y: 9,
              },
            });
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
            .fill(process.env.CPQ_PASSWORD); // Use environment variable here
    }
    {
        const targetPage = page;
        const promises = [];
        const startWaitingForEvents = () => {
            promises.push(targetPage.waitForNavigation());
        }
        await puppeteer.Locator.race([
            targetPage.locator('div.login-button div'),
            targetPage.locator('::-p-xpath(//*[@id=\\"login-form\\"]/div[3]/table/tbody/tr/td[2]/div)'),
            targetPage.locator(':scope >>> div.login-button div')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
              offset: {
                x: 49.33333206176758,
                y: 13.33331298828125,
              },
            });
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#ui-id-1'),
            targetPage.locator('::-p-xpath(//*[@id=\\"ui-id-1\\"])'),
            targetPage.locator(':scope >>> #ui-id-1')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 98.67706298828125,
                y: 1.625,
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
            targetPage.locator('::-p-aria(Admin[role=\\"image\\"])'),
            targetPage.locator('#ui-id-4 span.oj-navigationlist-item-icon'),
            targetPage.locator('::-p-xpath(//*[@id=\\"ui-id-4\\"]/a/span[1])'),
            targetPage.locator(':scope >>> #ui-id-4 span.oj-navigationlist-item-icon')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
              offset: {
                x: 11.67706298828125,
                y: 11.197916030883789,
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
            targetPage.locator('::-p-aria(Header & Footer)'),
            targetPage.locator('div:nth-of-type(3) > ul:nth-of-type(2) > li > ul > li:nth-of-type(1) > a'),
            targetPage.locator('::-p-xpath(//*[@id=\\"list-display\\"]/div[3]/ul[2]/li/ul/li[1]/a)'),
            targetPage.locator(':scope >>> div:nth-of-type(3) > ul:nth-of-type(2) > li > ul > li:nth-of-type(1) > a')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
              offset: {
                x: 59.40625,
                y: 6.33331298828125,
              },
            });
        await Promise.all(promises);
    }

    await browser.close();

})().catch(err => {
    console.error(err);
    process.exit(1);
});
