const { TestHelper } = require('./helpers');
const login = require('./login');
const path = require('path');

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

    test('should handle XSL document operations', async () => {
        // Navigate to Document Designer page
        await helper.page.goto(`${process.env.BASE_URL}/admin/document/document-designer/edit.jsp`);
        
        // Verify extension is loaded with correct popup
        await helper.verifyExtensionLoaded();
        const popup = await helper.verifyPopupPage('popupDocumentsXSL.html');

        // Test unload functionality for XSL
        const expectedXSL = `
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:template match="/">
        <h2>Test Template</h2>
        <xsl:value-of select="test_value"/>
    </xsl:template>
</xsl:stylesheet>`;
        
        // Set test content
        await helper.page.evaluate((xsl) => {
            document.querySelector('#xsl_content').value = xsl;
        }, expectedXSL);

        // Test unload XSL
        const fileName = await popup.$eval('#xslFileName', el => el.value);
        const xsl = await popup.$eval('#xslCode', el => el.value);
        expect(fileName).toMatch(/\.xsl$/);
        expect(xsl).toBe(expectedXSL);

        // Test load XSL functionality
        const newXSL = `
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:template match="/">
        <h2>Updated Template</h2>
        <xsl:value-of select="updated_value"/>
    </xsl:template>
</xsl:stylesheet>`;
        await helper.testLoad(popup, 'template.xsl', newXSL, '#xsl_content');

        // Verify changes persist
        const updatedXSL = await helper.page.$eval('#xsl_content', el => el.value);
        expect(updatedXSL).toBe(newXSL);
    });

    test('should validate XSL syntax', async () => {
        await helper.page.goto(`${process.env.BASE_URL}/admin/document/document-designer/edit.jsp`);
        const popup = await helper.verifyPopupPage('popupDocumentsXSL.html');

        // Set invalid XSL
        const invalidXSL = `
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:template match="/">
        <h2>Invalid Template
        <xsl:value-of select="test"/>
    <!-- Missing closing tags -->
</xsl:stylesheet>`;
        
        await helper.testLoad(popup, 'invalid.xsl', invalidXSL, '#xsl_content');

        // Click validate
        await popup.click('#validateXSL');
        
        // Wait for validation message
        await helper.page.waitForSelector('.validation-message');
        const validationMessage = await helper.page.$eval('.validation-message', el => el.textContent);
        expect(validationMessage).toContain('error');
    });

    test('should handle document metadata', async () => {
        await helper.page.goto(`${process.env.BASE_URL}/admin/document/document-designer/edit.jsp`);
        const popup = await helper.verifyPopupPage('popupDocumentsXSL.html');

        // Set document properties
        const docProperties = {
            name: 'Test Document',
            type: 'Quote',
            version: '1.0',
            description: 'Test document template'
        };

        await helper.page.evaluate((props) => {
            document.querySelector('#documentName').value = props.name;
            document.querySelector('#documentType').value = props.type;
            document.querySelector('#documentVersion').value = props.version;
            document.querySelector('#documentDescription').value = props.description;
        }, docProperties);

        // Unload and verify metadata is preserved
        await popup.click('#unloadXSL');
        const savedMetadata = await popup.evaluate(() => ({
            name: document.querySelector('#documentName').value,
            type: document.querySelector('#documentType').value,
            version: document.querySelector('#documentVersion').value,
            description: document.querySelector('#documentDescription').value
        }));

        expect(savedMetadata).toEqual(docProperties);
    });

    test('should handle XSL includes', async () => {
        await helper.page.goto(`${process.env.BASE_URL}/admin/document/document-designer/edit.jsp`);
        const popup = await helper.verifyPopupPage('popupDocumentsXSL.html');

        // Test XSL with includes
        const xslWithIncludes = `
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:include href="header.xsl"/>
    <xsl:include href="footer.xsl"/>
    <xsl:template match="/">
        <xsl:call-template name="header"/>
        <h2>Main Content</h2>
        <xsl:call-template name="footer"/>
    </xsl:template>
</xsl:stylesheet>`;

        await helper.testLoad(popup, 'main.xsl', xslWithIncludes, '#xsl_content');

        // Test include file detection
        const includes = await popup.$$eval('.include-file', els => 
            els.map(el => el.textContent)
        );
        expect(includes).toContain('header.xsl');
        expect(includes).toContain('footer.xsl');
    });

    test('should handle preview functionality', async () => {
        await helper.page.goto(`${process.env.BASE_URL}/admin/document/document-designer/edit.jsp`);
        const popup = await helper.verifyPopupPage('popupDocumentsXSL.html');

        // Set preview data
        const testXSL = `
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:template match="/">
        <h1><xsl:value-of select="title"/></h1>
        <p><xsl:value-of select="content"/></p>
    </xsl:template>
</xsl:stylesheet>`;

        const testData = `
<?xml version="1.0" encoding="UTF-8"?>
<root>
    <title>Test Title</title>
    <content>Test Content</content>
</root>`;

        // Load XSL and test data
        await helper.testLoad(popup, 'preview.xsl', testXSL, '#xsl_content');
        await helper.page.evaluate((data) => {
            document.querySelector('#preview_data').value = data;
        }, testData);

        // Click preview
        await popup.click('#preview');
        
        // Verify preview content
        const previewFrame = await helper.page.$('#preview_frame');
        const previewContent = await helper.page.evaluate(frame => 
            frame.contentDocument.body.innerHTML, previewFrame
        );
        
        expect(previewContent).toContain('Test Title');
        expect(previewContent).toContain('Test Content');
    });

    test('should correctly handle header/footer content', async () => {
        const page = helper.page;
        await page.goto(`${process.env.BASE_URL}/admin/document/document-designer/edit.jsp`);
        
        // Test unload
        const expectedCode = '<header>\n    <div class="company-header">Test Content</div>\n</header>';
        await helper.testUnload('document', expectedCode, 'header.html');
        
        // Test load
        const loadCode = '<header>\n    <div class="company-header">Updated Content</div>\n</header>';
        await helper.testLoad('document', loadCode, 'header.html');
        
        // Verify HTML validation
        const isValid = await helper.testValidation(loadCode);
        expect(isValid).toBe(true);
    });

    test('should handle XSL template content', async () => {
        const page = helper.page;
        await page.goto(`${process.env.BASE_URL}/admin/document/document-designer/edit.jsp`);
        
        const xslTemplate = `
            <xsl:template match="/">
                <html>
                    <body>
                        <h1><xsl:value-of select="//company_name"/></h1>
                    </body>
                </html>
            </xsl:template>`;
        
        await helper.testLoad('document', xslTemplate, 'template.xsl');
        
        // Verify XSL validation
        const isValid = await helper.testValidation(xslTemplate);
        expect(isValid).toBe(true);
    });

    test('should handle document CSS content', async () => {
        const page = helper.page;
        await page.goto(`${process.env.BASE_URL}/admin/document/document-designer/edit.jsp`);
        
        const cssContent = `
            .company-header {
                font-family: Arial, sans-serif;
                font-size: 16px;
                color: #333;
            }`;
        
        await helper.testLoad('document', cssContent, 'styles.css');
        
        // Verify CSS validation
        const isValid = await helper.testValidation(cssContent);
        expect(isValid).toBe(true);
    });

    test('should handle document variables', async () => {
        const page = helper.page;
        await page.goto(`${process.env.BASE_URL}/admin/document/document-designer/edit.jsp`);
        
        // Test variable definition
        const variableContent = `
            var documentTitle = "Sales Quote";
            var companyDetails = {
                name: getCompanyName(),
                address: getCompanyAddress()
            };`;
        
        await helper.testLoad('document', variableContent, 'variables.js');
        
        // Verify JavaScript validation
        const isValid = await helper.testValidation(variableContent);
        expect(isValid).toBe(true);
    });

    test('should handle document templates', async () => {
        const page = helper.page;
        await page.goto(`${process.env.BASE_URL}/admin/document/document-designer/edit.jsp`);
        
        // Test template content
        const templateContent = `
            <template id="quote-summary">
                <div class="quote-summary">
                    <h2>{{documentTitle}}</h2>
                    <div class="company-info">
                        <p>{{companyDetails.name}}</p>
                        <p>{{companyDetails.address}}</p>
                    </div>
                </div>
            </template>`;
        
        await helper.testLoad('document', templateContent, 'template.html');
        
        // Verify template validation
        const isValid = await helper.testValidation(templateContent);
        expect(isValid).toBe(true);
    });
});