import Utility from './Utility';

!(function () {
  let UtilityClass = new Utility();
  UtilityClass._addPolyfills();
})();

function A11yMegaMenu(megaMenuContainer, options) {
  this.menuBox = null;
  this.keys = {
    tab: 9,
    enter: 13,
    esc: 27,
    space: 32,
    left: 37,
    up: 38,
    right: 39,
    down: 40
  };

  // Apply settings from Configuration object

  // Register Utility class
  this.Utility = new Utility();

  // Register callback methods

  // Initialize menu  
}

// Create Slider inside container
A11yMegaMenu.prototype.createMegaMenu = function () {
  let context = this
}

// Initialize slider
A11yMegaMenu.prototype.init = function () {
  let context = this;
};

A11yMegaMenu.prototype.eventHandlers = function () {
  let context = this;
};

export default A11yMegaMenu;
