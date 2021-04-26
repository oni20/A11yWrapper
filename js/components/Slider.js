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

function A11ySlider(container, options, index) {
  this.container = container;
  this.rollNo = index;


  this.valueDomNode = false;
  this.railWidth = 0;
  this.thumbWidth = 17;
  this.thumbHeight = 20;
  this.keyCode = Object.freeze({
    'left': 37,
    'up': 38,
    'right': 39,
    'down': 40,
    'pageUp': 33,
    'pageDown': 34,
    'end': 35,
    'home': 36
  });

  // Apply settings from Configuration object
  this.valueMin = options ? options.min || 0 : 0;
  this.valueMax = options ? options.max || 100 : 100;
  this.valueNow = options ? options.now || 0 : 0;
  this.label = options ? options.label || 'Slider' : 'Slider';
  this.output = options ? options.output || '' : '';

  // Register Utility class
  this.Utility = new Utility();

  // Register callback methods
  this.onSliderChange = options ? options.onSliderChange || function () { return; } : function () { return; };

  this.init();
  this.eventHandlers();
}

// Create Slider inside container
A11ySlider.prototype.createSliderControl = function () {
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
A11ySlider.prototype.init = function () {
  let context = this;

  context.createSliderControl();

  context.railWidth = context.railDomNode.getBoundingClientRect().width

  if (context.output !== '') {
    context.valueDomNode = document.querySelector(context.output);
  }

  if (context.valueDomNode) {
    context.valueDomNode.innerHTML = '0';
    context.valueDomNode.style.left = (context.railDomNode.offsetLeft + context.railWidth + 10) + 'px';
    context.valueDomNode.style.top = (context.railDomNode.offsetTop - 8) + 'px';
  }

  if (context.domNode.tabIndex != 0) {
    context.domNode.tabIndex = 0;
  }

  context.domNode.style.width = context.thumbWidth + 'px';
  context.domNode.style.height = context.thumbHeight + 'px';
  context.domNode.style.top = (context.thumbHeight / -2) + 'px';

  context.moveSliderTo(context.valueNow);

};

A11ySlider.prototype.eventHandlers = function () {
  let context = this;

  context.domNode.addEventListener('keydown', context.handleKeyDown.bind(context));
  // add onmousedown, move, and onmouseup
  context.domNode.addEventListener('mousedown', context.handleMouseDown.bind(context));

  context.domNode.addEventListener('touchstart', context.handleTouchStart.bind(context));

  context.domNode.addEventListener('focus', context.handleFocus.bind(context));
  context.domNode.addEventListener('blur', context.handleBlur.bind(context));

  context.railDomNode.addEventListener('click', context.handleClick.bind(context));
};

A11ySlider.prototype.moveSliderTo = function (value) {
  let context = this;

  value = value > context.valueMax
    ? context.valueMax
    : value < context.valueMin
      ? context.valueMin
      : value;

  context.valueNow = value;

  context.domNode.setAttribute('aria-valuenow', context.valueNow);

  let pos = Math.round(
    (context.valueNow * context.railWidth) / (context.valueMax - context.valueMin)
  ) - (context.thumbWidth / 2);

  context.domNode.style.left = pos + 'px';

  if (context.valueDomNode) {
    context.valueDomNode.innerHTML = context.valueNow.toString();
  }

  // Return Callback function
  context.onSliderChange(context.valueNow)
};

A11ySlider.prototype.handleKeyDown = function (event) {
  let context = this, flag = false;

  switch (event.keyCode) {
    case context.keyCode.left:
    case context.keyCode.down:
      context.moveSliderTo(context.valueNow - 1);
      flag = true;
      break;

    case context.keyCode.right:
    case context.keyCode.up:
      context.moveSliderTo(context.valueNow + 1);
      flag = true;
      break;

    case context.keyCode.pageDown:
      context.moveSliderTo(context.valueNow - 10);
      flag = true;
      break;

    case context.keyCode.pageUp:
      context.moveSliderTo(context.valueNow + 10);
      flag = true;
      break;

    case context.keyCode.home:
      context.moveSliderTo(context.valueMin);
      flag = true;
      break;

    case context.keyCode.end:
      context.moveSliderTo(context.valueMax);
      flag = true;
      break;

    default:
      break;
  }

  if (flag) {
    event.preventDefault();
    event.stopPropagation();
  }
};

A11ySlider.prototype.handleFocus = function (event) {
  let context = this;
  context.domNode.classList.add('focus');
  context.railDomNode.classList.add('focus');
};

A11ySlider.prototype.handleBlur = function (event) {
  let context = this;
  context.domNode.classList.remove('focus');
  context.railDomNode.classList.remove('focus');
};

A11ySlider.prototype.handleMouseDown = function (event) {
  let context = this;

  let handleMouseMove = function (event) {
    context.setSliderPosition(event, 'mouse');
  };

  let handleMouseUp = function (event) {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // bind a mousemove event handler to move pointer
  document.addEventListener('mousemove', handleMouseMove);

  // bind a mouseup event handler to stop tracking mouse movements
  document.addEventListener('mouseup', handleMouseUp);

  event.preventDefault();
  event.stopPropagation();

  // Set focus to the clicked handle
  context.domNode.focus();

};

A11ySlider.prototype.handleTouchStart = function (event) {
  let context = this;

  let handleTouchMove = function (event) {
    context.setSliderPosition(event, 'touch');
  };

  let cancelTouchEvents = function (event) {
    context.domNode.removeEventListener('touchmove', handleTouchMove);
    context.domNode.removeEventListener('touchend', cancelTouchEvents);
  };

  // bind a touchmove event handler to move pointer
  context.domNode.addEventListener('touchmove', handleTouchMove);

  // bind a touchend event handler to stop tracking touch movements
  context.domNode.addEventListener('touchend', cancelTouchEvents);

  event.stopPropagation();

  // Set focus to the clicked handle
  context.domNode.focus();
};

// handleMouseMove has the same functionality as we need for handleMouseClick on the rail
A11ySlider.prototype.handleClick = function (event) {
  this.setSliderPosition(event, 'mouse');
};

A11ySlider.prototype.setSliderPosition = function (event, interactionType) {
  let context = this,
    pageX = interactionType === 'mouse' ? event.pageX : event.touches[0].pageX,
    railWidth = context.railDomNode.getBoundingClientRect().width,
    diffX = pageX - context.railDomNode.getBoundingClientRect().x;

  context.valueNow = parseInt(((context.valueMax - context.valueMin) * diffX) / railWidth);

  context.moveSliderTo(context.valueNow);

  if (interactionType === 'mouse') {
    event.preventDefault();
  }
  event.stopPropagation();

};

export default A11ySlider;
