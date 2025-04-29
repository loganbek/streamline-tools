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
        
        // Verify essential UI elements
        const editor = await popup.$('#cssEditor');
        const validateButton = await popup.$('#validateCSS');
        const saveButton = await popup.$('#save');

        expect(editor).toBeTruthy();
        expect(validateButton).toBeTruthy();
        expect(saveButton).toBeTruthy();
    });

    test('should handle CSS minification', async () => {
        const popup = await helper.verifyPopupPage('popupStyleSheetsCSS.html');
        
        // Verify minification functionality
        const minifyButton = await popup.$('#minifyCSS');
        expect(minifyButton).toBeTruthy();
    });

    test('should handle CSS variables', async () => {
        const popup = await helper.verifyPopupPage('popupStyleSheetsCSS.html');

        // Verify variables functionality
        const varsPanel = await popup.$('#cssVarsPanel');
        const validateVarsButton = await popup.$('#validateVariables');
        
        expect(varsPanel).toBeTruthy();
        expect(validateVarsButton).toBeTruthy();
    });

    test('should handle browser compatibility checks', async () => {
        const popup = await helper.verifyPopupPage('popupStyleSheetsCSS.html');

        // Verify compatibility functionality
        const compatButton = await popup.$('#checkCompatibility');
        const compatPanel = await popup.$('#compatibilityPanel');
        
        expect(compatButton).toBeTruthy();
        expect(compatPanel).toBeTruthy();
    });
});