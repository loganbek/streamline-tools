# Streamline Tools for Oracle CPQ Cloud

![Streamline Tools](images/SLCPQ_LOGO_SITE.png)

[![Pull Requests Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](https://github.com/loganbek/streamlineTools/pulls)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/loganbek/streamlineTools/graphs/commit-activity)

<!-- ![Available in Chrome Webstore](images/available-in-CWS-md-border.png) -->

## Prerequisites

- [Google Chrome Browser](https://www.google.com/chrome/)
- [Visual Studio Code IDE](https://code.visualstudio.com/Download)

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

9. Congratulations you've successfully installed Streamline Tools!

<!-- ### Windows Installation -->

<!-- - Ensure you have downloaded and installed git [here](https://git-scm.com/download/win) -->

### Chrome Webstore

Coming soon...

<!-- - You can add the latest version of Streamline Tools [here](placeholder). -->

<!-- ## Tips, Tricks, & Shortcuts -->

## Keyboard Shortcuts

### Defaults

- `Cmd/Ctrl + Shift + 1` - Show Streamline Tools

<!-- - `TBD` - Unload BML
- `TBD` - Load BML -->

### Custom

1. To customize Streamline Tools' keyboard shortcuts, navigate to `chrome://extensions/shortcuts`.

2. Scroll to Streamline Tools and for each action choose a combination of keys with either “Ctrl” or “Ctrl + Shift” and any available key. This will automatically work for "Cmd" in place of "Ctrl" on Mac OS.

3. To remove action shortcuts, just click “X” next to the key combination you wish to get rid of.

## Troubleshooting Steps

1. Hard Refresh/Clear Cache

   - `Ctrl + Shift + R` (Windows)
   - `Cmd + Shift + R` (Mac)

2. Remove the extension and then reinstall it after filing a bug report [here](https://github.com/loganbek/streamlineTools/issues/new?assignees=loganbek&labels=&template=bug_report.md&title=). Please include any error logs from the console.

## Development Tools

- Run `source .bashrc` and then
  - Run `lint-concise` to display a concise list of style errors.
  - Run `lint-verbose` to display a detailed list of style errors.
  - Run `lint-fix` to correct most style errors.

## Known & Reported Issues

- [ ] None.
  <!-- <https://github.com/marketplace/actions/auto-issue-list-in-readme> -->

---

## TODO

- [ ] test ext w/o changes
- [ ] popup.js -> index.js
- [ ] comment out CSS
