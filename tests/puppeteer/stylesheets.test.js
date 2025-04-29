const { TestHelper } = require('./helpers');
const login = require('./login');

describe('Stylesheets Tests', () => {
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
        await helper.page.goto('https://devmcnichols.bigmachines.com/admin/ui/branding/edit_stylesheets.jsp');
        await helper.verifyExtensionLoaded();
    });

    test('should handle CSS operations', async () => {
        const popup = await helper.verifyPopupPage('popupStyleSheetsCSS.html');

        const cssContent = `
.header {
    background: #f0f0f0;
    padding: 20px;
}
.footer {
    margin-top: 2em;
    border-top: 1px solid #ccc;
}`;

        await helper.testLoad(popup, 'styles.css', cssContent, '#cssEditor');
        
        const editorContent = await helper.page.$eval('#cssEditor', el => el.value);
        expect(editorContent).toBe(cssContent);

        // Test CSS validation
        await popup.click('#validateCSS');
        const validationResult = await helper.page.$eval('.validation-result', el => el.textContent);
        expect(validationResult).toContain('valid');
    });

    test('should handle CSS minification', async () => {
        const popup = await helper.verifyPopupPage('popupStyleSheetsCSS.html');

        const unminifiedCSS = `
.button {
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
}

.button:hover {
    background-color: #0056b3;
}`;

        await helper.testLoad(popup, 'unminified.css', unminifiedCSS, '#cssEditor');
        
        await popup.click('#minifyCSS');
        
        const minifiedContent = await helper.page.$eval('#cssEditor', el => el.value);
        expect(minifiedContent).not.toContain('\n');
        expect(minifiedContent).toContain('.button{background-color:#007bff');
    });

    test('should handle CSS variables', async () => {
        const popup = await helper.verifyPopupPage('popupStyleSheetsCSS.html');

        const cssWithVars = `
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
}
.button {
    background-color: var(--primary-color);
}
.text {
    color: var(--secondary-color);
}`;

        await helper.testLoad(popup, 'variables.css', cssWithVars, '#cssEditor');
        
        await popup.click('#validateVariables');
        
        const variables = await popup.$$eval('.css-var', vars => vars.map(v => v.textContent));
        expect(variables).toContain('--primary-color');
        expect(variables).toContain('--secondary-color');
    });

    test('should validate browser compatibility', async () => {
        const popup = await helper.verifyPopupPage('popupStyleSheetsCSS.html');

        const modernCSS = `
.container {
    display: grid;
    gap: 1rem;
    backdrop-filter: blur(10px);
}`;

        await helper.testLoad(popup, 'modern.css', modernCSS, '#cssEditor');
        
        await popup.click('#checkCompatibility');
        
        const compatWarnings = await popup.$$eval('.compat-warning', 
            warnings => warnings.map(w => w.textContent)
        );
        expect(compatWarnings.some(w => w.includes('backdrop-filter'))).toBe(true);
    });
});