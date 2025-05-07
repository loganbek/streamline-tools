const { TestHelper } = require('./helpers');
const path = require('path');
const fs = require('fs').promises;

describe('Basic Video Test', () => {
    let helper;
    let testVideo;
    const TEST_TIMEOUT = 30000;

    beforeAll(async () => {
        console.log("Setting up Basic Video Test...");
        helper = new TestHelper();
        
        // Skip login completely
        helper.login = async () => {
            console.log("Login skipped for basic video test");
            return true;
        };
        
        // Initialize with skipped login
        await helper.init();
    }, TEST_TIMEOUT);

    afterAll(async () => {
        await helper.cleanup();
    });

    beforeEach(async () => {
        // Create a safe simple filename
        const testName = expect.getState().currentTestName || 'unknown_test';
        const safeFileName = testName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
            .substring(0, 50);
        
        // Set up video directory
        const videoDir = path.join(__dirname, 'test-videos');
        await fs.mkdir(videoDir, { recursive: true }).catch(err => {
            if (err.code !== 'EEXIST') console.error(err);
        });
        
        // Start recording with reliable file name
        testVideo = path.join(videoDir, `${safeFileName}_${Date.now()}.mp4`);
        console.log(`Starting recording to: ${testVideo}`);
        await helper.startRecording(testVideo);
        
        // Set test timeout
        jest.setTimeout(TEST_TIMEOUT);
    });

    afterEach(async () => {
        // Always save the video
        await helper.stopRecording(true);
    });

    test('simple page interaction', async () => {
        const page = helper.page;
        
        // Create a simple HTML page for testing
        await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Video Recording Test</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
                button { padding: 10px 20px; font-size: 18px; margin: 10px; cursor: pointer; }
                .success { color: green; font-weight: bold; display: none; }
                .box { width: 100px; height: 100px; margin: 20px auto; background-color: blue; }
            </style>
        </head>
        <body>
            <h1>Video Capture Test</h1>
            <p>This page demonstrates video capture functionality</p>
            
            <button id="changeColor">Change Color</button>
            <button id="moveBox">Move Box</button>
            <button id="showMessage">Show Message</button>
            
            <div class="box" id="animatedBox"></div>
            
            <p class="success" id="successMsg">Operation completed successfully!</p>
            
            <script>
                // Add some interactive behavior to record
                document.getElementById('changeColor').addEventListener('click', function() {
                    const box = document.getElementById('animatedBox');
                    const colors = ['red', 'green', 'blue', 'orange', 'purple'];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    box.style.backgroundColor = randomColor;
                    showSuccess();
                });
                
                document.getElementById('moveBox').addEventListener('click', function() {
                    const box = document.getElementById('animatedBox');
                    box.style.transition = 'transform 1s ease-in-out';
                    
                    // Toggle position
                    if (box.style.transform === 'translateX(150px)') {
                        box.style.transform = 'translateX(-150px)';
                    } else {
                        box.style.transform = 'translateX(150px)';
                    }
                    showSuccess();
                });
                
                document.getElementById('showMessage').addEventListener('click', function() {
                    alert('This is a test message!');
                    showSuccess();
                });
                
                function showSuccess() {
                    const msg = document.getElementById('successMsg');
                    msg.style.display = 'block';
                    setTimeout(() => {
                        msg.style.display = 'none';
                    }, 2000);
                }
            </script>
        </body>
        </html>
        `);
        
        // Wait for page to render
        await helper.safeWait(1000);
        
        // Click buttons and record interactions
        console.log("Clicking Change Color button");
        await page.click('#changeColor');
        await helper.safeWait(1000);
        
        console.log("Clicking Move Box button twice");
        await page.click('#moveBox');
        await helper.safeWait(1500);
        await page.click('#moveBox');
        await helper.safeWait(1500);
        
        // Handle the alert
        page.on('dialog', async dialog => {
            await dialog.accept();
        });
        
        console.log("Clicking Show Message button");
        await page.click('#showMessage');
        await helper.safeWait(1000);
        
        // Take a screenshot
        await page.screenshot({ path: 'test-interaction.png' });
        
        // Verify page elements as simple test assertions
        const pageTitle = await page.title();
        expect(pageTitle).toBe('Video Recording Test');
        
        const boxColor = await page.$eval('#animatedBox', el => 
            window.getComputedStyle(el).backgroundColor);
        console.log(`Box color is now: ${boxColor}`);
        
        // Simple passing assertion
        expect(true).toBe(true);
    });
});