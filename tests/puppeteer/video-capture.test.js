const { TestHelper } = require('./helpers');
const path = require('path');
const fs = require('fs').promises;

describe('Video Capture Tests', () => {
    let helper;
    let currentTestName = '';
    const TEST_TIMEOUT = 45000; // 45 seconds test timeout

    beforeAll(async () => {
        console.log("Setting up Video Capture Tests...");
        helper = new TestHelper();
        
        // Override the login method to do nothing for this test
        helper.login = async () => {
            console.log("Login skipped for video capture test");
            return true;
        };
        
        // Initialize without login
        await helper.init();
    }, TEST_TIMEOUT);

    afterAll(async () => {
        await helper.cleanup();
    });

    beforeEach(async () => {
        // Get current test name for video file naming - improve regex to better handle special characters
        currentTestName = expect.getState().currentTestName
            .replace(/[^a-zA-Z0-9]/g, '_')  // Replace any non-alphanumeric chars with underscore
            .replace(/_+/g, '_')            // Replace multiple underscores with a single one
            .toLowerCase();                 // Convert to lowercase for consistency
        
        // Set up video directory
        const videoDir = path.join(__dirname, 'test-videos');
        try {
            await fs.mkdir(videoDir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                console.error("Error creating video directory:", error);
            }
        }
        
        // Start recording this test with improved file name safety
        const videoFile = path.join(videoDir, `${currentTestName}.mp4`);
        console.log(`Starting recording for test: ${currentTestName}`);
        await helper.startRecording(videoFile);
        
        // Set test timeout
        jest.setTimeout(TEST_TIMEOUT);
    });

    afterEach(async () => {
        // Stop recording and always save the video
        console.log(`Test "${currentTestName}" finished`);
        await helper.stopRecording(true); // Always save the video
        currentTestName = '';
    });

    test('should record browser navigation', async () => {
        console.log("Testing video recording with browser navigation");
        const page = helper.page;
        
        // Navigate to a public website that doesn't require login
        await page.goto('https://example.com', { 
            waitUntil: 'networkidle2', 
            timeout: 10000 
        });
        
        // Wait to record some content
        await helper.safeWait(2000);
        
        // Take a screenshot to verify
        await page.screenshot({ path: 'example-website.png', fullPage: true });
        
        // Get page title
        const title = await page.title();
        expect(title).toBe('Example Domain');
        
        // Do some visible interaction
        await page.evaluate(() => {
            // Add some visible content
            const header = document.querySelector('h1');
            if (header) {
                header.style.color = 'red';
                header.textContent = 'Recording Test';
            }
            
            // Add a button and click it to show visual activity
            const div = document.querySelector('div');
            if (div) {
                const button = document.createElement('button');
                button.textContent = 'Click Me';
                button.style.padding = '10px';
                button.style.backgroundColor = 'blue';
                button.style.color = 'white';
                button.style.fontSize = '24px';
                button.onclick = () => {
                    button.textContent = 'Clicked!';
                    button.style.backgroundColor = 'green';
                };
                div.appendChild(button);
                
                // Simulate click after a delay
                setTimeout(() => button.click(), 1000);
            }
        });
        
        // Wait for the button click animation to be recorded
        await helper.safeWait(3000);
        
        console.log("Navigation video test completed");
    }, TEST_TIMEOUT);

    test('should record extension popup interaction', async () => {
        console.log("Testing video recording with extension popup interaction");
        
        // Skip if no extension ID available
        if (!helper.extensionId) {
            console.warn("No extension ID found, skipping extension popup test");
            return;
        }
        
        // Navigate to extension popup
        await helper.page.goto(`chrome-extension://${helper.extensionId}/popup/popup.html`, {
            waitUntil: 'domcontentloaded',
            timeout: 10000
        });
        
        // Take a screenshot to verify
        await helper.page.screenshot({ path: 'extension-popup.png', fullPage: true });
        
        // Wait for content to appear and be recorded
        await helper.safeWait(2000);
        
        // Check for extension buttons
        const hasButtons = await helper.page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            return buttons.length > 0;
        });
        
        // Record some interaction if buttons are present
        if (hasButtons) {
            await helper.page.evaluate(() => {
                // Highlight buttons
                document.querySelectorAll('button').forEach(button => {
                    button.style.border = '3px solid red';
                    // Add hover effect for visual recording
                    button.addEventListener('mouseover', () => {
                        button.style.backgroundColor = 'lightblue';
                    });
                    button.addEventListener('mouseout', () => {
                        button.style.backgroundColor = '';
                    });
                });
            });
            
            // Hover over buttons to show interaction
            const buttons = await helper.page.$$('button');
            for (const button of buttons) {
                await button.hover();
                await helper.safeWait(500);
            }
        }
        
        // Verify the page contains expected extension UI
        const pageContent = await helper.page.content();
        expect(pageContent).toContain('button');
        
        console.log("Extension popup video test completed");
    }, TEST_TIMEOUT);
});