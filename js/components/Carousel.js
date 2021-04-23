!(function () {
  var w = window,
    d = w.document;

  if (w.onfocusin === undefined) {
    d.addEventListener("focus", addPolyfill, true);
    d.addEventListener("blur", addPolyfill, true);
    d.addEventListener("focusin", removePolyfill, true);
    d.addEventListener("focusout", removePolyfill, true);
  }
  function addPolyfill(e) {
    var type = e.type === "focus" ? "focusin" : "focusout";
    var event = new CustomEvent(type, { bubbles: true, cancelable: false });
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

function A11yCarousel(element, options) {
  this.carousel = element;
  this.settings = options;
  this.slides = null;
  this.index = null;
  this.slidenav = null;
  this.timer = null;
  this.setFocus = null;
  this.animationType = options.animationType === undefined ? "" : options.animationType;
  this.animationTimeSlots = options.animationTimeSlots === undefined ? [3] : options.animationTimeSlots;
  this.animationTime = 0;
  this.animationSuspended = null;

  this.init();
}

A11yCarousel.prototype.forEachElement = function (elements, fn) {
  for (var i = 0; i < elements.length; i++) fn(elements[i], i);
};

A11yCarousel.prototype.removeClass = function (el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(
      new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"),
      " "
    );
  }
};

A11yCarousel.prototype.hasClass = function (el, className) {
  if (el.classList) {
    return el.classList.contains(className);
  } else {
    return new RegExp("(^| )" + className + "( |$)", "gi").test(el.className);
  }
};

A11yCarousel.prototype.init = function () {
  var context = this;

  context.slides = context.carousel.querySelectorAll("li");

  if(context.slides.length > 0){
    if (context.animationType !== "") {
      context.slides.forEach(function (slide) {
        slide.classList.add("animated");
      });
    }
  
    context.carousel.className = "active carousel";
    context.createButtonControls();
  
    if (context.settings.slidenav) {
      context.createSideNavControls();
    }
  
    var liveregion = document.createElement("div");
  
    liveregion.setAttribute("aria-live", "polite");
    liveregion.setAttribute("aria-atomic", "true");
    liveregion.setAttribute("class", "liveregion visuallyhidden");
  
    context.carousel.appendChild(liveregion);
  
    context.slides[0].parentNode.addEventListener(
      "transitionend",
      function (event) {
        var slide = event.target;
        context.removeClass(slide, "in-transition");
  
        if (context.hasClass(slide, "current")) {
          if (context.setFocus) {
            slide.setAttribute("tabindex", "-1");
            slide.focus();
            context.setFocus = false;
          }
        }
      }
    );
  
    context.carousel.addEventListener("mouseenter", function () {
      context.suspendAnimation();
    });
  
    context.carousel.addEventListener("mouseleave", function (event) {
      if (context.animationSuspended) {
        context.toggleAnimation(true);
      }
    });
  
    context.carousel.addEventListener("focusin", function (event) {
      if (!context.hasClass(event.target, "slide")) {
        context.suspendAnimation();
      }
    });
    context.carousel.addEventListener("focusout", function (event) {
      if (
        !context.hasClass(event.target, "slide") &&
        context.animationSuspended
      ) {
        context.toggleAnimation(true);
      }
    });
  
    context.index = 0;
    context.setSlides(context.index);
  
    context.animationTime = context.animationTimeSlots[0] * 1000;
  
    if (context.settings.startAnimated) {
      context.timer = setTimeout(function () {
        context.nextSlide();
      }, context.animationTime);
    }
  }
};

// Create Previos and Next button control
A11yCarousel.prototype.createButtonControls = function () {
  var context = this,
    ctrls = document.createElement("div"),
    controlButtons = context.settings.Buttons.controlButtons,
    prevAriaText = controlButtons.isIcon
      ? '<span class="visuallyhidden">' +
        controlButtons.prev.ariaText +
        "</span>"
      : "",
    nextAriaText = controlButtons.isIcon
      ? '<span class="visuallyhidden">' +
        controlButtons.next.ariaText +
        "</span>"
      : "";

  ctrls.className = "controls";

  ctrls.innerHTML =
    '<button type="button" class="btn-prev"> ' +
    controlButtons.prev.icon +
    prevAriaText +
    "</button>" +
    '<button type="button" class="btn-next">' +
    controlButtons.next.icon +
    nextAriaText +
    "</button>";

  context.carousel.appendChild(ctrls);

  context.carousel
    .querySelector(".btn-prev")
    .addEventListener("click", function () {
      context.prevSlide(true);
    });
  context.carousel
    .querySelector(".btn-next")
    .addEventListener("click", function () {
      context.nextSlide(true);
    });
};

// Create Play/ Pause animation button control
A11yCarousel.prototype.createAnimationControls = function () {
  var context = this,
    animationButtons = context.settings.Buttons.animationButtons,
    controlButtons = context.settings.Buttons.controlButtons,
    animationHTML =
      "<button data-animationbtn='yes' data-mobilesidenavleft='yes'><span class='visuallyhidden'>"+ controlButtons.prev.ariaText +"</span></button>";

  if (context.settings.animate) {
    animationHTML += context.settings.startAnimated
    ? '<button data-animationbtn="yes" data-action="stop"><span class="visuallyhidden">' +
      animationButtons.pause.ariaText +
      " </span>" +
      animationButtons.pause.icon +
      "</button>"
    : '<button data-animationbtn="yes" data-action="start"><span class="visuallyhidden">' +
      animationButtons.play.ariaText +
      " </span>" +
      animationButtons.pause.icon +
      "</button>";
  }

  animationHTML +=
    "<button data-animationbtn='yes' data-mobilesidenavright='yes'><span class='visuallyhidden'>"+ controlButtons.next.ariaText +"</span></button>";
  context.slidenav.innerHTML = animationHTML;
};

// Create Side nav control
A11yCarousel.prototype.createSideNavControls = function () {
  var context = this,
    slideNavButtons = context.settings.Buttons.slideNavButtons;

  context.slidenav = document.createElement("div");
  context.slidenav.className = "slidenav";

  if (context.settings.slidenav) {
    context.createAnimationControls();

    var slideNavControls = context.slidenav.innerHTML;

    context.forEachElement(context.slides, function (el, i) {
      var carouselItemClass = i === 0 ? 'class="current" ' : "",
        activeItemSRText =
          i === 0
            ? ' <span class="visuallyhidden">' +
              slideNavButtons.activeItemSRText +
              "</span>"
            : "",
        buttonInnerHTML =
          "<button " +
          carouselItemClass +
          'data-mobilesidenav="no" data-slide="' +
          i +
          '">' +
          ' <span class="visuallyhidden">' +
          slideNavButtons.itemDescriptionSRText +
          " " +
          (i + 1) +
          "</span> " +
          activeItemSRText +
          "</button>";

      slideNavControls += buttonInnerHTML;
    });

    context.slidenav.innerHTML = slideNavControls;
  }

  var animationClass =
    context.settings.animationType === "" ||
    context.settings.animationType === "rtl"
      ? ""
      : context.settings.animationType;

  context.carousel.className =
    "active " + animationClass + " carousel with-slidenav";
  context.carousel.appendChild(context.slidenav);

  context.carousel
    .querySelector("[data-mobilesidenavleft='yes']")
    .addEventListener("click", function () {
      context.prevSlide(true);
    });
  context.carousel
    .querySelector("[data-mobilesidenavright='yes']")
    .addEventListener("click", function () {
      context.nextSlide(true);
    });

  context.carousel.querySelector("div.slidenav").addEventListener(
    "click",
    function (event) {
      var button = event.target;

      if (button.localName == "button") {
        if (button.getAttribute("data-slide")) {
          context.toggleAnimation(false);
          context.setSlides(button.getAttribute("data-slide"), true);
        } else if (button.getAttribute("data-action") == "stop") {
          context.toggleAnimation(false);
        } else if (button.getAttribute("data-action") == "start") {
          context.toggleAnimation(true);
        }
      }
    },
    true
  );
  context.slidenav = context.carousel.querySelector("ul.slidenav");
};

A11yCarousel.prototype.setSlides = function (
  new_current,
  setFocusHere,
  transition,
  announceItemHere
) {
  var context = this;

  context.setFocus = typeof setFocusHere !== "undefined" ? setFocusHere : false;
  context.announceItem =
    typeof announceItemHere !== "undefined" ? announceItemHere : false;
  transition = typeof transition !== "undefined" ? transition : "none";

  new_current = parseFloat(new_current);

  var length = context.slides.length,
    new_next = new_current + 1,
    new_prev = new_current - 1;

  if (new_next === length) {
    new_next = 0;
  } else if (new_prev < 0) {
    new_prev = length - 1;
  }

  var animationDuration = (context.animationTime/1000) - 1 + "s",
    cssText =
      context.animationType == "fade"
        ? "-webkit-animation-duration: " +
          animationDuration +
          ";animation-duration: " +
          animationDuration +
          ";"
        : "";

  context.slides[context.index].className = "slide current move-out";
  context.slides[
    length - 1 === context.index ? 0 : context.index + 1
  ].className = "slide next";

  for (var i = context.slides.length - 1; i >= 0; i--) {
    context.slides[i].className = "slide";
    context.slides[i].removeAttribute("style");
  }

  context.slides[new_next].className = "slide next" + (transition == "next" ? " in-transition" : "");
  context.slides[new_next].setAttribute("aria-hidden", "true");

  context.slides[new_prev].className = "slide prev" + (transition == "prev" ? " in-transition" : "");
  context.slides[new_prev].setAttribute("aria-hidden", "true");

  context.slides[new_current].className = "slide current";
  context.slides[new_current].style.cssText = cssText;
  context.slides[new_current].removeAttribute("aria-hidden");

  if (context.announceItem) {
    var liveSRText = context.settings.liveSRText
      .replace("%current%", new_current + 1)
      .replace("%total%", context.slides.length);
    context.carousel.querySelector(".liveregion").textContent = liveSRText;
  }

  if (context.settings.slidenav) {
    var buttons = context.carousel.querySelectorAll(
        ".slidenav button[data-slide]"
      ),
      slideNavButtons = context.settings.Buttons.slideNavButtons;

    for (var j = buttons.length - 1; j >= 0; j--) {
      buttons[j].className = "";
      buttons[j].innerHTML =
        '<span class="visuallyhidden">' +
        slideNavButtons.itemDescriptionSRText +
        " " +
        (j + 1);
      ("</span> ");
    }

    buttons[new_current].className = "current";
    buttons[new_current].innerHTML =
      '<span class="visuallyhidden">' +
      slideNavButtons.itemDescriptionSRText +
      " " +
      (new_current + 1) +
      "</span> " +
      ' <span class="visuallyhidden">' +
      slideNavButtons.activeItemSRText +
      "</span>";
  }

  context.index = new_current;
};

A11yCarousel.prototype.nextSlide = function (announceItem) {
  var context = this,
    length = context.slides.length,
    new_current = context.index + 1;

  context.announceItem =
    typeof announceItem !== "undefined" ? announceItem : false;

  if (new_current === length) {
    new_current = 0;
  }

  context.setSlides(new_current, false, "prev", announceItem);

  if (context.settings.animate) {
    var animationTimeIndex = context.animationTimeSlots[new_current] === undefined ? 0 : new_current;
    context.animationTime = context.animationTimeSlots[animationTimeIndex] * 1000;

    context.timer = setTimeout(function () {
      context.nextSlide();
    }, context.animationTime);
  }
};

A11yCarousel.prototype.prevSlide = function (announceItem) {
  var context = this,
    length = context.slides.length,
    new_current = context.index - 1;

  context.announceItem =
    typeof announceItem !== "undefined" ? announceItem : false;

  if (new_current < 0) {
    new_current = length - 1;
  }
  context.setSlides(new_current, false, "next", announceItem);
};

A11yCarousel.prototype.toggleAnimation = function (isStartAnimation) {
  var context = this,
    animationButtons = context.settings.Buttons.animationButtons,
    new_current = context.index + 1;

  context.settings.animate = isStartAnimation;
  context.animationSuspended = false;

  if (new_current === context.slides.length) {
    new_current = 0;
  }

  if (isStartAnimation) {
    var animationTimeIndex = context.animationTimeSlots[new_current] === undefined ? 0 : new_current;
    context.animationTime = context.animationTimeSlots[animationTimeIndex] * 1000;

    context.timer = setTimeout(function () {
      context.nextSlide();
    }, context.animationTime);
  } else {
    clearTimeout(context.timer);
  }

  var control = context.carousel.querySelector("[data-action]");

  if (control !== null) {
    control.innerHTML = isStartAnimation
      ? '<span class="visuallyhidden">' +
        animationButtons.pause.ariaText +
        " </span>" +
        animationButtons.pause.icon
      : '<span class="visuallyhidden">' +
        animationButtons.play.ariaText +
        " </span>" +
        animationButtons.play.icon;

    control.setAttribute("data-action", isStartAnimation ? "stop" : "start");
  }  
};

A11yCarousel.prototype.suspendAnimation = function () {
  var context = this;

  if (context.settings.animate) {
    clearTimeout(context.timer);
    context.settings.animate = false;
    context.animationSuspended = true;
  }
};

export default A11yCarousel;
