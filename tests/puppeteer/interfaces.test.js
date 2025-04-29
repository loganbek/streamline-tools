const { TestHelper } = require('./helpers');
const login = require('./login');

describe('Interfaces Tests', () => {
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
        await helper.verifyExtensionLoaded();
    });

    describe('SOAP Interfaces', () => {
        beforeEach(async () => {
            await helper.page.goto('https://devmcnichols.bigmachines.com/admin/interfaces/list_soap.jsp');
        });

        test('should handle SOAP interface operations', async () => {
            const popup = await helper.verifyPopupPage('popupInterfacesSOAP.html');

            const soapInterface = `<definitions>
    <message name="testMessage">
        <part name="param" type="xsd:string"/>
    </message>
    <portType name="TestPort">
        <operation name="testOp">
            <input message="tns:testMessage"/>
        </operation>
    </portType>
</definitions>`;

            await helper.testLoad(popup, 'test_interface.wsdl', soapInterface, '#wsdlEditor');
            
            const editorContent = await helper.page.$eval('#wsdlEditor', el => el.value);
            expect(editorContent).toBe(soapInterface);

            await popup.click('#validateWSDL');
            const validationMessage = await helper.page.$eval('.validation-result', el => el.textContent);
            expect(validationMessage).toContain('valid');
        });
    });

    describe('REST Interfaces', () => {
        beforeEach(async () => {
            await helper.page.goto('https://devmcnichols.bigmachines.com/admin/interfaces/list_rest.jsp');
        });

        test('should handle REST interface operations', async () => {
            const popup = await helper.verifyPopupPage('popupInterfacesREST.html');

            const restInterface = {
                swagger: '2.0',
                info: {
                    title: 'Test API',
                    version: '1.0.0'
                },
                paths: {
                    '/test': {
                        get: {
                            responses: {
                                '200': {
                                    description: 'Success'
                                }
                            }
                        }
                    }
                }
            };

            await helper.testLoad(popup, 'test_api.json', JSON.stringify(restInterface, null, 2), '#swaggerEditor');
            
            const editorContent = await helper.page.$eval('#swaggerEditor', el => el.value);
            expect(JSON.parse(editorContent)).toEqual(restInterface);

            await popup.click('#validateSwagger');
            const validationMessage = await helper.page.$eval('.validation-result', el => el.textContent);
            expect(validationMessage).toContain('valid');
        });

        test('should handle OpenAPI 3.0 specifications', async () => {
            const popup = await helper.verifyPopupPage('popupInterfacesREST.html');

            const openApiSpec = {
                openapi: '3.0.0',
                info: {
                    title: 'Test API',
                    version: '1.0.0'
                },
                paths: {
                    '/test': {
                        get: {
                            responses: {
                                '200': {
                                    description: 'Success'
                                }
                            }
                        }
                    }
                }
            };

            await helper.testLoad(popup, 'openapi.json', JSON.stringify(openApiSpec, null, 2), '#swaggerEditor');
            
            await popup.click('#validateOpenAPI');
            const validationMessage = await helper.page.$eval('.validation-result', el => el.textContent);
            expect(validationMessage).toContain('valid');
        });
    });
});