const { workerData, parentPort } = require('worker_threads');
const jest = require('jest');
const path = require('path');

async function runTest() {
    try {
        // Configure Jest for this worker
        const config = {
            rootDir: path.resolve(__dirname, '..'),
            testMatch: [`**/${workerData.testFile}`],
            maxWorkers: 1, // Each worker runs tests serially
            setupFilesAfterEnv: [path.join(__dirname, 'setup.js')],
            testEnvironment: workerData.testFile.includes('unit') ? 'jsdom' : 'node'
        };

        // Run the test
        const results = await jest.runCLI(
            { 
                ...config,
                json: true, // Get results in JSON format
                silent: true // Reduce console noise
            },
            [config.rootDir]
        );

        // Process results
        const { numPassedTests, numFailedTests, testResults } = results.results;
        const testResult = testResults[0];

        const result = {
            passed: numFailedTests === 0,
            numPassedTests,
            numFailedTests,
            duration: testResult.perfStats.end - testResult.perfStats.start,
            failureMessages: testResult.failureMessage ? [testResult.failureMessage] : []
        };

        // Send results back to main thread
        parentPort.postMessage(result);

    } catch (error) {
        // Handle any errors during test execution
        parentPort.postMessage({
            passed: false,
            error: {
                message: error.message,
                stack: error.stack
            }
        });
    }
}

// Start test execution
runTest();