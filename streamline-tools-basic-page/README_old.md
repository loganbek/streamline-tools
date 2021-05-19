# Basic - Popup Page Starter Template

## About This Starter Template

This starter template provides a basic Chrome extension that triggers a popup page. You simply click the extension icon in the top right or press `Ctrl+Shift+O` to toggle the page popup.

## Running The Extension

1. Navigate to `chrome://extensions` in your browser
2. Ensure `Developer mode` is `enabled` (top right)
3. Click `Load unpacked` in the top left
4. Select the folder for this extension template only

After completing the above steps, you should see the developer, unpacked version appear in your extension list as well as the extension icon appear in your browser bar alongside the other extensions you may have installed.

To trigger the extension, simply click the icon or press `Ctrl+Shift+O` and you will see the popup appear.

## Making Changes

To see changes reflected, simply adjust what you need and press the refresh icon in `chrome://extensions`. If you made adjustments to the manifest or changed the name of the folder, you may need to reload the unpacked extension with the above steps.

## Extending The Template

### Styles

There are temporary styles in `css/index.css`. This can be used or you can remove it and add your own entirely. Styles work like they would with any HTML page; you import the stylesheet in `index.html`. You can also add more stylesheets should you need them.

This template comes defaulted with a max width of 300px defined in `css/index.css` on `.content`, however this is arbitrary and can be changed or excluded entirely.

### JS

There is no JS with this particular template, but you can add scripts by creating a `.js` file and importing it into `index.html` like you would with any other JS file regularly.

## Manifest Explained

There are 2 key sections of the manifest with this example template:

### Browser Action

```json
  "browser_action": {
    "default_icon": {
      "32": "images/icon.png"
    },
    "default_popup": "index.html",
    "default_title": "Open Popup"
  },
```

This portion of the manifest is used to define how the browser action (extension icon) should behave. In this case, when clicked it will trigger a default popup displaying the page `index.html`.

### Custom Commands

```json
  "commands": {
    "_execute_browser_action": {
      "suggested_key": {
        "default": "Ctrl+Shift+O",
        "mac": "MacCtrl+Shift+O"
      },
      "description": "Toggle Popup"
    }
  }
```

This portion of the manifest defines custom commands that execute the browser action mentioned above. For example, it defines `Ctrl+Shift+O` as the command that will trigger the browser action and the popup as a result. This can be changed, but keep in mind, commands may conflict with others elsewhere (For example, if you set the command to `Ctrl+S`).

## Preparing to Publish

To prepare this template for publishing, add all the contents of this folder to a `.zip` file, including the `manifest.json`. Keep in mind, with every new publish of the same extension, you will need to bump the manifest `version` number up.

## Need More help?

Check out the FAQs on <https://ChromeExtensionKit.com/> or send an email to `Ryan@ChromeExtensionKit.com` and I will provide assistance as soon as possible.
