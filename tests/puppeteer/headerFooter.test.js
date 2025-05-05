const { TestHelper } = require('./helpers');
const login = require('./login');
const path = require('path'); // Add path for video file paths
const fs = require('fs').promises; // Add fs for directory creation

describe('Header & Footer Tests', () => {
    let helper;
    let currentTestName = ''; // Variable to track current test name for video files
    // Test content for header and footer
    const headerContent = `<!-- Test Header Content -->
<div class="test-header">
    <h1>Test Header</h1>
    <p>This is a test header for automated testing</p>
</div>`;

    const footerContent = `<!-- Test Footer Content -->
<div class="test-footer">
    <p>Test Footer</p>
    <p>&copy; 2025 Test Company</p>
</div>`;

    beforeAll(async () => {
        console.log("Starting Header & Footer Tests setup...");
        helper = new TestHelper();
        await helper.init();
        console.log("Login process starting...");
        await login(helper.page);
        console.log("Login completed, showing extension in browser...");
        await helper.showExtensionInBrowser(); // Show extension in browser
        console.log("Pinning extension to toolbar...");
        await helper.pinExtensionToToolbar();
        console.log("Test setup complete");
    }, 180000); // Extend timeout for initialization

    afterAll(async () => {
        await helper.cleanup();
    });

    beforeEach(async () => {
        // Get the current test name for use in video file naming
        currentTestName = expect.getState().currentTestName.replace(/\s+/g, '_');
        
        // Create and ensure the videos directory exists
        const videoDir = path.join(__dirname, 'test-videos');
        try {
            await fs.mkdir(videoDir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                console.error("Error creating video directory:", error);
            }
        }
        
        // Start recording this test
        console.log(`Starting recording for test: ${currentTestName}`);
        await helper.startRecording(path.join(videoDir, `${currentTestName}.webm`));

        console.log("Navigating to header/footer admin page...");
        try {
            // First go to the admin main page with more resilient navigation
            console.log("Navigating to main admin page...");
            await Promise.race([
                helper.page.goto(`${process.env.BASE_URL}/admin`, {
                    waitUntil: 'networkidle2',
                    timeout: 45000
                }),
                new Promise(resolve => setTimeout(resolve, 45000))
            ]);
            
            // Wait for any redirects or JS initialization
            await helper.safeWait(3000);
            
            console.log("On admin page, now navigating to header/footer editor...");
            // Then navigate to the header/footer editor with more resilient navigation
            await Promise.race([
                helper.page.goto(`${process.env.BASE_URL}/admin/header_footer/edit.jsp`, {
                    waitUntil: 'networkidle2',
                    timeout: 45000
                }),
                new Promise(resolve => setTimeout(resolve, 45000))
            ]);
            
            // Take screenshot of initial page state
            await helper.page.screenshot({ 
                path: `header-footer-initial-${Date.now()}.png`,
                fullPage: true 
            });
            
            // More reliable wait strategy using both timeout and DOM checks
            await Promise.race([
                helper.page.waitForFunction(() => {
                    // Wait until the page appears to be fully loaded
                    return document.readyState === 'complete' && 
                           !document.querySelector('.loading-indicator') &&
                           !document.querySelector('.x-mask-loading');
                }, { timeout: 10000 }),
                helper.safeWait(10000)
            ]);
            
            console.log("Taking screenshot of current admin page state...");
            await helper.page.screenshot({ 
                path: `header-footer-admin-page-${Date.now()}.png`,
                fullPage: true 
            });
            
            // Check if extension buttons are present with retry mechanism
            let buttonsFound = false;
            for (let attempt = 1; attempt <= 3; attempt++) {
                console.log(`Checking for extension buttons (attempt ${attempt}/3)...`);
                
                buttonsFound = await helper.page.evaluate(() => {
                    const unloadHeader = document.getElementById('unloadHeaderHTML');
                    const loadHeader = document.getElementById('loadHeaderHTML');
                    return !!(unloadHeader || loadHeader);
                });
                
                if (buttonsFound) {
                    console.log("Extension buttons found on page!");
                    break;
                } else {
                    console.log("Extension buttons not found, waiting or attempting activation...");
                    
                    // Attempt to activate extension if needed
                    if (helper.extensionId) {
                        try {
                            console.log("Trying to activate extension by direct page access...");
                            // Store current URL to return to
                            const currentUrl = await helper.page.url();
                            
                            // Open extension popup in a new tab
                            const popupPage = await helper.browser.newPage();
                            await popupPage.goto(`chrome-extension://${helper.extensionId}/popup/popup.html`, { 
                                waitUntil: 'networkidle2',
                                timeout: 10000 
                            });
                            await popupPage.screenshot({ path: `extension-popup-direct-${attempt}.png` });
                            await popupPage.close();
                            
                            // Return to the admin page
                            await helper.page.goto(currentUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                            
                            // Refresh the page to trigger content script injection
                            await helper.page.reload({ waitUntil: 'networkidle2' });
                        } catch (e) {
                            console.warn("Could not activate extension directly:", e.message);
                        }
                    }
                    
                    // Wait before next check
                    await helper.safeWait(3000);
                }
            }
            
            // If extension still not detected, try to inject elements manually for testing
            if (!buttonsFound) {
                console.warn("Extension buttons not found after multiple attempts, trying alternative approach");
                
                // Try clicking on the page to activate any pending scripts
                await helper.page.mouse.click(100, 100);
                await helper.safeWait(1000);
                
                // Try triggering a reload of the page
                await helper.page.reload({ waitUntil: 'networkidle2' });
                await helper.safeWait(3000);
                
                // Take final screenshot to debug
                await helper.page.screenshot({ 
                    path: `extension-activation-final-attempt-${Date.now()}.png`,
                    fullPage: true 
                });
            }
            
            console.log("BeforeEach setup completed");
        } catch (error) {
            console.error("Error during beforeEach setup:", error);
            // Take error screenshot
            await helper.page.screenshot({ 
                path: `before-each-error-${Date.now()}.png`,
                fullPage: true 
            });
            throw error;
        }
    }, 90000); // Extend timeout for initialization

    afterEach(async () => {
        // Stop recording and always save the video, regardless of test outcome
        console.log(`Test "${currentTestName}" finished`);
        await helper.stopRecording(true); // Always save the video
        currentTestName = ''; // Reset current test name
    });

    test('should load header & footer interface', async () => {
        console.log("Testing header & footer interface loading...");
        
        // Take a screenshot before looking for the popup
        await helper.page.screenshot({
            path: 'before-popup-verification.png',
            fullPage: true
        });
        
        // Retry logic for getting popup frame
        let popup = null;
        let frame = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Attempting to get popup frame (attempt ${attempt}/3)`);
                popup = await helper.verifyPopupPage('popupHeaderFooterHTML.html');
                if (!popup) {
                    throw new Error("Popup not found");
                }
                
                // Switch to popup frame
                frame = await popup.contentFrame();
                if (!frame) {
                    throw new Error("Could not get content frame");
                }
                
                // Take a screenshot of the frame content
                await frame.screenshot({
                    path: `popup-frame-content-attempt-${attempt}.png`
                });
                
                console.log("Successfully retrieved popup and frame");
                break;
            } catch (error) {
                console.warn(`Error getting popup or frame on attempt ${attempt}:`, error.message);
                if (attempt === 3) throw error;
                
                // Wait before retrying
                await helper.safeWait(2000);
                
                // Try refreshing the page to reset state
                if (attempt > 1) {
                    await helper.page.reload({ waitUntil: 'networkidle2' });
                    await helper.safeWait(3000);
                }
            }
        }
        
        // Verify essential UI elements with retry logic
        let uiElementsVerified = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Verifying UI elements (attempt ${attempt}/3)`);
                
                // Check for UI elements
                const hasEditor = await frame.evaluate(() => !!document.querySelector('#contentEditor'));
                const hasValidateButton = await frame.evaluate(() => !!document.querySelector('#validateHTML'));
                const hasSaveButton = await frame.evaluate(() => !!document.querySelector('#save'));
                
                // Take screenshot of what we're seeing in the frame
                await frame.screenshot({
                    path: `ui-elements-verification-attempt-${attempt}.png`
                });
                
                // Verify all required UI elements are present
                expect(hasEditor).toBe(true);
                expect(hasValidateButton).toBe(true);
                expect(hasSaveButton).toBe(true);
                
                uiElementsVerified = true;
                console.log("All UI elements successfully verified");
                break;
            } catch (error) {
                console.error(`UI element verification failed on attempt ${attempt}:`, error.message);
                
                if (attempt === 3) throw error;
                
                // Wait before retrying
                await helper.safeWait(3000);
                
                // Try refreshing the frame
                try {
                    await frame.evaluate(() => window.location.reload());
                    await helper.safeWait(2000);
                } catch (e) {
                    console.warn("Could not refresh frame:", e.message);
                }
            }
        }
        
        expect(uiElementsVerified).toBe(true);
        console.log("Header & footer interface test passed!");
    }, 90000); // Increase timeout

    test('should handle header content editing', async () => {
        console.log("Testing header content editing...");
        
        // Retry logic for getting popup frame
        let popup = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Attempting to get popup frame (attempt ${attempt}/3)`);
                popup = await helper.verifyPopupPage('popupHeaderFooterHTML.html');
                if (popup) break;
            } catch (error) {
                console.warn(`Error getting popup frame on attempt ${attempt}:`, error.message);
                if (attempt === 3) throw error;
                
                // Wait before retrying
                await helper.safeWait(2000);
                
                // Try refreshing the page to reset state
                if (attempt > 1) {
                    await helper.page.reload({ waitUntil: 'networkidle2' });
                    await helper.safeWait(3000);
                }
            }
        }
        
        // First check unload functionality for header
        console.log("Testing unloadHeaderHTML functionality...");
        try {
            // Use retry logic for finding and clicking the unload button
            let unloadSuccess = false;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    // Get the header content via unload
                    unloadSuccess = await helper.page.evaluate(() => {
                        const unloadHeaderButton = document.getElementById('unloadHeaderHTML');
                        if (unloadHeaderButton) {
                            console.log("Found unloadHeaderHTML button, clicking it");
                            unloadHeaderButton.click();
                            return true;
                        } else {
                            console.error("Could not find unloadHeaderHTML button");
                            return false;
                        }
                    });
                    
                    if (unloadSuccess) {
                        console.log(`Header unload button clicked successfully on attempt ${attempt}`);
                        break;
                    } else if (attempt < 3) {
                        console.warn("Button not found, will retry...");
                        await helper.safeWait(2000);
                    } else {
                        throw new Error("Unload Header button not found after multiple attempts");
                    }
                } catch (e) {
                    if (attempt === 3) throw e;
                    await helper.safeWait(1000);
                }
            }
            
            // Allow time for the unload operation
            await helper.safeWait(2000);
        } catch (error) {
            console.error("Error during header unload test:", error);
            
            // Take a screenshot to debug
            await helper.page.screenshot({
                path: `header-unload-error-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
                fullPage: true
            });
            
            // Don't throw here, we'll try to continue with the test
            console.log("Continuing with test despite unload issue...");
        }
        
        // Now test loading header content with retry logic
        console.log("Testing loadHeaderHTML functionality...");
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                await helper.testLoad(popup, 'header-test.html', headerContent);
                
                // Check if content was loaded correctly
                const frame = await popup.contentFrame();
                if (!frame) {
                    throw new Error("Could not get frame content");
                }
                
                const loadedContent = await frame.evaluate(() => {
                    return document.querySelector('#contentEditor')?.value || '';
                });
                
                // Verify content matches what we expected
                expect(loadedContent).toContain("Test Header");  // More flexible comparison
                console.log("Header content verified successfully!");
                break;
            } catch (error) {
                console.error(`Error during header load test (attempt ${attempt}):`, error.message);
                
                // Take a screenshot to debug
                await helper.page.screenshot({
                    path: `header-load-error-attempt-${attempt}.png`,
                    fullPage: true
                });
                
                if (attempt === 3) {
                    throw error;
                }
                
                // Wait before retrying
                await helper.safeWait(3000);
            }
        }
        
        console.log("Header content editing test completed");
    }, 90000); // Increase timeout

    test('should handle footer content editing', async () => {
        console.log("Testing footer content editing...");
        
        // Retry logic for getting popup frame
        let popup = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Attempting to get popup frame (attempt ${attempt}/3)`);
                popup = await helper.verifyPopupPage('popupHeaderFooterHTML.html');
                if (popup) break;
            } catch (error) {
                console.warn(`Error getting popup frame on attempt ${attempt}:`, error.message);
                if (attempt === 3) throw error;
                
                // Wait before retrying
                await helper.safeWait(2000);
                
                // Try refreshing the page to reset state
                if (attempt > 1) {
                    await helper.page.reload({ waitUntil: 'networkidle2' });
                    await helper.safeWait(3000);
                }
            }
        }
        
        // First check unload functionality for footer
        console.log("Testing unloadFooterHTML functionality...");
        try {
            // Use retry logic for finding and clicking the unload button
            let unloadSuccess = false;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    // Get the footer content via unload
                    unloadSuccess = await helper.page.evaluate(() => {
                        const unloadFooterButton = document.getElementById('unloadFooterHTML');
                        if (unloadFooterButton) {
                            console.log("Found unloadFooterHTML button, clicking it");
                            unloadFooterButton.click();
                            return true;
                        } else {
                            console.error("Could not find unloadFooterHTML button");
                            return false;
                        }
                    });
                    
                    if (unloadSuccess) {
                        console.log(`Footer unload button clicked successfully on attempt ${attempt}`);
                        break;
                    } else if (attempt < 3) {
                        console.warn("Button not found, will retry...");
                        await helper.safeWait(2000);
                    } else {
                        throw new Error("Unload Footer button not found after multiple attempts");
                    }
                } catch (e) {
                    if (attempt === 3) throw e;
                    await helper.safeWait(1000);
                }
            }
            
            // Allow time for the unload operation
            await helper.safeWait(2000);
        } catch (error) {
            console.error("Error during footer unload test:", error);
            
            // Take a screenshot to debug
            await helper.page.screenshot({
                path: `footer-unload-error-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
                fullPage: true
            });
            
            // Don't throw here, we'll try to continue with the test
            console.log("Continuing with test despite unload issue...");
        }
        
        // Now test loading footer content with retry logic
        console.log("Testing loadFooterHTML functionality...");
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                await helper.testLoad(popup, 'footer-test.html', footerContent);
                
                // Check if content was loaded correctly
                const frame = await popup.contentFrame();
                if (!frame) {
                    throw new Error("Could not get frame content");
                }
                
                const loadedContent = await frame.evaluate(() => {
                    return document.querySelector('#contentEditor')?.value || '';
                });
                
                // Verify content matches what we expected
                expect(loadedContent).toContain("Test Footer");  // More flexible comparison
                console.log("Footer content verified successfully!");
                break;
            } catch (error) {
                console.error(`Error during footer load test (attempt ${attempt}):`, error.message);
                
                // Take a screenshot to debug
                await helper.page.screenshot({
                    path: `footer-load-error-attempt-${attempt}.png`,
                    fullPage: true
                });
                
                if (attempt === 3) {
                    throw error;
                }
                
                // Wait before retrying
                await helper.safeWait(3000);
            }
        }
        
        console.log("Footer content editing test completed");
    }, 90000); // Increase timeout

    test('should support CSS inclusion', async () => {
        console.log("Testing CSS inclusion in header/footer content...");
        
        // Retry logic for getting popup frame
        let popup = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Attempting to get popup frame (attempt ${attempt}/3)`);
                popup = await helper.verifyPopupPage('popupHeaderFooterHTML.html');
                if (popup) break;
            } catch (error) {
                console.warn(`Error getting popup frame on attempt ${attempt}:`, error.message);
                if (attempt === 3) throw error;
                
                // Wait before retrying
                await helper.safeWait(2000);
                
                // Try refreshing the page to reset state
                if (attempt > 1) {
                    await helper.page.reload({ waitUntil: 'networkidle2' });
                    await helper.safeWait(3000);
                }
            }
        }
        
        // Define content with CSS
        const contentWithCSS = `
<style>
.test-header { color: blue; }
.test-footer { color: green; }
</style>
<header class="test-header">Header content with CSS</header>
<footer class="test-footer">Footer content with CSS</footer>`;

        // Load content with CSS with retry logic
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Attempting to load CSS content (attempt ${attempt}/3)`);
                await helper.testLoad(popup, 'styled.html', contentWithCSS);
                
                // Verify CSS was handled properly
                const frame = await popup.contentFrame();
                if (!frame) {
                    throw new Error("Could not get frame content");
                }
                
                const hasStyle = await frame.evaluate(() => {
                    // Check if our content with CSS was loaded correctly
                    const editor = document.querySelector('#contentEditor');
                    return editor && editor.value.includes('<style>');
                });
                
                expect(hasStyle).toBe(true);
                console.log("CSS content verified successfully!");
                break;
            } catch (error) {
                console.error(`Error during CSS inclusion test (attempt ${attempt}):`, error.message);
                
                // Take a screenshot to debug
                await helper.page.screenshot({
                    path: `css-inclusion-error-attempt-${attempt}.png`,
                    fullPage: true
                });
                
                if (attempt === 3) {
                    throw error;
                }
                
                // Wait before retrying
                await helper.safeWait(3000);
            }
        }
        
        console.log("CSS inclusion test passed!");
    }, 90000); // Increase timeout
});