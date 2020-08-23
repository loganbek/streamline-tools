# Resource Gathering

## Chrome Extension

<https://www.youtube.com/watch?time_continue=2&v=bmxr75CV36A&feature=emb_logo>

<https://developer.chrome.com/extensions/getstarted>

<https://developer.chrome.com/extensions/api_index>

<https://developer.chrome.com/extensions/overview>

<https://developer.chrome.com/extensions/declarativeContent>

<https://developer.chrome.com/extensions/content_scripts>

asynch js call to local file system - <https://web.dev/native-file-system/>

<https://developer.chrome.com/apps/fileSystem>

<https://developer.chrome.com/apps/app_codelab_filesystem>

<https://github.com/loganbek/text-editor>

You are going to need to write a Chrome extension that exposes an API to your website. This is the easy part. You inject a content script to your website, and then use `chrome.extension.sendMessage` to communicate back to your extension.

The hard part is to actually open the bat file from your extension. With NPAPI, this would have been easy, since you could just write a C++ plugin that calls CreateProcess or something. Contrary to what you said, it's a pretty good solution. But unfortunately, NPAPI isn't an option, since it's being deprecated.

So what you should do is to use Native Messaging. Basically, it's a Chrome API that allows extensions to exchange messages with native applications using standard input and output streams.

Read more about it here: <https://developer.chrome.com/extensions/messaging#native-messaging-host>

Content scripts are less trustworthy than the extension background page (e.g., a malicious web page might be able to compromise the renderer process where the content scripts run). Assume that messages from a content script might have been crafted by an attacker and make sure to validate and sanitize all input.

```javascript

chrome.tabs.sendMessage(tab.id, {greeting: "hello"}, function(response) {
  // JSON.parse does not evaluate the attacker's scripts.
  var resp = JSON.parse(response.farewell);
});

chrome.tabs.sendMessage(tab.id, {greeting: "hello"}, function(response) {
  // innerText does not let the attacker inject HTML elements.
  document.getElementById("resp").innerText = response.farewell;
});

```

### Extension Logic

- [x] manifest.json
- [ ] background.js
- [ ] contentscript.js

### UI

- [x] popup.html
- [ ] popup.js
- [x] options.html
- [ ] options.js

### Color Scheme

- [ ] #80CFE2 - lightest blue
- [ ] #00A0C6 - lighter blue
- [ ] #0C5FA8 - light blue
- [ ] #60017C - purple
- [ ] #AC057E - pink
- [ ] #F0037F - hot pink
- [ ] #4F1E72 - purp2

### Github API

<https://developer.github.com/v3/>

### VSCode/Text Editor

<https://code.visualstudio.com/api>

#### VSCode BML Extension

<https://marketplace.visualstudio.com/items?itemName=CPQConsultant.cpq-devkit-o&utm_source=www.vsixhub.com>

### BigMachines

Pricing Function URL - <https://devmcnichols.bigmachines.com/spring/bmllibrary?format=jsp&view=bmllibraryeditor&pageParams={id:%274658213%27,folder_id:%27-1%27,process_id:%274653759%27,doc_id:%274653823%27}&inputdata={appid:%27sampleApp%27,service:%27bmllibraryservice%27,operation:%27getLibPageData%27,version:%271.0%27,header:%27%27,params:%20{componentid:%27libraryEditorPage%27,uicmd:%27defineComponent%27,%20id:%274658213%27,folder_id:%27-1%27,process_id:%274653759%27,doc_id:%274653823%27}}&token=pyrJ5oRVa-f9q9NpJ4L8q8rI3_U>

### JS util libs - TBD

jQuery?
maybe FE lib
