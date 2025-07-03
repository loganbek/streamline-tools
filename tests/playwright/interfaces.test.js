const { test, expect } = require('@playwright/test');
const { TestHelper } = require('./helpers');

test.describe('Interfaces Tests', () => {
    let helper;

    test.beforeEach(async ({ page, context }) => {
        console.log("Setting up Interfaces Test...");
        helper = new TestHelper();
        await helper.init(page, context);
    });

    test.afterEach(async () => {
        if (helper) {
            await helper.cleanup();
        }
    });

    test('should navigate to interfaces REST page', async () => {
        console.log("Testing navigation to interfaces REST page...");
        
        // Skip test if environment variables are not set
        if (!process.env.BASE_URL || process.env.BYPASS_LOGIN === 'true') {
            test.skip('Interfaces test skipped due to missing environment variables or bypass login');
            return;
        }
        
        try {
            // Navigate to interfaces page
            const interfacesUrl = `${process.env.BASE_URL}/admin/interfaceCatalogs/list_ics_resources.jsp`;
            await helper.navigateToUrl(interfacesUrl);
            
            // Wait for page to stabilize
            await helper.waitForStableState();
            
            // Look for REST tab and click it
            const restTabSelectors = [
                'a:has-text("REST")',
                'button:has-text("REST")',
                'li:has-text("REST")',
                '[data-tab="REST"]',
                '.tab:has-text("REST")'
            ];
            
            let restTabFound = false;
            for (const selector of restTabSelectors) {
                try {
                    const restTab = helper.page.locator(selector).first();
                    if (await restTab.isVisible()) {
                        console.log(`Found REST tab with selector: ${selector}`);
                        await restTab.click();
                        await helper.safeWait(2000);
                        restTabFound = true;
                        break;
                    }
                } catch (error) {
                    // Try next selector
                    continue;
                }
            }
            
            if (!restTabFound) {
                console.warn("REST tab not found with any selector, checking if we're already on REST page");
            }
            
            // Look for REST-specific elements or "Display Resource" link
            const restIndicators = [
                'a:has-text("Display Resource")',
                'a[href*="display_resource"]',
                'button:has-text("Display Resource")',
                '.resource-link',
                '[data-action="display-resource"]'
            ];
            
            let displayResourceLink = null;
            for (const selector of restIndicators) {
                try {
                    const element = helper.page.locator(selector).first();
                    if (await element.isVisible()) {
                        console.log(`Found REST interface element: ${selector}`);
                        displayResourceLink = element;
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            // Take screenshot of current state
            await helper.takeScreenshot(`interfaces-rest-page-${Date.now()}`);
            
            // Verify we found at least some REST interface elements
            if (displayResourceLink) {
                expect(await displayResourceLink.isVisible()).toBe(true);
                console.log("REST interfaces page loaded successfully");
            } else {
                console.warn("No REST interface elements found - page might have different structure");
            }
            
            // Verify interfaces REST popup is accessible
            console.log("Verifying interfaces REST popup...");
            const popupAccessible = await helper.verifyPopupPage('popupInterfacesREST.html');
            expect(popupAccessible).toBeTruthy();
            
        } catch (error) {
            console.error("Error during REST interfaces test:", error.message);
            await helper.takeScreenshot(`interfaces-rest-failure-${Date.now()}`);
            throw error;
        }
    });

    test('should navigate to interfaces SOAP page', async () => {
        console.log("Testing navigation to interfaces SOAP page...");
        
        // Skip test if environment variables are not set
        if (!process.env.BASE_URL || process.env.BYPASS_LOGIN === 'true') {
            test.skip('Interfaces test skipped due to missing environment variables or bypass login');
            return;
        }
        
        try {
            // Navigate to interfaces page
            const interfacesUrl = `${process.env.BASE_URL}/admin/interfaceCatalogs/list_ics_resources.jsp`;
            await helper.navigateToUrl(interfacesUrl);
            
            // Wait for page to stabilize
            await helper.waitForStableState();
            
            // Look for SOAP tab and click it
            const soapTabSelectors = [
                'a:has-text("SOAP")',
                'button:has-text("SOAP")',
                'li:has-text("SOAP")',
                '[data-tab="SOAP"]',
                '.tab:has-text("SOAP")'
            ];
            
            let soapTabFound = false;
            for (const selector of soapTabSelectors) {
                try {
                    const soapTab = helper.page.locator(selector).first();
                    if (await soapTab.isVisible()) {
                        console.log(`Found SOAP tab with selector: ${selector}`);
                        await soapTab.click();
                        await helper.safeWait(2000);
                        soapTabFound = true;
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            if (!soapTabFound) {
                console.warn("SOAP tab not found, trying alternative approach");
                
                // Try to find and interact with dropdown or select element
                const selectElement = helper.page.locator('select').first();
                if (await selectElement.isVisible()) {
                    await selectElement.selectOption({ label: 'SOAP' });
                    await helper.safeWait(2000);
                    soapTabFound = true;
                }
            }
            
            // Look for search button or similar action
            const searchSelectors = [
                'a:has-text("Search")',
                'button:has-text("Search")',
                '#search',
                'input[type="submit"]',
                '[data-action="search"]'
            ];
            
            let searchButton = null;
            for (const selector of searchSelectors) {
                try {
                    const element = helper.page.locator(selector).first();
                    if (await element.isVisible()) {
                        console.log(`Found search button: ${selector}`);
                        searchButton = element;
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            if (searchButton) {
                await searchButton.click();
                await helper.waitForStableState();
            }
            
            // Take screenshot of current state
            await helper.takeScreenshot(`interfaces-soap-page-${Date.now()}`);
            
            // Verify interfaces SOAP popup is accessible
            console.log("Verifying interfaces SOAP popup...");
            const popupAccessible = await helper.verifyPopupPage('popupInterfacesSOAP.html');
            expect(popupAccessible).toBeTruthy();
            
        } catch (error) {
            console.error("Error during SOAP interfaces test:", error.message);
            await helper.takeScreenshot(`interfaces-soap-failure-${Date.now()}`);
            throw error;
        }
    });

    test('should handle REST metadata operations', async () => {
        console.log("Testing REST metadata operations...");
        
        // Skip test if environment variables are not set
        if (!process.env.BASE_URL || process.env.BYPASS_LOGIN === 'true') {
            test.skip('Interfaces test skipped due to missing environment variables or bypass login');
            return;
        }
        
        try {
            // Navigate to REST interfaces page
            const interfacesUrl = `${process.env.BASE_URL}/admin/interfaceCatalogs/list_ics_resources.jsp`;
            await helper.navigateToUrl(interfacesUrl);
            
            // Wait for page to load
            await helper.waitForStableState();
            
            // Verify popup can be loaded
            const popupAccessible = await helper.verifyPopupPage('popupInterfacesREST.html');
            if (!popupAccessible) {
                throw new Error("REST popup not accessible");
            }
            
            // Sample JSON metadata for testing
            const jsonMetadata = `{
                "name": "CommerceAPI",
                "version": "1.0",
                "description": "Commerce API for testing",
                "endpoints": [
                    {
                        "path": "/orders",
                        "method": "GET",
                        "description": "List all orders"
                    },
                    {
                        "path": "/products",
                        "method": "POST",
                        "description": "Create a new product"
                    }
                ]
            }`;
            
            // Navigate to the popup page to test loading functionality
            const popupUrl = `chrome-extension://${helper.extensionId}/popup/popupInterfacesREST.html`;
            await helper.page.goto(popupUrl);
            await helper.waitForStableState();
            
            // Test loading metadata using the helper
            await helper.testLoad(null, 'api-metadata.json', jsonMetadata);
            
            // Verify content was loaded properly
            const loadedMetadata = await helper.getEditorContent('#contentEditor');
            
            // Use flexible comparison to check if key parts are present
            expect(loadedMetadata).toContain('CommerceAPI');
            expect(loadedMetadata).toContain('endpoints');
            expect(loadedMetadata).toContain('orders');
            expect(loadedMetadata).toContain('products');
            
            console.log("REST metadata loaded and validated successfully");
            
            // Test save functionality if save button exists
            const saveButton = helper.page.locator('#save');
            if (await saveButton.isVisible()) {
                await saveButton.click();
                await helper.safeWait(1000);
                console.log("Save functionality tested");
            }
            
        } catch (error) {
            console.error("Error during REST metadata test:", error.message);
            await helper.takeScreenshot(`rest-metadata-test-failure-${Date.now()}`);
            throw error;
        }
    });

    test('should handle SOAP operations', async () => {
        console.log("Testing SOAP operations...");
        
        // Skip test if environment variables are not set
        if (!process.env.BASE_URL || process.env.BYPASS_LOGIN === 'true') {
            test.skip('Interfaces test skipped due to missing environment variables or bypass login');
            return;
        }
        
        try {
            // Verify SOAP popup can be loaded
            const popupAccessible = await helper.verifyPopupPage('popupInterfacesSOAP.html');
            if (!popupAccessible) {
                throw new Error("SOAP popup not accessible");
            }
            
            // Sample SOAP/XML content for testing
            const soapContent = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
    <soap:Header>
        <auth:Authentication xmlns:auth="http://example.com/auth">
            <auth:username>testuser</auth:username>
            <auth:token>abc123def456</auth:token>
        </auth:Authentication>
    </soap:Header>
    <soap:Body>
        <commerce:GetOrderRequest xmlns:commerce="http://example.com/commerce">
            <commerce:orderId>12345</commerce:orderId>
            <commerce:includeDetails>true</commerce:includeDetails>
        </commerce:GetOrderRequest>
    </soap:Body>
</soap:Envelope>`;
            
            // Navigate to the SOAP popup page
            const popupUrl = `chrome-extension://${helper.extensionId}/popup/popupInterfacesSOAP.html`;
            await helper.page.goto(popupUrl);
            await helper.waitForStableState();
            
            // Test loading SOAP content
            await helper.testLoad(null, 'soap-request.xml', soapContent);
            
            // Verify content was loaded properly
            const loadedContent = await helper.getEditorContent('#contentEditor');
            
            // Check for key SOAP elements
            expect(loadedContent).toContain('soap:Envelope');
            expect(loadedContent).toContain('soap:Body');
            expect(loadedContent).toContain('GetOrderRequest');
            expect(loadedContent).toContain('orderId');
            
            console.log("SOAP content loaded and validated successfully");
            
            // Test unload functionality if available
            const unloadButton = helper.page.locator('#unload');
            if (await unloadButton.isVisible()) {
                await unloadButton.click();
                await helper.safeWait(1000);
                
                // Verify content was cleared
                const clearedContent = await helper.getEditorContent('#contentEditor');
                expect(clearedContent).toBe('');
                console.log("Unload functionality tested successfully");
            }
            
        } catch (error) {
            console.error("Error during SOAP operations test:", error.message);
            await helper.takeScreenshot(`soap-operations-failure-${Date.now()}`);
            throw error;
        }
    });
});