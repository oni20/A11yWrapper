import Utility from './Utility';

!(function () {
  let w = window,
    d = w.document;

  if (w.onfocusin === undefined) {
    d.addEventListener("focus", addPolyfill, true);
    d.addEventListener("blur", addPolyfill, true);
    d.addEventListener("focusin", removePolyfill, true);
    d.addEventListener("focusout", removePolyfill, true);
  }
  function addPolyfill(e) {
    let type = e.type === "focus" ? "focusin" : "focusout";
    let event = new CustomEvent(type, { bubbles: true, cancelable: false });
    event.c1Generated = true;
    e.target.dispatchEvent(event);
  }
  function removePolyfill(e) {
    if (!e.c1Generated) {
      // focus after focusin, so chrome will the first time trigger tow times focusin
      d.removeEventListener("focus", addPolyfill, true);
      d.removeEventListener("blur", addPolyfill, true);
      d.removeEventListener("focusin", removePolyfill, true);
      d.removeEventListener("focusout", removePolyfill, true);
    }
    setTimeout(function () {
      d.removeEventListener("focusin", removePolyfill, true);
      d.removeEventListener("focusout", removePolyfill, true);
    });
  }
})();

function A11yMenu(container, options) {
  this.container = container;
  
  // Apply settings from Configuration object
  
  // Register Utility class
  
  // Register callback methods
  
  this.init();
  this.eventHandlers();
}

// Create Slider inside container
A11yMenu.prototype.createMenu = function () {
  let context = this,
    template =
      `<div class="aria-widget-slider">
        <div id="labelID_${context.rollNo}" class="label">${context.label}</div>
        <div class="rail">
          <div id="slider_thumb_${context.rollNo}"
              role="slider" 
              tabindex="0" 
              class="thumb" 
              aria-valuemin="${context.valueMin}" 
              aria-valuenow="${context.valueNow}" 
              aria-valuemax="${context.valueMax}" 
              aria-labelledby="labelID_${context.rollNo}"></div>
        </div>                        
      </div>`;

  context.container.innerHTML = template;

  let domNode = document.querySelector(`#slider_thumb_${context.rollNo}`);
  context.domNode = domNode
  context.railDomNode = domNode.parentNode;
}

// Initialize slider
A11yMenu.prototype.init = function () {
  let context = this;
  
};

A11yMenu.prototype.eventHandlers = function () {
  let context = this;
};

export default A11yMenu;
