/**
 * Streamline Tools - Admin Commerce Actions Injected Script
 *
 * This script is injected into Oracle CPQ Cloud admin commerce actions pages
 * to handle BML code operations directly in the page context.
 *
 * @version 1.0.0
 * @license Unlicense
 */

import { setupCommonEventListeners } from './adminSharedUtils';

const ADMIN_COMMERCE_ACTIONS_INJECT_DEBUG = true;

setupCommonEventListeners({
  debug: ADMIN_COMMERCE_ACTIONS_INJECT_DEBUG,
  debugPrefix: 'ADMIN_COMMERCE_ACTIONS_INJECT_DEBUG',
  iframeIndex: 0,
  onAfterLoad: () => {
    document.getElementById('check')?.click();
  }
});

module.exports = {
  ADMIN_COMMERCE_ACTIONS_INJECT_DEBUG
};