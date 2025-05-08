const { TestHelper } = require('./helpers');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

describe('Video Capture Tests', () => {
    let helper;
    let currentTestName = '';
    const TEST_TIMEOUT = 60000; // Extended to 60 seconds
    
    // Use a simpler path that's more likely to work across environments
    const videoDir = path.join(os.tmpdir(), 'streamline-test-videos');
    
    console.log(`Video directory will be: ${videoDir}`);

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
        
        // Create video directory at the beginning
        try {
            await fs.mkdir(videoDir, { recursive: true });
            console.log(`Created video directory: ${videoDir}`);
            
            // Test write permission with a small file
            const testFile = path.join(videoDir, 'test-write.txt');
            await fs.writeFile(testFile, 'Test write permission');
            await fs.unlink(testFile);
            console.log('Directory has write permission confirmed');
        } catch (error) {
            console.error(`Error setting up video directory: ${error.message}`);
            console.error(`Full error: ${JSON.stringify(error)}`);
        }
    }, TEST_TIMEOUT);

    afterAll(async () => {
        try {
            await helper.cleanup();
            console.log('TestHelper cleanup completed');
            
            // List created videos
            try {
                const files = await fs.readdir(videoDir);
                console.log(`Videos created in ${videoDir}:`);
                files.forEach(file => console.log(` - ${file}`));
                
                if (files.length === 0) {
                    console.log('No video files were created!');
                }
            } catch (err) {
                console.error(`Error listing video directory: ${err.message}`);
            }
        } catch (error) {
            console.error(`Error in afterAll cleanup: ${error.message}`);
        }
    });

    beforeEach(async () => {
        try {
            // Get current test name for video file naming - improve regex to better handle special characters
            currentTestName = expect.getState().currentTestName
                .replace(/[^a-zA-Z0-9]/g, '_')  // Replace any non-alphanumeric chars with underscore
                .replace(/_+/g, '_')            // Replace multiple underscores with a single one
                .toLowerCase();                 // Convert to lowercase for consistency
            
            // Start recording this test with improved file name safety
            const videoFile = path.join(videoDir, `${currentTestName}.mp4`);
            console.log(`Starting recording for test: ${currentTestName}`);
            console.log(`Video will be saved to: ${videoFile}`);
            
            const recordingStarted = await helper.startRecording(videoFile);
            if (!recordingStarted) {
                console.error('Failed to start recording!');
            }
            
            // Set test timeout
            jest.setTimeout(TEST_TIMEOUT);
        } catch (error) {
            console.error(`Error in beforeEach: ${error.message}`);
        }
    });

    afterEach(async () => {
        try {
            // Stop recording and always save the video
            console.log(`Test "${currentTestName}" finished, stopping recording`);
            await helper.stopRecording(true); // Always save the video
            
            // Check if video file exists
            const videoFile = path.join(videoDir, `${currentTestName}.mp4`);
            try {
                const stats = await fs.stat(videoFile);
                console.log(`Video created: ${videoFile}, size: ${stats.size} bytes`);
                
                if (stats.size === 0) {
                    console.error('Warning: Video file size is 0 bytes!');
                }
            } catch (err) {
                console.error(`Video file not found after recording: ${err.message}`);
            }
            
            currentTestName = '';
        } catch (error) {
            console.error(`Error in afterEach: ${error.message}`);
        }
    });

    test('should record browser navigation', async () => {
        console.log("Testing video recording with browser navigation");
        const page = helper.page;
        
        try {
            // Navigate to a public website that doesn't require login
            await page.goto('https://example.com', { 
                waitUntil: 'networkidle2', 
                timeout: 15000 
            });
            
            console.log('Successfully navigated to example.com');
            
            // Wait to record some content
            await helper.safeWait(2000);
            
            // Take a screenshot to verify
            await page.screenshot({ path: path.join(videoDir, 'example-website.png'), fullPage: true });
            
            // Get page title
            const title = await page.title();
            console.log(`Page title: ${title}`);
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
        } catch (error) {
            console.error(`Error in browser navigation test: ${error.message}`);
            throw error; // Re-throw to fail the test
        }
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
        await helper.page.screenshot({ path: path.join(videoDir, 'extension-popup.png'), fullPage: true });
        
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

    test('should record a simple animation', async () => {
        console.log("Testing video recording with a simple animation");
        const page = helper.page;
        
        try {
            // Create a new page with animation
            await page.setContent(`
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        .box {
                            width: 100px;
                            height: 100px;
                            background-color: red;
                            position: absolute;
                            animation: move 5s infinite;
                        }
                        @keyframes move {
                            0%   { left: 0px; top: 0px; }
                            25%  { left: 200px; top: 0px; background-color: blue; }
                            50%  { left: 200px; top: 200px; background-color: green; }
                            75%  { left: 0px; top: 200px; background-color: yellow; }
                            100% { left: 0px; top: 0px; background-color: red; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Animation Recording Test</h1>
                    <div class="box"></div>
                    <div style="margin-top: 350px">
                        <p id="counter">Recording: 0 seconds</p>
                    </div>
                </body>
                </html>
            `);
            
            // Update a counter to show time passing
            await page.evaluate(() => {
                let count = 0;
                window.interval = setInterval(() => {
                    count++;
                    const el = document.getElementById('counter');
                    if (el) el.textContent = `Recording: ${count} seconds`;
                }, 1000);
            });
            
            // Record for 8 seconds
            console.log('Recording animation for 8 seconds...');
            await helper.safeWait(8000);
            
            // Clean up interval
            await page.evaluate(() => {
                clearInterval(window.interval);
            });
            
            console.log('Animation recording test completed');
        } catch (error) {
            console.error(`Error in animation test: ${error.message}`);
            throw error;
        }
    }, TEST_TIMEOUT);
});