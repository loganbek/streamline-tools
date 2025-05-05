const { TestHelper } = require('./helpers');
const login = require('./login');
const path = require('path');
const fs = require('fs').promises;

describe('Interfaces Tests', () => {
    let helper;
    let currentTestName = '';

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
        await login(helper.page);
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    beforeEach(async () => {
        // Get current test name for video file naming
        currentTestName = expect.getState().currentTestName.replace(/\s+/g, '_');
        
        // Set up video directory
        const videoDir = path.join(__dirname, 'test-videos');
        await fs.mkdir(videoDir, { recursive: true }).catch(err => {
            if (err.code !== 'EEXIST') console.error("Error creating video directory:", err);
        });
        
        // Start recording this test
        console.log(`Starting recording for test: ${currentTestName}`);
        await helper.startRecording(path.join(videoDir, `${currentTestName}.webm`));
        
        await helper.verifyExtensionLoaded();
    });

    afterEach(async () => {
        // Stop recording and always save the video
        console.log(`Test "${currentTestName}" finished`);
        await helper.stopRecording(true); // Always save the video
        currentTestName = '';
    });

    describe('SOAP Interfaces', () => {
        beforeEach(async () => {
            await helper.page.goto('https://devmcnichols.bigmachines.com/admin/interfaces/list_soap.jsp');
        });

        test('should handle SOAP interface operations', async () => {
            const popup = await helper.verifyPopupPage('popupInterfacesSOAP.html');
            expect(popup).toBeTruthy();

            // Verify essential UI elements
            const editor = await popup.$('#wsdlEditor');
            const validateButton = await popup.$('#validateWSDL');
            const saveButton = await popup.$('#save');

            expect(editor).toBeTruthy();
            expect(validateButton).toBeTruthy();
            expect(saveButton).toBeTruthy();
        });
    });

    describe('REST Interfaces', () => {
        beforeEach(async () => {
            await helper.page.goto('https://devmcnichols.bigmachines.com/admin/interfaces/list_rest.jsp');
        });

        test('should handle REST interface operations', async () => {
            const popup = await helper.verifyPopupPage('popupInterfacesREST.html');
            expect(popup).toBeTruthy();

            // Verify essential UI elements
            const editor = await popup.$('#swaggerEditor');
            const validateButton = await popup.$('#validateSwagger');
            const saveButton = await popup.$('#save');

            expect(editor).toBeTruthy();
            expect(validateButton).toBeTruthy();
            expect(saveButton).toBeTruthy();
        });

        test('should handle OpenAPI specifications', async () => {
            const popup = await helper.verifyPopupPage('popupInterfacesREST.html');

            // Verify OpenAPI-specific elements
            const formatButton = await popup.$('#formatOpenAPI');
            const validateButton = await popup.$('#validateOpenAPI');
            
            expect(formatButton).toBeTruthy();
            expect(validateButton).toBeTruthy();
        });
    });
});