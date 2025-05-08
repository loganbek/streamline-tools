const { TestHelper } = require('./helpers');
const path = require('path');
const fs = require('fs').promises;
const rulesList = require('../../src/rulesList.json');

/**
 * Master test file that covers all 16 rule types from rulesList.json
 * This ensures we test all application areas against the actual BigMachines instance
 */
describe('StreamLine Tools - Complete Rule Coverage Tests', () => {
    let helper;
    let currentTestName = '';
    
    // Read and parse the test rule data
    const appAreas = {};
    
    // Group rules by AppArea for better organization
    rulesList.forEach(rule => {
        if (!appAreas[rule.AppArea]) {
            appAreas[rule.AppArea] = [];
        }
        appAreas[rule.AppArea].push(rule);
    });

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
        
        // Log test configuration
        console.log(`Testing against BigMachines instance: ${process.env.BASE_URL}`);
        console.log(`Total rule types to test: ${rulesList.length}`);
    }, 120000); // 2 minute timeout for setup

    afterAll(async () => {
        await helper.cleanup();
    }, 30000); // 30 seconds for cleanup

    beforeEach(async () => {
        // Get current test name for video recording
        currentTestName = expect.getState().currentTestName.replace(/[^a-zA-Z0-9-_]/g, '_');
        
        // Set up video directory
        const videoDir = path.join(__dirname, 'test-videos');
        await fs.mkdir(videoDir, { recursive: true }).catch(err => {
            if (err.code !== 'EEXIST') console.error("Error creating video directory:", err);
        });
        
        // Start recording this test with a clean name
        console.log(`Starting recording for test: ${currentTestName}`);
        await helper.startRecording(currentTestName);
        
        // Set a long timeout for test execution
        jest.setTimeout(120000); // 2 minutes per test
    });

    afterEach(async () => {
        // Stop recording and save the video
        console.log(`Test "${currentTestName}" finished`);
        await helper.stopRecording(true); // Always save the video
        currentTestName = '';
    });

    // Generate tests for all app areas
    Object.keys(appAreas).forEach(appArea => {
        describe(`${appArea} Rules Tests`, () => {
            // For each rule in this app area
            appAreas[appArea].forEach(rule => {
                test(`should handle ${appArea} - ${rule.RuleName}`, async () => {
                    const page = helper.page;
                    
                    // Normalize the URL to include the BASE_URL
                    const testUrl = rule.URL.replace('*.bigmachines.com', process.env.BASE_URL.replace('https://', ''));
                    
                    console.log(`Testing ${appArea} - ${rule.RuleName} at URL: ${testUrl}`);
                    
                    try {
                        // Navigate to the rule URL
                        await page.goto(testUrl, { 
                            timeout: 30000,
                            waitUntil: 'networkidle2'
                        });
                        
                        // Wait for the page to stabilize
                        await helper.waitForStableState();
                        
                        // Take screenshot for debugging
                        await page.screenshot({ 
                            path: `${appArea}-${rule.RuleName}-initial-${Date.now()}.png`,
                            fullPage: true
                        });
                        
                        // For rules that open in a new window, handle that case
                        if (rule.opensNewWindow === "TRUE") {
                            // Wait for the new window to open
                            console.log(`Waiting for new window to open: ${rule.newWindowURL}`);
                            
                            // Click the element that opens the new window
                            await page.click('a[id="define_function"]');
                            
                            // Get all pages/tabs
                            const pages = await helper.browser.pages();
                            const newPage = pages[pages.length - 1]; // Get the newest page
                            
                            // Switch focus to the new page
                            await newPage.bringToFront();
                            
                            // Wait for the new page to load
                            await newPage.waitForNavigation({ timeout: 30000, waitUntil: 'networkidle2' })
                                .catch(() => console.log('Navigation timeout, continuing anyway...'));
                            
                            // Take screenshot of the new window
                            await newPage.screenshot({ 
                                path: `${appArea}-${rule.RuleName}-newWindow-${Date.now()}.png`,
                                fullPage: true
                            });
                            
                            // Test operations in the new window
                            // This would involve checking for elements specific to this rule type
                            let editorExists = false;
                            
                            // Check if there's an editor element based on the codeSelector from rulesList.json
                            if (rule.codeSelector) {
                                editorExists = await newPage.evaluate((selector) => {
                                    return !!document.querySelector(selector);
                                }, rule.codeSelector);
                            }
                            
                            console.log(`Editor element exists in new window: ${editorExists}`);
                            expect(editorExists).toBe(true);
                            
                            // Close the new window/tab when done
                            await newPage.close();
                        } else {
                            // Test operations in the current window
                            
                            // Check for redirects if applicable
                            if (rule.redirect === "TRUE") {
                                // Wait for the redirect to complete
                                await page.waitForNavigation({ timeout: 30000 })
                                    .catch(() => console.log('Redirect timeout, continuing anyway...'));
                                    
                                // Take screenshot after redirect
                                await page.screenshot({ 
                                    path: `${appArea}-${rule.RuleName}-afterRedirect-${Date.now()}.png`,
                                    fullPage: true
                                });
                            }
                            
                            // Verify editor elements exist based on codeSelector
                            let editorExists = false;
                            
                            if (rule.codeSelector) {
                                editorExists = await page.evaluate((selector) => {
                                    return !!document.querySelector(selector);
                                }, rule.codeSelector);
                            }
                            
                            console.log(`Editor element exists: ${editorExists}`);
                            
                            // Sometimes editors are in iframes, so handle that case
                            if (!editorExists && rule.AppArea === "Documents") {
                                // Check for frames
                                const frames = page.frames();
                                for (const frame of frames) {
                                    const frameUrl = frame.url();
                                    if (frameUrl.includes('document-designer') || frameUrl.includes('editor')) {
                                        editorExists = await frame.evaluate((selector) => {
                                            return !!document.querySelector(selector);
                                        }, rule.codeSelector).catch(() => false);
                                        
                                        if (editorExists) {
                                            console.log(`Found editor in iframe: ${frameUrl}`);
                                            break;
                                        }
                                    }
                                }
                            }
                            
                            expect(editorExists).toBe(true);
                        }
                        
                        // This ensures the test isn't marked as "empty"
                        expect(true).toBe(true);
                    } catch (error) {
                        console.error(`Error testing ${appArea} - ${rule.RuleName}:`, error);
                        
                        // Take a failure screenshot
                        await page.screenshot({ 
                            path: `${appArea}-${rule.RuleName}-FAILURE-${Date.now()}.png`,
                            fullPage: true
                        });
                        
                        throw error;
                    }
                }, 120000); // 2 minute timeout per test
            });
        });
    });
});