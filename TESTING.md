# Testing Guide for Streamline Tools

This document outlines the testing approach used in the Streamline Tools Chrome extension.

## Test Structure

Tests are organized in a directory structure mirroring the source:
- `tests/` - Main test directory
  - `unit/` - Unit tests
    - `content/` - Tests for content scripts
    - `popup/` - Tests for popup scripts
    - `injected/` - Tests for injected scripts
  - `__mocks__/` - Mock implementations

## Running Tests

To run all tests:
```bash
npm test
```

To run tests with coverage:
```bash
npm run test:coverage
```

To run tests in watch mode (automatically re-runs when files change):
```bash
npm run test:watch
```

## Writing Tests

### Unit Tests

Unit tests should be placed in the appropriate subdirectory of `tests/unit/`. 
Each test file should follow the naming convention `*.test.js`.

Example:
```javascript
describe('Feature', () => {
  test('should do something', () => {
    expect(something).toBe(true);
  });
});
```

### Mocking Chrome API

Chrome API calls should be mocked using Jest mock functions. The basic mocks are 
already set up in `tests/setup.js`, but you may need to add specific 
implementations for your tests.

Example:
```javascript
chrome.storage.sync.get.mockImplementation((key, callback) => {
  callback({ myKey: 'myValue' });
});
```
