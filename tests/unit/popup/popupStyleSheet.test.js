/**
 * Unit tests for popupStyleSheets.js
 */

describe("Popup Style Sheets Script", () => {
  let originalPopupStyleSheets;

  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();

    // Mock DOM elements
    //         <button id="unloadCSS"> Unload CSS<i class="material-icons md-18">keyboard_arrow_right</i><i
    //         class="material-icons md-18">keyboard_arrow_right</i></button>

    // <button id="loadCSS"><i class="material-icons md-18">keyboard_arrow_left</i><i
    //         class="material-icons md-18">keyboard_arrow_left</i> Load CSS</button>

    // <button id="unloadAlternateCSS"> Unload Alternate CSS<i class="material-icons md-18">keyboard_arrow_right</i><i
    //         class="material-icons md-18">keyboard_arrow_right</i></button>

    // <button id="loadAlternateCSS"><i class="material-icons md-18">keyboard_arrow_left</i><i
    //         class="material-icons md-18">keyboard_arrow_left</i> Load Alternate CSS</button>

    // <button id="unloadJETCSS"> Unload JET CSS<i class="material-icons md-18">keyboard_arrow_right</i><i
    //         class="material-icons md-18">keyboard_arrow_right</i></button>

    // <button id="loadJETCSS"><i class="material-icons md-18">keyboard_arrow_left</i><i
    //         class="material-icons md-18">keyboard_arrow_left</i> Load JET CSS</button>

    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === "unloadCSS") {
        return { onclick: null };
      }
      if (id === "loadCSS") {
        return { addEventListener: jest.fn() };
      }
      if (id === "unloadAlternateCSS") {
        return { onclick: null };
      }
      if (id === "loadAlternateCSS") {
        return { addEventListener: jest.fn() };
      }
      if (id === "unloadJETCSS") {
        return { onclick: null };
      }
      if (id === "loadJETCSS") {
        return { addEventListener: jest.fn() };
      }
      return null;
    });

    // Load the popupStyleSheets script module (mock import)
    jest.isolateModules(() => {
      originalPopupStyleSheets = require("../../../src/popup/popupStyleSheets");
    });
  });

  test("should set up button event handlers", () => {
    const loadCSSButton = document.getElementById("loadCSS");
    const loadAlternateCSSButton = document.getElementById("loadAlternateCSS");
    const loadJETCSSButton = document.getElementById("loadJETCSS");

    expect(loadCSSButton.addEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function)
    );
    expect(loadAlternateCSSButton.addEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function)
    );
    expect(loadJETCSSButton.addEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function)
    );

    // The unload buttons use onclick instead of addEventListener
    expect(document.getElementById).toHaveBeenCalledWith("unloadCSS");
    expect(document.getElementById).toHaveBeenCalledWith("unloadAlternateCSS");
    expect(document.getElementById).toHaveBeenCalledWith("unloadJETCSS");
  });
});
