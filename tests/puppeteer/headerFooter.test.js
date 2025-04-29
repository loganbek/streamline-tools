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

    test('should load header & footer interface', async () => {
        const popup = await helper.verifyPopupPage('popupHeaderFooterHTML.html');
        expect(popup).toBeTruthy();

        // Verify essential UI elements
        const editor = await popup.$('#contentEditor');
        const validateButton = await popup.$('#validateHTML');
        const saveButton = await popup.$('#save');

        expect(editor).toBeTruthy();
        expect(validateButton).toBeTruthy();
        expect(saveButton).toBeTruthy();
    });

    test('should handle content editing', async () => {
        const popup = await helper.verifyPopupPage('popupHeaderFooterHTML.html');

        const htmlContent = '<header>Test Header</header>';
        await helper.testLoad(popup, 'template.html', htmlContent, '#contentEditor');
        
        const editorContent = await helper.page.$eval('#contentEditor', el => el.value);
        expect(editorContent).toBe(htmlContent);
    });

    test('should support CSS inclusion', async () => {
        const popup = await helper.verifyPopupPage('popupHeaderFooterHTML.html');
        const cssValidator = await popup.$('#validateStyles');
        expect(cssValidator).toBeTruthy();

        const contentWithCSS = `
<style>
.header { color: blue; }
</style>
<header class="header">Header content</header>`;

        await helper.testLoad(popup, 'styled.html', contentWithCSS, '#contentEditor');
        expect(await popup.$('style')).toBeTruthy();
    });
});