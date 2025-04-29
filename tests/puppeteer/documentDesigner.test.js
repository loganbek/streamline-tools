const { TestHelper } = require('./helpers');
const login = require('./login');

describe('Document Designer Tests', () => {
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
        await helper.page.goto(`${process.env.BASE_URL}/admin/document/document-designer/edit.jsp`);
        await helper.verifyExtensionLoaded();
    });

    test('should handle XSL document operations', async () => {
        const popup = await helper.verifyPopupPage('popupDocumentsXSL.html');
        expect(popup).toBeTruthy();

        // Verify essential UI elements
        const editor = await popup.$('#xsl_content');
        const validateButton = await popup.$('#validateXSL');
        const saveButton = await popup.$('#save');

        expect(editor).toBeTruthy();
        expect(validateButton).toBeTruthy();
        expect(saveButton).toBeTruthy();
    });

    test('should handle document variables', async () => {
        const popup = await helper.verifyPopupPage('popupDocumentsXSL.html');
        
        const variableContent = `
            var documentTitle = "Sales Quote";
            var companyDetails = {
                name: getCompanyName(),
                address: getCompanyAddress()
            };`;
        
        await helper.testLoad(popup, 'variables.js', variableContent, '#variables');
        
        // Verify variables panel exists
        const varsPanel = await popup.$('#variablesPanel');
        expect(varsPanel).toBeTruthy();
    });

    test('should handle document templates', async () => {
        const popup = await helper.verifyPopupPage('popupDocumentsXSL.html');

        const templateContent = '<template id="quote-summary"><div>{{title}}</div></template>';
        await helper.testLoad(popup, 'template.html', templateContent, '#xsl_content');
        
        // Verify template functionality
        const templateSelector = await popup.$('#templateSelector');
        expect(templateSelector).toBeTruthy();
    });

    test('should handle XSL includes', async () => {
        const popup = await helper.verifyPopupPage('popupDocumentsXSL.html');
        
        // Verify includes management UI
        const includesPanel = await popup.$('#includesPanel');
        const addIncludeButton = await popup.$('#addInclude');
        
        expect(includesPanel).toBeTruthy();
        expect(addIncludeButton).toBeTruthy();
    });
});