/**
 * Test runner script for StreamLine Tools CPQ tests
 * This script allows running either sample tests (one per AppArea) or all tests
 */
const { exec } = require('child_process');
const path = require('path');

// Parse command-line arguments
const args = process.argv.slice(2);
const isSampleRun = args.includes('--sample') || args.includes('-s');
const verbose = args.includes('--verbose') || args.includes('-v');
const help = args.includes('--help') || args.includes('-h');

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
  -h, --help     Show this help message

Examples:
  node run-cpq-tests.js --sample   Run one test from each AppArea
  node run-cpq-tests.js --all      Run all tests from rulesList.json
`);
    process.exit(0);
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
==========================================
`);

// Build the Jest command
const jestCommand = [
    'npx', 'jest', 
    testFile,
    '--testTimeout=120000',
    verbose ? '' : '--silent'
].filter(Boolean).join(' ');

// Run the tests
const testProcess = exec(jestCommand);

testProcess.stdout.on('data', (data) => {
    console.log(data);
});

testProcess.stderr.on('data', (data) => {
    console.error(`Error: ${data}`);
});

testProcess.on('exit', (code) => {
    console.log(`
==========================================
Test run complete with exit code: ${code}
==========================================
    `);
});