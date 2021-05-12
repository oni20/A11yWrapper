import Utility from './Utility';

!(function () {
  let UtilityClass = new Utility();
  UtilityClass._addPolyfills();
})();

function A11yMenu(navContainer, options) {
  this.menuBox = null;
  this.mobileToggleNavBtn = null;
  this.keys = Object.freeze({
    tab: 9,
    enter: 13,
    esc: 27,
    space: 32,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    end: 35,
    home: 36,
  });
  this.menuItemLinks = null;
  this.subMenuItemLinks = null;
  this.menuBarItemFirstCharacters = [];
  this.subMenuItemFirstCharacters = [];

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

// Create Sub menu
A11yMenu.prototype.createSubMenu = function (subMenuArr, parentIndex) {
  let context = this, subMenu = '<ul role="menu">';

  subMenuArr.map((item, index) => {
    let nestedSubMenu = '';

    if (item.subMenu) {
      nestedSubMenu = context.createSubMenu(item.subMenu, index);
    }
  
    let listItemClass = nestedSubMenu !== "" ? 'class="has-nestedmenu"' : '',
      ariaAttrib = nestedSubMenu !== "" ? 'aria-expanded="false" aria-haspopup="true"' : '';

    subMenu += `<li ${listItemClass}>
                  <a role="menuitem" href="${item.link}" ${ariaAttrib} data-parentmenuindex=${parentIndex} data-submenuindex=${index}>${item.name}</a>
                  ${nestedSubMenu}
                </li>`;
  });
  subMenu += '</ul>';

  return subMenu;
}

// Create Slider inside container
A11yMenu.prototype.createMenu = function () {
  let context = this,
    brandLogo = context.brandLogo ? `<a class="brand-logo" href="${context.brandLogo.link}">${context.brandLogo.content}</a>` : '',
    buildMenu = `<ul role="menubar" aria-label="${context.mainMenuLabelSRText}" id="menu_${context.menuID}">`;

  context.menuList.map((menu, idx) => {
    let subMenu = ''

    if (menu.subMenu) {
      subMenu = context.createSubMenu(menu.subMenu, idx);
    }

    // Generate menu bar item first Character array
    context.menuBarItemFirstCharacters.push(menu.name.substring(0, 1));

    buildMenu += subMenu === ''
      ? `<li><a role="menuitem" href="${menu.link}" data-menuindex=${idx}>${menu.name}</a></li>`
      : `<li class="has-submenu">
          <a role="menuitem" href="${menu.link}" data-menuindex=${idx} aria-expanded="false" aria-haspopup="true">${menu.name}</a>
          ${subMenu}
        </li>`;
  });

  buildMenu += '</ul>';

  let template =
    `<nav role="presentation" aria-label="${context.mainMenuLabelSRText}" class="fly-out-menu">
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
  context.menuItemLinks = Array.from(document.querySelectorAll(`#menu_${context.menuID} >li>a`));
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

// Jump to Main menu item
A11yMenu.prototype.gotoIndex = function (idx) {
  let context = this;

  if (idx == context.menuItemLinks.length) {
    idx = 0;
  } else if (idx < 0) {
    idx = context.menuItemLinks.length - 1;
  }
  context.menuItemLinks[idx].focus();
};

// Jump to sub menu item
A11yMenu.prototype.gotoSubIndex = function (menu, idx) {
  if (idx == menu.length) {
    idx = 0;
  } else if (idx < 0) {
    idx = menu.length - 1;
  }
  menu[idx].focus();
};

// Hide sub menu
A11yMenu.prototype.hideSubMenu = function (element) {
  let context = this;

  if (context.Utility._hasClass(element.parentNode, 'has-submenu')) {
    element.parentNode.className = "has-submenu";
    element.setAttribute('aria-expanded', "false");
  }
};

// Check if pressed character is printable
A11yMenu.prototype.isPrintableCharacter = function (str) {
  return str.length === 1 && str.match(/\S/);
};

// Get first character matched index
A11yMenu.prototype.getIndexFirstChars = function (startIndex, char, firstCharacterArr) {
  for (let i = startIndex; i < firstCharacterArr.length; i++) {
    if (char.toUpperCase() === firstCharacterArr[i].toUpperCase()) {
      return i;
    }
  }
  return -1;
};

// Set focus to menu item based on character typed
A11yMenu.prototype.setFocusByFirstCharacter = function (elem, char, menuList, isMainMenu) {
  let context = this, start, index,
    firstCharacterArr = isMainMenu ? context.menuBarItemFirstCharacters : context.subMenuItemFirstCharacters;

  start = menuList.indexOf(elem) + 1;
  
  if (start === menuList.length) {
    start = 0;
  }

  index = context.getIndexFirstChars(start, char, firstCharacterArr);

  // If match not found then check from the beginning
  if (index === -1) {
    index = context.getIndexFirstChars(0, char, firstCharacterArr);
  }

  // If match found then jump to the menu item
  if (index > -1) {
    if (isMainMenu) {
      context.gotoIndex(index);
    } else {
      context.gotoSubIndex(menuList, index)
    }
  }
};

// Handle menu item click event
A11yMenu.prototype.handleClickEvent = function (isMainMenu, elem, className, event) {
  let context = this,
    subMenuLinks = elem.nextElementSibling ? elem.nextElementSibling.querySelectorAll('a') : null,
    openedMenuList = elem.closest('ul').querySelectorAll('.open');
    //elem.closest('nav').querySelectorAll('.open');

  // Close all the menus at first except the current one
  /* if (isMainMenu && openedMenuList) {
    for (let i = 0; i < openedMenuList.length; i++) {
      if (elem.parentNode !== openedMenuList[i]) {
        openedMenuList[i].classList.remove('open');
      }
    }
  } */

  if (openedMenuList) {
    for (let i = 0; i < openedMenuList.length; i++) {
      if (elem.parentNode !== openedMenuList[i]) {
        openedMenuList[i].classList.remove('open');
      }
    }
  }

  if (context.Utility._hasClass(elem.parentNode, className)) {
    let isSubMenuOpened = context.Utility._hasClass(elem.parentNode, 'open');
    elem.parentNode.className = isSubMenuOpened ? className : `${className} open`;
    elem.setAttribute('aria-expanded', isSubMenuOpened ? "false" : "true");
  }

  if (subMenuLinks) {
    context.gotoSubIndex(subMenuLinks, 0);
    event.preventDefault();
  }
};

// List of all event handlers
A11yMenu.prototype.eventHandlers = function () {
  let context = this;

  // Toggle button for mobile view
  context.mobileToggleNavBtn.addEventListener('click', (event) => {
    let toggleBtn = event.currentTarget,
      menuHeight = context.menuBox.getBoundingClientRect().height;

    if (context.Utility._hasClass(toggleBtn, 'change')) {
      toggleBtn.classList.remove('change');
      context.menuBox.closest('nav').style.removeProperty('max-height');
    } else {
      toggleBtn.classList.add('change');
      context.menuBox.closest('nav').style.maxHeight = '200em';
      //`${(menuHeight/16) + 4.0625}em`;
    }
  });

  // Main menu item event handle
  Array.prototype.forEach.call(context.menuItemLinks, function (menuLink, i) {
    // Main menu link click event
    menuLink.addEventListener("click", function (event) {
      context.handleClickEvent(true, this, 'has-submenu', event);
      return false;
    });

    // Main menu link keypress event
    menuLink.addEventListener("keydown", function (event) {
      let prevdef = false, subMenuLinks = [];

      if (this.nextElementSibling) {
        for (let i = 0; i < this.nextElementSibling.children.length; i++) {
          subMenuLinks.push(this.nextElementSibling.children[i].children[0]);
        }
      } else {
        subMenuLinks = null
      }

      switch (event.keyCode) {
        case context.keys.right:
          context.gotoIndex(parseInt(this.dataset.menuindex) + 1);
          prevdef = true;
          break;

        case context.keys.left:
          context.gotoIndex(parseInt(this.dataset.menuindex) - 1);
          prevdef = true;
          break;

        case context.keys.home:
          context.gotoIndex(0);
          prevdef = true;
          break;

        case context.keys.end:
          context.gotoIndex(context.menuItemLinks.length - 1);
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

        default:
          if (context.isPrintableCharacter(event.key)) {
            context.setFocusByFirstCharacter(this, event.key, context.menuItemLinks, true);
          }
          break;
      }

      if (prevdef) {
        event.preventDefault();
      }
    });
  });

  // Sub menu item event handle
  Array.prototype.forEach.call(context.subMenuItemLinks, function (subMenuLink, i) {

    subMenuLink.addEventListener("click", function (event) {
      context.handleClickEvent(false, this, 'has-nestedmenu', event);
      return false;
    });

    // Sub menu link keypress event
    subMenuLink.addEventListener("keydown", function (event) {
      let prevdef = true, siblings = [];
      
      // Empty the list first before pusing new siblings first character
      context.subMenuItemFirstCharacters = [];

      for (let i = 0; i < this.closest('ul').children.length; i++) {
        let subMenuAnchor = this.closest('ul').children[i].children[0];
        siblings.push(subMenuAnchor);
        context.subMenuItemFirstCharacters.push(subMenuAnchor.text.substring(0, 1));
      }

      switch (event.keyCode) {
        case context.keys.enter:
        case context.keys.space:
          this.click();
          prevdef = true;
          break;

        case context.keys.right:
          if (context.Utility._hasClass(this.parentElement, 'has-nestedmenu')) {
            this.click();
            prevdef = true;

          } else {
            let parentMenuAnchor = this.closest('li.has-submenu').querySelector('a'),
              nextMenuIndex = parseInt(parentMenuAnchor.dataset.menuindex) + 1;

            context.gotoIndex(nextMenuIndex);
            context.hideSubMenu(parentMenuAnchor);
            context.menuItemLinks[nextMenuIndex].click();
          }
          break;

        case context.keys.left:
          let parentSubMenuItem = this.closest('ul').closest('li.has-nestedmenu');

          if (parentSubMenuItem) {
            parentSubMenuItem.querySelector('a').click();
            parentSubMenuItem.querySelector('a').focus();
            prevdef = true;

          } else {
            let parentMenuAnchor = this.closest('li.has-submenu').querySelector('a'),
              prevMenuIndex = parseInt(parentMenuAnchor.dataset.menuindex) - 1;

            // Move to item if no menu found at the left  
            if (prevMenuIndex < 0) {
              prevMenuIndex = context.menuItemLinks.length - 1;
            }
            context.gotoIndex(prevMenuIndex);
            context.hideSubMenu(parentMenuAnchor);
            context.menuItemLinks[prevMenuIndex].click();
          }

          break;

        case context.keys.tab:
          if (event.shiftKey) {
            if (this.closest('li').previousElementSibling) {
              this.closest('li').previousElementSibling.querySelector('a').focus();
            } else {
              if (this.closest('li.has-nestedmenu')) {
                let parentAnchorElement = this.closest('li.has-nestedmenu').querySelector('a');
                parentAnchorElement.click();
                parentAnchorElement.focus();
              } else {
                let parentAnchorElement = this.closest('li.has-submenu').querySelector('a');
                context.gotoIndex(parseInt(parentAnchorElement.dataset.menuindex) - 1);
                context.hideSubMenu(parentAnchorElement);
              }
            }
          } else {
            if (this.closest('li').nextElementSibling) {
              this.closest('li').nextElementSibling.querySelector('a').focus();
            } else {
              let parentAnchorElement = this.closest('li.has-submenu').querySelector('a');
              context.gotoIndex(parseInt(parentAnchorElement.dataset.menuindex) + 1);
              context.hideSubMenu(parentAnchorElement);
            }
          }

          break;

        case context.keys.down:
          context.gotoSubIndex(siblings, parseInt(this.dataset.submenuindex) + 1);
          break;

        case context.keys.up:
          context.gotoSubIndex(siblings, parseInt(this.dataset.submenuindex) - 1);
          break;

        case context.keys.home:
          context.gotoSubIndex(siblings, 0);
          break;

        case context.keys.end:
          context.gotoSubIndex(siblings, siblings.length - 1);
          break;

        case context.keys.esc:
          let parentAnchor = this.closest('ul').closest('li').querySelector('a');
          parentAnchor.click();
          parentAnchor.focus();
          prevdef = true;
          break;

        default:
          if (context.isPrintableCharacter(event.key)) {
            context.setFocusByFirstCharacter(this, event.key, siblings, false);
          }
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
