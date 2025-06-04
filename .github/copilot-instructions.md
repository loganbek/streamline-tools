# Streamline Tools - GitHub Copilot Instructions

This file provides instructions for GitHub Copilot when working with code in this repository.

## Project Context

Streamline Tools is a Chrome extension designed for Oracle CPQ Cloud development. The extension facilitates workflows for CPQ developers by providing tools to manage BML (BigMachines Markup Language), XSL, JSON, XML, and CSS files.

## Code Style & Practices

Follow StandardJS style guide for all JavaScript code.
Include detailed JSDoc comments for public functions explaining parameters, return values, and usage.
Keep code modular and maintainable with clear separation of concerns.
Prioritize backwards compatibility with existing Oracle CPQ Cloud interfaces.
Write defensive code that handles potential errors from the CPQ environment gracefully.
Consider both Chrome and Firefox WebExtension APIs for compatibility.

## Key Technologies

JavaScript (ES6+) with StandardJS style guidelines
Chrome Extension API
Jest for testing
Puppeteer for integration testing
Oracle CPQ Cloud interface integration

## Directory Structure

- src/ - Source code for the extension
  - background/ - Background scripts and service workers
  - content/ - Content scripts for DOM manipulation
  - popup/ - Extension popup UI files
  - options/ - Extension options page
  - rulesList.json - Configuration file for CPQ rules
- tests/ - Testing files
  - unit/ - Unit tests with Jest
  - puppeteer/ - Integration tests with Puppeteer
  - __mocks__/ - Mock implementations for testing
- page-doms/ - DOM captures to aid in verifying extension functionality

## Understanding rulesList.json

The `rulesList.json` file is a central configuration file that determines how Streamline Tools interacts with different areas of Oracle CPQ Cloud. This file is crucial for the extension's functionality and affects multiple aspects of the application:

1. **Application Area Recognition**: 
   - Each rule entry defines a specific CPQ application area (Commerce, Configuration, Document Designer, etc.)
   - Rules use URL patterns to detect which CPQ application the user is currently using
   - Enables context-aware UI and functionality changes depending on the application area

2. **Save Path Management**:
   - Defines the appropriate file paths for saving extracted code from CPQ Cloud
   - Maps CPQ components to local filesystem structure for seamless editing workflows
   - Controls file extension and organization for different code types (BML, XSL, CSS, etc.)

3. **Code and File Selectors**:
   - Contains DOM selectors needed to extract and inject code in the CPQ interface
   - Identifies which UI elements to interact with for each rule type
   - Provides fallback selectors for different CPQ Cloud versions or configurations

4. **Puppeteer Test Integration**:
   - Test scripts use rule definitions to navigate and interact with specific CPQ interfaces
   - Test scenarios are mapped to specific rule types in this file
   - Ensures test coverage across all supported application areas

5. **UI Configuration**:
   - Determines which buttons and actions to display in the extension's popup
   - Controls the visibility and behavior of the UI based on detected application area
   - Provides labeling and tooltips for interface elements

When modifying Streamline Tools, always consider how your changes might impact or be affected by the rule definitions in this file. Adding support for new CPQ features typically requires updating `rulesList.json` with appropriate selectors and configurations.

## Common Tasks

When implementing features for BigMachines interface, reference the rulesList.json file for URL patterns and rule types.
For dynamic popup functionality, check the background.js setDynamicPopup function.
When modifying content scripts, consider execution context and permissions.
Add appropriate tests for new features, including both unit tests and Puppeteer tests for UI interactions.
Use chrome.storage API for persistent extension settings.
Always validate HTML injected into CPQ interface.

## Testing Guidelines

Run tests before committing changes:

- Quick testing: `npm run test:cpq-sample`
- Full testing: `npm run test:cpq-all`
- Unit tests: `npm run test:unit`
Document test cases for complex functionality.
Mock Chrome API for unit tests.

## Best Practices

Avoid relying on specific Oracle CPQ Cloud DOM structures that may change.
Use feature detection rather than version checking when possible.
Cache expensive operations to improve performance.
Handle both synchronous and asynchronous code paths for CPQ operations.
Apply proper error handling and logging for debugging.
Consider accessibility when creating UI elements.
Minimize the extension's permissions to what's strictly necessary.