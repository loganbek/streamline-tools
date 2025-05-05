#!/usr/bin/env node

/**
 * Safe test runner script with global timeout
 * This script runs Jest tests with a global timeout to prevent indefinite test runs
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const GLOBAL_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes global timeout
const LOG_FILE = path.join(__dirname, 'test-output.log');

// Parse command line arguments
const args = process.argv.slice(2);
let testPattern = 'tests/puppeteer';
let runInBand = true;
let verbose = false;

// Process args
args.forEach(arg => {
  if (arg.startsWith('--pattern=')) {
    testPattern = arg.split('=')[1];
  }
  else if (arg === '--no-runInBand') {
    runInBand = false;
  }
  else if (arg === '--verbose') {
    verbose = true;
  }
});

// Prepare Jest command
const jestArgs = [
  'jest',
  testPattern
];

// Add run in band for sequential execution (recommended for puppeteer tests)
if (runInBand) {
  jestArgs.push('--runInBand');
}

if (verbose) {
  jestArgs.push('--verbose');
}

console.log(`Starting tests with pattern: ${testPattern}`);
console.log(`Global timeout: ${GLOBAL_TIMEOUT_MS / 1000 / 60} minutes`);

// Create log stream
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
logStream.write(`\n\n--- TEST RUN STARTED AT ${new Date().toISOString()} ---\n\n`);

// Start Jest process
const testProcess = spawn('npx', jestArgs, { 
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true 
});

// Set up global timeout
const globalTimeout = setTimeout(() => {
  console.error('\n\n🚨 GLOBAL TIMEOUT REACHED! Tests have been running too long. Killing process...\n');
  logStream.write('\n\n🚨 GLOBAL TIMEOUT REACHED! Tests have been running too long. Killing process...\n');
  
  // Take screenshot if possible
  try {
    const screenshotCommand = spawn('node', [
      path.join(__dirname, 'take-emergency-screenshot.js')
    ]);
    
    screenshotCommand.on('error', (err) => {
      console.error('Failed to take emergency screenshot:', err);
    });
  } catch (err) {
    console.error('Failed to take emergency screenshot:', err);
  }
  
  // Force kill the test process and exit
  try {
    testProcess.kill('SIGKILL');
  } catch (err) {
    console.error('Error killing test process:', err);
  }
  
  process.exit(1);
}, GLOBAL_TIMEOUT_MS);

// Ensure the timeout doesn't keep the process alive
globalTimeout.unref();

// Pipe output to console and log file
testProcess.stdout.pipe(process.stdout);
testProcess.stderr.pipe(process.stderr);
testProcess.stdout.pipe(logStream);
testProcess.stderr.pipe(logStream);

// Handle process exit
testProcess.on('exit', (code) => {
  clearTimeout(globalTimeout);
  console.log(`\nTests finished with code: ${code}`);
  logStream.write(`\n--- TEST RUN FINISHED AT ${new Date().toISOString()} WITH CODE ${code} ---\n`);
  logStream.end();
  
  process.exit(code);
});

// Handle process errors
testProcess.on('error', (err) => {
  clearTimeout(globalTimeout);
  console.error(`\nError running tests: ${err.message}`);
  logStream.write(`\nError running tests: ${err.message}\n`);
  logStream.end();
  
  process.exit(1);
});