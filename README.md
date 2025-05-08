# Streamline Tools for Oracle CPQ Cloud

![Streamline Tools](streamlinecpq.png)

[![Pull Requests Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](https://github.com/loganbek/streamlineTools/pulls)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/loganbek/streamlineTools/graphs/commit-activity)
[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-908a85?logo=gitpod)](https://gitpod.io/#https://github.com/loganbek/streamline-tools)

A powerful toolkit for streamlining Oracle CPQ Cloud development workflows.

## Features

- Seamless code loading/unloading for BML, XSL, JSON, XML, and CSS files
- Support for Commerce Actions, Rules, and Configuration rules
- Document Designer integration
- Header & Footer management
- Interface (SOAP/REST) handling
- Advanced stylesheet operations with minification and browser compatibility checks
- Test script support
- Built-in validation tools

## Version Support

| Version | Supported          |
| ------------- | ------------------ |
| 0.1.x-alpha   | :white_check_mark: |
| 0.0.x-alpha   | :x:                |

## Prerequisites

### A Supported Browser
<!-- One of the following Browsers -->
<!-- Add Chrome -->
- [Google Chrome Browser](https://www.google.com/chrome/)
<!-- Add FireFox -->
<!-- - [FireFox Browser](https://www.mozilla.org/en-US/firefox/new/) -->
<!-- Add Safari -->
<!-- - [Safari Browser](https://www.apple.com/safari/) -->
<!-- Add Orion -->
<!-- - Orion Browser](https://www.orionjs.io/) -->
<!-- Add Edge -- >
<!-- - [Edge Browser](https://www.microsoft.com/en-us/edge) -->
<!-- Add Brave -->
<!-- - [Brave Browser](https://brave.com/download/) -->

### A Supported IDE
<!-- Visual Studio Code -->
- [Codium](https://vscodium.com/) OR [Visual Studio Code](https://code.visualstudio.com/Download)
<!-- Add Cursor -->
<!-- - [Cursor](https://cursor.sh/) -->

### CPQ Development Tools VS Code Extension

<https://marketplace.visualstudio.com/items?itemName=CPQConsultant.cpq-devkit-overview>

## Installation Instructions

### Unpacked folder using Chrome Developer Mode

1. Download the latest version of Streamline Tools [here](https://github.com/loganbek/streamlineTools/releases).

2. Extract the files into their own directory.

   <!-- 3) Navigate to `chrome://extensions/` in your browser's address bar. -->

3. Click the Chrome menu icon and select Extensions from the More Tools menu.

4. Enable Developer Mode in the upper right-hand corner.

5. Press the "Load unpacked" button.

6. Select the folder with the extracted files.

7. Open your local "Downloads" folder in Visual Studio Code.

   <!-- `code -a ~/Downloads/bigmachines` -->

8. Install the latest version of "CPQ DevKit" Extension for VSCode found [here](https://marketplace.visualstudio.com/items?itemName=CPQConsultant.cpq-devkit-o), or by running:

   `code --install-extension CPQConsultant.cpq-devkit-o`

<!-- or `ext install CPQConsultant.cpq-devkit-o` in VSCode Command Palette. -->

<!-- NOTE look into CPQ Toolkit -->

<!-- https://marketplace.visualstudio.com/items?itemName=CPQConsultant.cpq-devkit-sf -->

9. Congratulations you've successfully installed Streamline Tools!

<!-- 9) Enable the Native File System API via [chrome://flags#native-file-system-api](chrome://flags#native-file-system-api) flag. TODO: may be able to remove this -->

<!-- ### Windows Installation -->

<!-- - Ensure you have downloaded and installed git [here](https://git-scm.com/download/win) -->

### Chrome Webstore

Coming soon...

<!-- - You can add the latest version of Streamline Tools [here](placeholder). -->

## Development

### Setting Up Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/loganbek/streamline-tools.git
   cd streamline-tools
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file with required credentials:
   ```
   CPQ_USERNAME=your_username
   CPQ_PASSWORD=your_password
   BASE_URL=your_cpq_instance_url
   ```

### Code Style

This project follows the [StandardJS](https://standardjs.com/) style guide. To ensure code quality:

1. Use the built-in linting:
   ```bash
   npm run lint
   ```

2. Fix common style issues:
   ```bash
   npm run lint:fix
   ```

## Testing

Before running tests, ensure you have completed the following setup:

1. Create a `.env` file in the `tests` directory with the following variables:
   ```
   CPQ_USERNAME=your_username
   CPQ_PASSWORD=your_password
   BASE_URL=your_cpq_instance_url  # e.g., https://yourinstance.bigmachines.com
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Tests

#### Focused CPQ Testing (Recommended)

We've streamlined the testing approach to focus directly on the 16 rule types defined in `src/rulesList.json`, ensuring comprehensive coverage of all Oracle CPQ Cloud application areas.

- **Quick Testing** - Run one test from each application area:
  ```bash
  npm run test:cpq-sample
  ```

- **Full Testing** - Run all tests for the 16 rule types:
  ```bash
  npm run test:cpq-all
  ```

- **Default Option** - Same as full testing:
  ```bash
  npm run test:cpq
  ```

#### Legacy Test Options

- Run all tests:
  ```bash
  npm test
  ```

- Run specific test suites:
  ```bash
  npm run test:unit        # Run unit tests only
  npm run test:puppeteer   # Run Puppeteer integration tests
  npm run test:config      # Test configuration rules
  npm run test:commerce    # Test commerce rules
  npm run test:interfaces  # Test interfaces
  npm run test:stylesheets # Test stylesheets
  npm run test:documents   # Test document designer
  npm run test:utils       # Test utility functions
  ```

- Run tests in watch mode (useful during development):
  ```bash
  npm run test:watch
  ```

### Test Structure

The test suite is organized as follows:

- `tests/puppeteer/rulesList-master.test.js` - Tests all 16 rule types from rulesList.json
- `tests/puppeteer/rulesList-sample.test.js` - Tests one rule from each app area
- `tests/unit/` - Unit tests for individual components
- `tests/__mocks__/` - Mock implementations for testing

### Managing Test Files

If you need to organize your test files or clean up unnecessary tests, use the provided script:

```bash
# Move unnecessary test files to archive folder
node organize-tests.js

# Preview what files would be moved without actually moving them
node organize-tests.js --dry-run

# Restore archived test files
node organize-tests.js --restore
```

### Debugging Tests

If tests fail, you can:
1. Check the screenshots captured during test execution
2. Review video recordings in the `test-videos/` directory
3. Use the `--verbose` flag for detailed output:
   ```bash
   node run-cpq-tests.js --all --verbose
   ```

## Keyboard Shortcuts

### Defaults

<!-- (TBD) -->

### Optimal Command Hotkeys

- `Cmd/Ctrl + Shift + 1` - Show Streamline Tools UI
- `Cmd/Ctrl+Left` - Unload Code (BML/XSL/JSON/XML/CSS)
- `Cmd/Ctrl+Right` - Load Code (BML/XSL/JSON/XML/CSS)

### Customizing Hotkeys

1. Open `chrome://extensions/shortcuts` in your browser.
2. Locate Streamline Tools and assign custom key combinations for each action.
3. Ensure combinations include "Ctrl" or "Ctrl + Shift" (or "Cmd" on macOS) with any available key.
4. Remove shortcuts by clicking the “X” next to the assigned key combination.

- `Cmd/Ctrl + Shift + 1` - Show Streamline Tools UI
- `Ctrl+Left` - Unload Code (BML/XSL/JSON/XML/CSS)
- `Ctrl+Right` - Load Code (BML/XSL/JSON/XML/CSS)

### Custom

1. To customize Streamline Tools' keyboard shortcuts, navigate to `chrome://extensions/shortcuts`.

2. Scroll to Streamline Tools and for each action choose a combination of keys with either “Ctrl” or “Ctrl + Shift” and any available key. This will automatically work for "Cmd" in place of "Ctrl" on Mac OS.

3. To remove action shortcuts, just click “X” next to the key combination you wish to get rid of.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Make your changes
4. Run tests (npm test)
5. Commit your changes (git commit -m 'Add amazing feature')
6. Push to the branch (git push origin feature/amazing-feature)
7. Open a Pull Request

Please ensure your PR:
- Follows the StandardJS style guide
- Includes appropriate tests
- Updates documentation as needed
- Follows the existing code structure

## Security

For vulnerability reports or security concerns, please email logan@bekconsulting.info

## Troubleshooting

1. Hard Refresh/Clear Cache

   - `Ctrl + Shift + R` (Windows)
   - `Cmd + Shift + R` (Mac)

2. Remove the extension and then reinstall it after filing a bug report [here](https://github.com/loganbek/streamlineTools/issues/new?assignees=loganbek&labels=&template=bug_report.md&title=). Please include any error logs from the console.

## Support Resources

- [CPQ DevKit](https://github.com/CPQConsultant/cpq-devkit): A comprehensive toolkit for CPQ development
- [CPQ Tools](https://github.com/CPQConsultant/cpq-tools): Additional tools for CPQ development
- [CPQ Samples](https://github.com/CPQConsultant/cpq-samples): Sample projects and code snippets

## License

This project is licensed under the Unlicense - see the [UNLICENSE](UNLICENSE) file for details.
