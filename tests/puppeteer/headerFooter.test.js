const { TestHelper } = require('./helpers');
const login = require('./login');

describe('Header & Footer Tests', () => {
    let helper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
        await login(helper.page);
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    beforeEach(async () => {
        await helper.page.goto('https://devmcnichols.bigmachines.com/admin/header_footer/edit.jsp');
        await helper.verifyExtensionLoaded();
    });

    test('should handle HTML content operations', async () => {
        const popup = await helper.verifyPopupPage('popupHeaderFooterHTML.html');

        // Test content unload
        const htmlContent = `
<header class="main-header">
    <div class="logo">{{company_logo}}</div>
    <nav>{{main_nav}}</nav>
</header>
<footer>
    <div class="copyright">&copy; {{current_year}}</div>
</footer>`;

        await helper.testLoad(popup, 'template.html', htmlContent, '#contentEditor');
        
        const editorContent = await helper.page.$eval('#contentEditor', el => el.value);
        expect(editorContent).toBe(htmlContent);
    });

    test('should validate HTML structure', async () => {
        const popup = await helper.verifyPopupPage('popupHeaderFooterHTML.html');

        const invalidHTML = `
<header>
    <div>Unclosed div
    <span>Invalid nesting</div></span>
</header>`;

        await helper.testLoad(popup, 'invalid.html', invalidHTML, '#contentEditor');
        
        await popup.click('#validateHTML');
        const validationMessage = await helper.page.$eval('.validation-result', el => el.textContent);
        expect(validationMessage).toContain('error');
    });

    test('should handle template variables', async () => {
        const popup = await helper.verifyPopupPage('popupHeaderFooterHTML.html');

        const templateContent = `
<header>
    <div>Welcome {{user_name}}</div>
    <div>Date: {{current_date}}</div>
</header>`;

        await helper.testLoad(popup, 'template_vars.html', templateContent, '#contentEditor');
        
        await popup.click('#validateTemplateVars');
        
        const variables = await popup.$$eval('.template-var', vars => vars.map(v => v.textContent));
        expect(variables).toContain('user_name');
        expect(variables).toContain('current_date');
    });

    test('should support CSS inclusion', async () => {
        const popup = await helper.verifyPopupPage('popupHeaderFooterHTML.html');

        const contentWithCSS = `
<style>
.header { color: blue; }
.footer { color: gray; }
</style>
<header class="header">Header content</header>
<footer class="footer">Footer content</footer>`;

        await helper.testLoad(popup, 'styled.html', contentWithCSS, '#contentEditor');
        
        await popup.click('#validateStyles');
        const cssValidation = await helper.page.$eval('.css-validation', el => el.textContent);
        expect(cssValidation).toContain('valid');
    });
});