const { TestHelper } = require('./helpers');
const login = require('./login');
const { setupVideoRecording, getSafeTestName, bypassLogin } = require('./videoHelper');

describe('Stylesheets Tests', () => {
    let helper;
    let currentTestName = '';
    const TEST_TIMEOUT = 60000;

    beforeAll(async () => {
        console.log("Setting up Stylesheets Tests...");
        helper = new TestHelper();
        
        // Allow bypassing login via environment variable for faster testing
        if (process.env.BYPASS_LOGIN === 'true') {
            bypassLogin(helper);
        }
        
        await helper.init();
        
        if (process.env.BYPASS_LOGIN !== 'true') {
            await login(helper.page);
        }
    }, TEST_TIMEOUT);

    afterAll(async () => {
        await helper.cleanup();
    });

    beforeEach(async () => {
        // Get current test name with safe formatting
        currentTestName = getSafeTestName();
        
        // Set up video recording with improved naming
        await setupVideoRecording(helper, expect.getState().currentTestName);
        
        // Set test timeout
        jest.setTimeout(TEST_TIMEOUT);
        
        // Navigate to stylesheets page
        console.log("Navigating to stylesheets page...");
        await Promise.race([
            helper.page.goto('https://devmcnichols.bigmachines.com/admin/ui/branding/edit_stylesheets.jsp', {
                waitUntil: 'networkidle2',
                timeout: 30000
            }),
            new Promise(resolve => setTimeout(resolve, 30000))
        ]);
        
        // Take a screenshot of the initial page
        await helper.page.screenshot({
            path: `stylesheets-initial-${Date.now()}.png`,
            fullPage: true
        });
        
        // Verify extension is loaded with retry logic
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Verifying extension loaded (attempt ${attempt}/3)...`);
                await helper.verifyExtensionLoaded();
                break;
            } catch (error) {
                console.warn(`Extension verification failed on attempt ${attempt}: ${error.message}`);
                
                if (attempt === 3) throw error;
                
                // Wait and try again
                await helper.safeWait(2000);
                
                // Try reloading the page
                await helper.page.reload({ waitUntil: 'networkidle2' });
                await helper.safeWait(2000);
            }
        }
    });

    afterEach(async () => {
        // Stop recording and always save the video
        console.log(`Test "${currentTestName}" finished`);
        await helper.stopRecording(true);
        currentTestName = '';
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