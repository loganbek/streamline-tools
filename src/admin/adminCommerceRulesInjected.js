/**
 * Streamline Tools - Admin Commerce Rules Injected Script
 *
 * This script is injected into Oracle CPQ Cloud admin commerce rules pages to
 * handle BML code operations including loading, unloading, and validation.
 *
 * @version 1.0.0
 * @license Unlicense
 */

import { setupCommonEventListeners } from './adminSharedUtils';

const ADMIN_COMMERCE_RULES_INJECT_DEBUG = true;

setupCommonEventListeners({
  debug: ADMIN_COMMERCE_RULES_INJECT_DEBUG,
  debugPrefix: 'ADMIN_COMMERCE_RULES_INJECT_DEBUG',
  iframeIndex: 0,
  onAfterLoad: () => {
    document.getElementById('check')?.click();
  }
});
