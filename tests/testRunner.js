const { spawn } = require('child_process');
const path = require('path');

// Test suites in order of execution
const TEST_SUITES = [
    {
        name: 'Unit Tests',
        command: 'npm run test:unit',
        required: true
    },
    {
        name: 'Login Tests',
        command: 'npm run test:puppeteer tests/puppeteer/login.test.js',
        required: true
    },
    {
        name: 'Rule Matching Tests',
        command: 'npm run test:puppeteer tests/puppeteer/ruleMatching.test.js',
        required: true
    },
    {
        name: 'Header & Footer Tests',
        command: 'npm run test:puppeteer tests/puppeteer/headerFooter.test.js',
        required: false
    },
    {
        name: 'Commerce Rules Tests',
        command: 'npm run test:puppeteer tests/puppeteer/commerceRules.test.js',
        required: false
    },
    {
        name: 'Configuration Rules Tests',
        command: 'npm run test:puppeteer tests/puppeteer/configurationRules.test.js',
        required: false
    },
    {
        name: 'Document Designer Tests',
        command: 'npm run test:puppeteer tests/puppeteer/documentDesigner.test.js',
        required: false
    },
    {
        name: 'Stylesheet Tests',
        command: 'npm run test:puppeteer tests/puppeteer/stylesheets.test.js',
        required: false
    },
    {
        name: 'Interface Tests',
        command: 'npm run test:puppeteer tests/puppeteer/interfaces.test.js',
        required: false
    },
    {
        name: 'Commerce Actions Tests',
        command: 'npm run test:puppeteer tests/puppeteer/commerceActions.test.js',
        required: false
    }
];

// Maximum number of retries for failed tests
const MAX_RETRIES = 3;

// Delay between retries in milliseconds
const RETRY_DELAY = 5000;

async function runTest(testSuite, attempt = 1) {
    return new Promise((resolve, reject) => {
        console.log(`\nRunning ${testSuite.name} (Attempt ${attempt}/${MAX_RETRIES})`);
        
        const test = spawn('cmd', ['/c', testSuite.command], { 
            stdio: 'inherit',
            shell: true
        });

        test.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${testSuite.name} passed`);
                resolve(true);
            } else {
                console.log(`❌ ${testSuite.name} failed with code ${code}`);
                resolve(false);
            }
        });

        test.on('error', (err) => {
            console.error(`Error running ${testSuite.name}:`, err);
            resolve(false);
        });
    });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTestWithRetry(testSuite) {
    let attempt = 1;
    let success = false;

    while (attempt <= MAX_RETRIES && !success) {
        success = await runTest(testSuite, attempt);
        
        if (!success && attempt < MAX_RETRIES) {
            console.log(`Retrying ${testSuite.name} in ${RETRY_DELAY/1000} seconds...`);
            await sleep(RETRY_DELAY);
            attempt++;
        }
    }

    return {
        name: testSuite.name,
        success,
        attempts: attempt
    };
}

async function runAllTests() {
    console.log('Starting test suite execution\n');
    const results = [];
    let allRequiredPassed = true;

    for (const suite of TEST_SUITES) {
        const result = await runTestWithRetry(suite);
        results.push(result);

        if (!result.success && suite.required) {
            allRequiredPassed = false;
            console.error(`\n❌ Required test suite "${suite.name}" failed after ${result.attempts} attempts`);
            break;
        }
    }

    // Print summary
    console.log('\n=== Test Execution Summary ===');
    results.forEach(result => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${result.name} (${result.attempts} attempt${result.attempts > 1 ? 's' : ''})`);
    });

    const exitCode = allRequiredPassed ? 0 : 1;
    console.log(`\nTest execution ${allRequiredPassed ? 'succeeded' : 'failed'}`);
    process.exit(exitCode);
}

// Run tests if this script is executed directly
if (require.main === module) {
    runAllTests().catch(error => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });
}

module.exports = {
    runTest,
    runTestWithRetry,
    runAllTests,
    TEST_SUITES
};