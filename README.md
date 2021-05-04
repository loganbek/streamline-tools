# Streamline Tools for Oracle CPQ Cloud 

![streamlinecpqlogo](SLCPQ_LOGO_SITE.png)

[![Pull Requests Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](https://github.com/loganbek/streamlineTools/pulls)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/loganbek/streamlineTools/graphs/commit-activity)

## Prerequisites

- [Google Chrome](https://www.google.com/chrome/)
- [Visual Studio Code](https://code.visualstudio.com/Download)

## Installation Instructions

### Unpacked folder using Chrome Developer Mode

1) Download the latest version of Streamline Tools [here](https://github.com/loganbek/streamlineTools/releases).

2) Extract the files into their own directory.

    <!-- 3) Navigate to `chrome://extensions/` in your browser's address bar. -->

3) Click the Chrome menu icon and select Extensions from the More Tools menu.

4) Enable Developer Mode in the upper right-hand corner.

5) Press the "Load unpacked" button.

6) Select the folder with the extracted files.

7) Open your local "Downloads" folder in Visual Studio Code.

    <!-- `code -a ~/Downloads/bigmachines` -->

8) Install the latest version of "CPQ DevKit" Extension for VSCode found [here](https://marketplace.visualstudio.com/items?itemName=CPQConsultant.cpq-devkit-o) or by running `code --install-extension CPQConsultant.cpq-devkit-o` on the command line.

9) Congratulations you've successfully installed Streamline Tools!

<!-- 9) Enable the Native File System API via [chrome://flags#native-file-system-api](chrome://flags#native-file-system-api) flag. TODO: may be able to remove this -->

<!-- ### Windows Installation -->

<!-- - Ensure you have downloaded and installed git [here](https://git-scm.com/download/win) -->

### Chrome Webstore

Coming soon...

<!-- - You can add the latest version of Streamline Tools [here](placeholder). -->

<!-- ## Tips, Tricks, & Shortcuts -->

## Troubleshooting Steps

1) Hard Refresh/Clear Cache
    - `Ctrl + Shift + R` (Windows)
    - `Cmd + Shift + R` (Mac)

2) Remove the extension and then reinstall it after filing a bug report [here](https://github.com/loganbek/streamlineTools/issues/new?assignees=loganbek&labels=&template=bug_report.md&title=). Please include any error logs from the console.

## Development Tools

- Run `source .bashrc` and then 

    - Run `lint-concise` to display a concise list of style errors.

    - Run `lint-verbose` to display a detailed list of style errors.

    - Run `lint-fix` to correct most style errors.

<!-- switched to alias in .bashrc -->
<!-- - Run `npx standard | npx standard-summary | npx snazzy` to display a concise list of style errors.

- Run `npx standard --verbose | npx snazzy` to display a detailed list of style errors.

- Run `npx standard --fix` to correct most style errors. -->

<!-- maybe add to npm test script in package.json so we run on `npm test` instead. Also look into pre-commit hook https://standardjs.com/#is-there-a-git-pre-commit-hook -->

<!-- `npx standard | standard-summary` - https://www.npmjs.com/package/standard-summary -->

<!-- ## Known & Reported Issues

- [ ] N/A :innocent: -->