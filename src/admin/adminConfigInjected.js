/**
 * Streamline Tools - Admin Config Injected Script
 *
 * This script is injected into Oracle CPQ Cloud admin configuration pages
 * to handle BML code operations directly in the page context.
 *
 * @version 1.0.0
 * @license Unlicense
 */

import { setupCommonEventListeners } from './adminSharedUtils';

const ADMIN_CONFIG_INJECT_DEBUG = true;

// Helper function to create HTML elements
function htmlToElement(html) {
  const template = document.createElement('template');
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}

setupCommonEventListeners({
  debug: ADMIN_CONFIG_INJECT_DEBUG,
  debugPrefix: 'ADMIN_CONFIG_INJECT_DEBUG',
  iframeIndex: 1, // Config pages use a different iframe index
  onAfterLoad: () => {
    // Handle config-specific post-load tasks
    const loadingDiv = htmlToElement(
      '<div id="configModalLoad" class="ext-el-mask" style="display: block;">' +
      '<div id="configModalLoadMsg" class="ext-el-mask-msg" style="display: block; left: 655px; top: 626px;">' +
      '<div>Loading...</div></div></div>'
    );

    const bodyElement = document.getElementsByTagName('body')[0];
    const modalWindow = bodyElement?.getElementsByClassName('x-window x-component x-window-maximized')[0];
    
    if (modalWindow && !modalWindow.querySelector('#configModalLoad')) {
      modalWindow.appendChild(loadingDiv);
    }
  }
});
