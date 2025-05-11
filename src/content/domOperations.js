/**
 * Module to handle all DOM operations
 */

const domOperations = {
  createElement(tag) {
    return document.createElement(tag);
  },

  appendChild(parent, child) {
    return parent.appendChild(child);
  },

  getHead() {
    return document.getElementsByTagName("head")[0];
  },

  querySelector(selector) {
    return document.querySelector(selector);
  },

  addEventListener(target, event, handler, options) {
    return target.addEventListener(event, handler, options);
  },

  dispatchEvent(target, event) {
    return target.dispatchEvent(event);
  }
};

module.exports = domOperations;