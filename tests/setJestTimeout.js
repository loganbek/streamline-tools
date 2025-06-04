/**
 * This file sets Jest test timeouts programmatically.
 */

// Default timeout (1 minute)
const DEFAULT_TIMEOUT = 60000;

// Check for environment variable override
const envTimeout = process.env.TEST_TIMEOUT ? parseInt(process.env.TEST_TIMEOUT, 10) : DEFAULT_TIMEOUT;

// Set timeout for all tests
jest.setTimeout(envTimeout);

// Log timeout setting when in debug mode
if (process.env.DEBUG_TESTS === 'true') {
  console.log(`Jest test timeout set to ${envTimeout}ms`);
}