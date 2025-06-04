/**
 * Test runner script for StreamLine Tools CPQ tests
 * This script allows running either sample tests (one per AppArea) or all tests
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Parse command-line arguments
const args = process.argv.slice(2);
const isSampleRun = args.includes('--sample') || args.includes('-s');
const isAllRun = args.includes('--all') || args.includes('-a');
const verbose = args.includes('--verbose') || args.includes('-v');
const help = args.includes('--help') || args.includes('-h');
const debug = args.includes('--debug') || args.includes('-d');

// If neither sample nor all is specified, default to all
const runMode = isSampleRun ? 'sample' : 'all';

if (help) {
    console.log(`
StreamLine Tools CPQ Test Runner
===============================

Usage:
  node run-cpq-tests.js [options]

Options:
  -s, --sample   Run only one test per AppArea (faster)
  -a, --all      Run all tests from rulesList.json (default)
  -v, --verbose  Show verbose output
  -d, --debug    Enable debug mode with additional diagnostics
  -h, --help     Show this help message

Examples:
  node run-cpq-tests.js --sample   Run one test from each AppArea
  node run-cpq-tests.js --all      Run all tests from rulesList.json
`);
    process.exit(0);
}

// Ensure .env file exists in tests directory
const envFilePath = path.join(__dirname, 'tests', '.env');
if (!fs.existsSync(envFilePath)) {
    console.error('\x1b[31m%s\x1b[0m', `
ERROR: Missing .env file in tests directory.
Please create a tests/.env file with the following variables:

CPQ_USERNAME=your_username
CPQ_PASSWORD=your_password
BASE_URL=https://yourinstance.bigmachines.com

Refer to README.md for more details.
`);
    process.exit(1);
}

// Determine which test file to run
const testFile = isSampleRun 
    ? 'tests/puppeteer/rulesList-sample.test.js' 
    : 'tests/puppeteer/rulesList-master.test.js';

console.log(`
==========================================
StreamLine Tools CPQ Test Runner
==========================================
Mode: ${isSampleRun ? 'SAMPLE (one test per AppArea)' : 'FULL (all tests)'}
Test file: ${testFile}
Debug mode: ${debug ? 'ON' : 'OFF'}
==========================================
`);

// Check for environmental variables in the .env file
try {
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    const hasUsername = envContent.includes('CPQ_USERNAME=') && !envContent.includes('CPQ_USERNAME=your_username');
    const hasPassword = envContent.includes('CPQ_PASSWORD=') && !envContent.includes('CPQ_PASSWORD=your_password');
    const hasBaseUrl = envContent.includes('BASE_URL=') && !envContent.includes('BASE_URL=https://yourinstance.bigmachines.com');
    
    if (!hasUsername || !hasPassword || !hasBaseUrl) {
        console.warn('\x1b[33m%s\x1b[0m', `
WARNING: Your tests/.env file appears to have missing or default credentials.
Make sure to update with your actual Oracle CPQ Cloud credentials before running tests.
`);
    }
} catch (err) {
    console.warn('\x1b[33m%s\x1b[0m', 'Warning: Could not validate .env file contents.');
}

// Build the Jest arguments
const jestArgs = [
    testFile,
    '--testTimeout=120000',
    verbose ? '--verbose' : '',
    debug ? '--detectOpenHandles' : '',
    debug ? '--runInBand' : ''
].filter(Boolean);

// Set environment variable for debug mode
if (debug) {
    process.env.DEBUG_TESTS = 'true';
}

console.log(`Running Jest with args: npx jest ${jestArgs.join(' ')}\n`);

// Use more reliable method to invoke npx
// First, try to use the npm binary path directly
const npmBinPath = path.resolve(__dirname, 'node_modules', '.bin');
let npxCommand;
let spawnOptions;

// Determine the correct command to use based on OS
if (process.platform === 'win32') {
    // On Windows, use npx.cmd from .bin directory
    npxCommand = path.join(npmBinPath, 'npx.cmd');
    spawnOptions = { 
        env: { ...process.env },
        stdio: 'inherit',
        shell: true 
    };
} else {
    // On Unix-like systems, use npx from .bin directory
    npxCommand = path.join(npmBinPath, 'npx');
    spawnOptions = { 
        env: { ...process.env },
        stdio: 'inherit'
    };
}

// If local npx doesn't exist, fall back to require.resolve
if (!fs.existsSync(npxCommand)) {
    try {
        // Try to resolve jest directly
        const jestPath = require.resolve('jest/bin/jest');
        console.log(`Using Jest directly from: ${jestPath}`);
        
        // Run Jest directly instead of through npx
        const testProcess = spawn('node', [jestPath, ...jestArgs], {
            env: { ...process.env },
            stdio: 'inherit'
        });
        
        testProcess.on('close', (code) => {
            console.log(`
==========================================
Test run complete with exit code: ${code}
==========================================
            `);
            
            // Provide guidance based on test results
            if (code !== 0) {
                console.log('\x1b[33m%s\x1b[0m', `
Tests failed. Here are some troubleshooting tips:

1. Check your tests/.env file - make sure you've entered the correct credentials
2. Look for screenshot files in the project root - they can provide clues about failures
3. Try running with --debug flag for more detailed output: node run-cpq-tests.js --sample --debug
4. Check if your BigMachines instance is accessible in your browser
5. Verify that the selectors in rulesList.json match your actual BigMachines instance
`);
            }
        });

        // Handle unexpected errors
        testProcess.on('error', (err) => {
            console.error('\x1b[31m%s\x1b[0m', `ERROR: Failed to start test process: ${err.message}`);
            process.exit(1);
        });
    } catch (error) {
        // If all else fails, try using node to execute npx
        console.log('Falling back to node npx execution');
        const testProcess = spawn('node', [
            path.join(__dirname, 'node_modules', 'npm', 'bin', 'npx-cli.js'), 
            'jest', 
            ...jestArgs
        ], {
            env: { ...process.env },
            stdio: 'inherit'
        });
        
        testProcess.on('close', (code) => {
            console.log(`
==========================================
Test run complete with exit code: ${code}
==========================================
            `);
            
            // Provide guidance based on test results
            if (code !== 0) {
                console.log('\x1b[33m%s\x1b[0m', `
Tests failed. Here are some troubleshooting tips:

1. Check your tests/.env file - make sure you've entered the correct credentials
2. Look for screenshot files in the project root - they can provide clues about failures
3. Try running with --debug flag for more detailed output: node run-cpq-tests.js --sample --debug
4. Check if your BigMachines instance is accessible in your browser
5. Verify that the selectors in rulesList.json match your actual BigMachines instance
`);
            }
        });

        // Handle unexpected errors
        testProcess.on('error', (err) => {
            console.error('\x1b[31m%s\x1b[0m', `ERROR: Failed to start test process: ${err.message}`);
            
            // More detailed error information for debugging
            console.error('\x1b[31m%s\x1b[0m', `
Command attempted: ${npxCommand}
Error details: ${err.toString()}
NPX path exists: ${fs.existsSync(npxCommand)}
NODE_PATH: ${process.env.NODE_PATH || 'Not set'}
`);
            
            process.exit(1);
        });
    }
} else {
    console.log(`Using npx from: ${npxCommand}`);
    const testProcess = spawn(npxCommand, ['jest', ...jestArgs], spawnOptions);
    
    testProcess.on('close', (code) => {
        console.log(`
==========================================
Test run complete with exit code: ${code}
==========================================
        `);
        
        // Provide guidance based on test results
        if (code !== 0) {
            console.log('\x1b[33m%s\x1b[0m', `
Tests failed. Here are some troubleshooting tips:

1. Check your tests/.env file - make sure you've entered the correct credentials
2. Look for screenshot files in the project root - they can provide clues about failures
3. Try running with --debug flag for more detailed output: node run-cpq-tests.js --sample --debug
4. Check if your BigMachines instance is accessible in your browser
5. Verify that the selectors in rulesList.json match your actual BigMachines instance
`);
        }
    });

    // Handle unexpected errors
    testProcess.on('error', (err) => {
        console.error('\x1b[31m%s\x1b[0m', `ERROR: Failed to start test process: ${err.message}`);
        
        // More detailed error information for debugging
        console.error('\x1b[31m%s\x1b[0m', `
Command attempted: ${npxCommand}
Error details: ${err.toString()}
NPX path exists: ${fs.existsSync(npxCommand)}
NODE_PATH: ${process.env.NODE_PATH || 'Not set'}
`);
        
        process.exit(1);
    });
}