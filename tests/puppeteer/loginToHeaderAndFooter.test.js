const puppeteer = require('puppeteer'); // v23.0.0 or later
require('dotenv').config(); // Add this to load environment variables
const { TestHelper } = require('./helpers');
const login = require('./login');

describe('Login to Header & Footer Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should login and navigate to header & footer', async () => {
        const page = helper.page;
        await login(page);

        await page.setViewport({
            width: 759,
            height: 882
        });

        // Navigate to Header & Footer
        const promises = [];
        const startWaitingForEvents = () => {
            promises.push(page.waitForNavigation());
        };

        await puppeteer.Locator.race([
            page.locator('::-p-aria(Admin[role=\\"image\\"])'),
            page.locator('#ui-id-4 span.oj-navigationlist-item-icon'),
            page.locator('::-p-xpath(//*[@id=\\"ui-id-4\\"]/a/span[1])'),
            page.locator(':scope >>> #ui-id-4 span.oj-navigationlist-item-icon')
        ])
            .setTimeout(5000)
            .on('action', () => startWaitingForEvents())
            .click({
                offset: {
                    x: 11.67706298828125,
                    y: 11.197916030883789,
                },
            });
        await Promise.all(promises);

        // Click Header & Footer link
        const headerFooterPromises = [];
        const waitForHeaderFooter = () => {
            headerFooterPromises.push(page.waitForNavigation());
        };

        await puppeteer.Locator.race([
            page.locator('::-p-aria(Header & Footer)'),
            page.locator('div:nth-of-type(3) > ul:nth-of-type(2) > li > ul > li:nth-of-type(1) > a')
        ])
            .setTimeout(5000)
            .on('action', () => waitForHeaderFooter())
            .click({
                offset: {
                    x: 59.40625,
                    y: 6.33331298828125,
                },
            });
        await Promise.all(headerFooterPromises);

        // Verify we're on the Header & Footer page
        const pageTitle = await page.title();
        expect(pageTitle).toContain('Header & Footer');
    });

    test('should handle header & footer content editing', async () => {
        const popup = await helper.verifyPopupPage('popupHeaderFooterHTML.html');

        const testContent = `
<header>
    <div class="custom-header">Test Header</div>
</header>
<footer>
    <div class="custom-footer">Test Footer</div>
</footer>`;

        await helper.testLoad(popup, 'header_footer.html', testContent, '#contentEditor');
        
        // Verify content loaded correctly
        const editorContent = await helper.page.$eval('#contentEditor', el => el.value);
        expect(editorContent).toBe(testContent);

        // Test HTML validation
        await popup.click('#validateHTML');
        const validationResult = await helper.page.$eval('.validation-result', el => el.textContent);
        expect(validationResult).toContain('valid');
    });
});
