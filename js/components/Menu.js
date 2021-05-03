import Utility from './Utility';

!(function () {
  let UtilityClass = new Utility();
  UtilityClass._addPolyfills();
})();

function A11yMenu(navContainer, options) {
  this.menuBox = null;
  this.mobileToggleNavBtn = null;
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
  this.menuItemLinks = null;
  this.subMenuItemLinks = null;

  // Apply settings from Configuration object
  this.menuID = options.id || 'menu_1';
  this.mainMenuLabelSRText = options.mainMenuLabelSRText || 'functions';
  this.navContainer = navContainer;
  this.brandLogo = options.brandLogo || null;
  this.menuList = options.menuList || [];


  // Register Utility class
  this.Utility = new Utility();

  // Register callback methods

  // Initialize menu
  if (this.menuList.length > 0) {
    this.init();
    this.eventHandlers();
  } else {
    alert('Menu list is missing. Check the configuration object');
  }
}

// Create Slider inside container
A11yMenu.prototype.createMenu = function () {
  let context = this,
    brandLogo = context.brandLogo ? `<a class="brand-logo" href="${context.brandLogo.link}">${context.brandLogo.content}</a>` : '',
    buildMenu = `<ul role="menubar" aria-label="${context.mainMenuLabelSRText}" id="menu_${context.menuID}" class="collapse">`;

  context.menuList.map((menu, idx) => {
    let subMenu = ''

    if (menu.subMenu) {
      subMenu += '<ul role="menu">';

      menu.subMenu.map((item, index) => {
        subMenu += `<li role="menuitem"><a href="${item.link}" data-parentmenuindex=${idx} data-submenuindex=${index}>${item.name}</a></li>`;
      });
      subMenu += '</ul>';
    }

    buildMenu += subMenu === ''
      ? `<li role="menuitem"><a href="${menu.link}" data-menuindex=${idx}>${menu.name}</a></li>`
      : `<li class="has-submenu" role="menuitem">
          <a href="${menu.link}" data-menuindex=${idx} aria-expanded="false" aria-haspopup="true">${menu.name}</a>
          ${subMenu}
        </li>`;
  });

  buildMenu += '</ul>';

  let template =
    `<nav role="presentation" aria-label="Main Navigation" class="fly-out-menu">
        ${brandLogo}
        ${buildMenu}        
        <button class="toggle-button" type="button" aria-controls="menu_${context.menuID}" aria-expanded="false"
          aria-label="Toggle navigation">
          <div class="bar1"></div>
          <div class="bar2"></div>
          <div class="bar3"></div>
        </button>
      </nav>`

  context.navContainer.innerHTML = template;
  context.menuItemLinks = document.querySelectorAll(`#menu_${context.menuID} >li>a`);  
  context.subMenuItemLinks = document.querySelectorAll(`#menu_${context.menuID} >li li>a`);
}

// Initialize slider
A11yMenu.prototype.init = function () {
  let context = this;

  // Create Menu UI
  context.createMenu();
  // Create new stuff

  // Assign elements
  context.menuBox = document.querySelector(`#menu_${context.menuID}`);
  context.mobileToggleNavBtn = context.menuBox.parentElement.querySelector('button.toggle-button');
};

A11yMenu.prototype.gotoIndex = function (idx) {
  let context = this;

  if (idx == context.menuItemLinks.length) {
    idx = 0;
  } else if (idx < 0) {
    idx = context.menuItemLinks.length - 1;
  }
  context.menuItemLinks[idx].focus();
};

A11yMenu.prototype.gotoSubIndex = function (menu, idx) {
  if (idx == menu.length) {
    idx = 0;
  } else if (idx < 0) {
    idx = menu.length - 1;
  }
  menu[idx].focus();
};

A11yMenu.prototype.hideSubMenu = function (element) {
  let context = this;

  if (context.Utility._hasClass(element.parentNode, 'has-submenu')) {
    element.parentNode.className = "has-submenu";
    element.setAttribute('aria-expanded', "false");
  }
};

A11yMenu.prototype.eventHandlers = function () {
  let context = this;

  // Toggle button for mobile view
  context.mobileToggleNavBtn.addEventListener('click', (event) => {
    if (context.Utility._hasClass(event.currentTarget, 'change')) {
      event.currentTarget.classList.remove('change');
      context.menuBox.classList.remove('show');
    } else {
      event.currentTarget.classList.add('change');
      context.menuBox.classList.add('show');
    }
  });

  Array.prototype.forEach.call(context.menuItemLinks, function (menuLink, i) {
    // Main menu link click event
    menuLink.addEventListener("click", function (event) {
      let subMenuLinks = this.nextElementSibling ? this.nextElementSibling.querySelectorAll('a') : null;

      if (context.Utility._hasClass(this.parentNode, 'has-submenu')) {
        let isSubMenuOpened = context.Utility._hasClass(this.parentNode, 'open');
        this.parentNode.className = isSubMenuOpened ? "has-submenu" : "has-submenu open";
        this.setAttribute('aria-expanded', isSubMenuOpened ? "false" : "true");        
      }

      if (subMenuLinks) {
        context.gotoSubIndex(subMenuLinks, 0);
      }

      event.preventDefault();
      return false;
    });

    // Main menu link keypress event
    menuLink.addEventListener("keydown", function (event) {
      let prevdef = false,
        subMenuLinks = this.nextElementSibling ? this.nextElementSibling.querySelectorAll('a') : null;

      switch (event.keyCode) {
        case context.keys.right:
          context.gotoIndex(parseInt(this.dataset.menuindex) + 1);
          prevdef = true;
          break;

        case context.keys.left:
          context.gotoIndex(parseInt(this.dataset.menuindex) - 1);
          prevdef = true;
          break;

        case context.keys.enter:
        case context.keys.space:
        case context.keys.down:
          this.click();
          prevdef = true;
          break;

        case context.keys.up:
          if (subMenuLinks) {
            this.click();
            context.gotoSubIndex(subMenuLinks, subMenuLinks.length - 1);
          }
          prevdef = true;
          break;

        case context.keys.esc:          
          this.closest('nav').querySelector('a').focus();
          prevdef = true;
          break;
      }

      if (prevdef) {
        event.preventDefault();
      }
    });
  });

  Array.prototype.forEach.call(context.subMenuItemLinks, function (subMenuLink, i) {

    // Sub menu link keypress event
    subMenuLink.addEventListener("keydown", function (event) {
      let prevdef = true, siblings = this.closest('ul').querySelectorAll('a');

      switch (event.keyCode) {
        case context.keys.right:
          context.gotoIndex(parseInt(this.dataset.parentmenuindex) + 1);
          context.hideSubMenu(this.closest('li.has-submenu').querySelector('a'));
          context.menuItemLinks[parseInt(this.dataset.parentmenuindex) + 1].click();
          break;

        case context.keys.left:
          context.gotoIndex(parseInt(this.dataset.parentmenuindex) - 1);
          context.hideSubMenu(this.closest('li.has-submenu').querySelector('a'));
          context.menuItemLinks[parseInt(this.dataset.parentmenuindex) - 1].click();
          break;

        case context.keys.tab:
          if (event.shiftKey) {
            context.gotoIndex(parseInt(this.dataset.parentmenuindex) - 1);
          } else {
            context.gotoIndex(parseInt(this.dataset.parentmenuindex) + 1);
          }
          context.hideSubMenu(this.closest('li.has-submenu').querySelector('a'));
          break;

        case context.keys.down:
          context.gotoSubIndex(siblings, parseInt(this.dataset.submenuindex) + 1);
          break;

        case context.keys.up:
          context.gotoSubIndex(siblings, parseInt(this.dataset.submenuindex) - 1);
          break;

        case context.keys.esc:
          context.gotoIndex(this.dataset.parentmenuindex);
          context.hideSubMenu(this.closest('li.has-submenu').querySelector('a'));
          prevdef = true;
          break;
      }

      if (prevdef) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  });
};

export default A11yMenu;
