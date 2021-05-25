import Utility from './Utility';

!(function () {
  let UtilityClass = new Utility();
  UtilityClass._addPolyfills();
})();

function A11yMegaMenu(element, options) {
  this.megaMenuContainer = element;
  this.settings = options;
  this.menuList = options.menuList;
  this.keys = {
    ESC: 27,
    TAB: 9,
    RETURN: 13,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    END: 35,
    HOME: 36,
  };

  this.parentMenuList = null;
  this.subMenuList = null;

  if (this.menuList.length > 0) {
    this.init();
    this.eventHandlers();
  } else {
    alert("Settings are missing. Please check configuration object");
  }
}

// Create multi level menu
A11yMegaMenu.prototype.createSubMenuForMultiLevel = function (subMenu) {
  let context = this,
    subMenuMultiLevelTemplate = `<ul role="menu" class="menu menu-list">`;

  subMenu.forEach((item, idx) => {
    let nestedMenu = "";

    if (item.subMenu) {
      nestedMenu += context.createSubMenuForMultiLevel(item.subMenu);
    }

    let shortDesc = item.shortDesc
      ? `<br /><small>${item.shortDesc}</small>`
      : "";

    subMenuMultiLevelTemplate += `
      <li>
        <a data-submenuindex=${idx} href="${item.link
      }" class="menu-link menu-list-link" ${item.subMenu ? `aria-haspopup="true" aria-expanded="false"` : ""
      }>${item.name} ${shortDesc}</a>
        ${nestedMenu}
      </li>`;
  });

  subMenuMultiLevelTemplate += `</ul>`;

  return subMenuMultiLevelTemplate;
};

// Create multi level menu
A11yMegaMenu.prototype.createMultiLevel = function (subMenu) {
  let context = this,
    subMultiMenuTemplate = `<ul role="menu" class="mega-menu mega-menu--multiLevel">`;

  subMenu.forEach((item, idx) => {
    let shortDesc = item.shortDesc
      ? `<br /><small>${item.shortDesc}</small>`
      : "";

    subMultiMenuTemplate += `
    <li>
      <a data-layout="multi" data-submenuindex=${idx} role="menuitem" href="${item.link
      }" class="menu-link mega-menu-link" 
      ${item.subMenu ? `aria-haspopup="true" aria-expanded="false"` : ""}>${item.name
      } ${shortDesc}</a>`;

    if (item.subMenu) {
      subMultiMenuTemplate += context.createSubMenuForMultiLevel(item.subMenu);
    }

    subMultiMenuTemplate += `</li>`;
  });

  subMultiMenuTemplate += `
    <li class="mobile-menu-back-item">
      <a href="javascript:void(0);" class="menu-link mobile-menu-back-link">Back</a>
    </li>
  </ul>`;

  return subMultiMenuTemplate;
};

// Create 3 cols level menu
A11yMegaMenu.prototype.createCols = function (subMenu) {
  let subMenuTemplate = `<ul role="menu" class="mega-menu mega-menu--flat">`;

  subMenu.forEach((item, idx) => {
    let shortDesc = item.shortDesc
      ? `<br /><small>${item.shortDesc}</small>`
      : "";

    if (item.link === "no-link") {
      subMenuTemplate += `<li class="mega-menu-content"><p class="mega-menu-header">${item.name}</p>`;
    } else {
      subMenuTemplate += `<li><a data-layout="col" data-submenuindex=${idx} role="menuitem" href="${item.link}" class="menu-link mega-menu-link mega-menu-header">${item.name} ${shortDesc}</a>`;
    }

    if (item.subMenu) {
      subMenuTemplate += `<ul class="menu menu-list">`;

      item.subMenu.forEach((item, i) => {
        let shortDesc = item.shortDesc
          ? `<br /><small>${item.shortDesc}</small>`
          : "";
        subMenuTemplate += `<li><a data-layout="col" data-submenuindex=${i} href="${item.link}" class="menu-link menu-list-link">${item.name} ${shortDesc}</a></li>`;
      });

      subMenuTemplate += `</ul>`;
    }

    if (item.longDesc) {
      subMenuTemplate += `<p>${item.longDesc}</p>`;
    }

    subMenuTemplate += `</li>`;
  });

  subMenuTemplate += `
    <li class="mobile-menu-back-item">
      <a href="javascript:void(0);" class="menu-link mobile-menu-back-link">Back</a>
    </li>
  </ul>`;

  return subMenuTemplate;
};

// Create multi level menu
A11yMegaMenu.prototype.createMegaMenu = function () {
  let context = this,
    template = `
  <div class="nav">
    <nav id="${context.settings.id}" role="presentation" aria-label="Mega menu">
      <a href="javascript:void(0);" class="mobile-menu-trigger">Open mobile menu</a>
      <ul class="menu menu-bar">`;

  context.menuList.forEach((item, idx) => {
    if (item.type) {
      template += `<li><a data-parentmenuidx=${idx} role="menuitem" href="${item.link}" class="menu-link menu-bar-link" aria-haspopup="true" aria-expanded="false">${item.name}</a>`;

      if (item.type === "multi") {
        template += context.createMultiLevel(item.subMenu);
      } else {
        template += context.createCols(item.subMenu);
      }

      template += `</li>`;
    } else {
      template += `<li><a data-parentmenuidx=${idx} role="menuitem" href="${item.link}" class="menu-link menu-bar-link">${item.name}</a></li>`;
    }
  });

  template += `
            <li class="mobile-menu-header">
						  <a href="/home" class=""><span>Home</span></a>
						</li>
          </ul>
        </nav>
      </div>`;

  context.megaMenuContainer.innerHTML = template;
  context.parentMenuList = document.querySelectorAll(
    `#${context.settings.id}>ul>li>a.menu-link`
  );
  context.subMenuList = document.querySelectorAll(
    `#${context.settings.id}>ul>li li>a.menu-link`
  );
};

// Jump to Main menu item
A11yMegaMenu.prototype.gotToMainMenuItem = function (idx) {
  let context = this;

  if (idx === context.parentMenuList.length) {
    idx = 0;
  } else if (idx < 0) {
    idx = context.parentMenuList.length - 1;
  }
  context.parentMenuList[idx].focus();
};

// Jump to Main menu item
A11yMegaMenu.prototype.gotToSubMenuItem = function (subMenuLinkArr, idx) {
  if (idx === subMenuLinkArr.length) {
    idx = 0;
  } else if (idx < 0) {
    idx = subMenuLinkArr.length - 1;
  }
  subMenuLinkArr[idx].focus();
};

// Initialize method
A11yMegaMenu.prototype.init = function () {
  let context = this;
  context.createMegaMenu();
};

// List of all handlers
A11yMegaMenu.prototype.eventHandlers = function () {
  let context = this;

  // Main menu events
  Array.prototype.forEach.call(context.parentMenuList, (parentMenuItem, i) => {
    // Focus event
    parentMenuItem.addEventListener("focus", function (event) {
      let linkElement = this;

      context.parentMenuList.forEach((link, index) => {
        if (link.hasAttribute("aria-expanded")) {
          link.setAttribute("aria-expanded", link === linkElement);
        }
      });
    });

    // Key press event
    parentMenuItem.addEventListener("keydown", function (event) {
      let subMenuLinks = [];

      if (this.nextElementSibling) {
        Array.prototype.forEach.call(
          this.nextElementSibling.children,
          (link) => {
            if (link.querySelector("a.mega-menu-link")) {
              subMenuLinks.push(link.querySelector("a.mega-menu-link"));
            }
          }
        );
      } else {
        subMenuLinks = null;
      }

      switch (event.keyCode) {
        case context.keys.RIGHT:
          context.gotToMainMenuItem(parseInt(this.dataset.parentmenuidx) + 1);
          break;

        case context.keys.LEFT:
          context.gotToMainMenuItem(parseInt(this.dataset.parentmenuidx) - 1);
          break;

        case context.keys.UP:
          if (subMenuLinks) {
            context.gotToSubMenuItem(subMenuLinks, subMenuLinks.length - 1);
          }
          break;

        case context.keys.DOWN:
          if (subMenuLinks) {
            context.gotToSubMenuItem(subMenuLinks, 0);
          }
          break;

        case context.keys.HOME:
          context.gotToMainMenuItem(0);
          break;

        case context.keys.END:
          context.gotToMainMenuItem(context.parentMenuList.length - 1);
          break;

        default:
          break;
      }
    });
  });

  // Sub menu events
  Array.prototype.forEach.call(context.subMenuList, (subMenuItem, i) => {
    subMenuItem.addEventListener("focus", function (event) {
      let linkElement = this;

      context.subMenuList.forEach((link, index) => {
        if (link.hasAttribute("aria-expanded")) {
          link.setAttribute("aria-expanded", link === linkElement);
        }
      });
    });

    // Key press event
    subMenuItem.addEventListener("keydown", function (event) {
      let siblings = [];

      for (let i = 0; i < this.closest("ul").children.length; i++) {
        let subMenuAnchor = this.closest("ul").children[i].querySelector(
          "a.mega-menu-link, a.menu-list-link"
        );

        if (subMenuAnchor) {
          siblings.push(subMenuAnchor);
        }
      }

      switch (event.keyCode) {
        case context.keys.RIGHT:
          if (this.dataset.layout === "col") {
            context.gotToSubMenuItem(
              siblings,
              parseInt(this.dataset.submenuindex) + 1
            );
          } else {
            if (this.nextElementSibling) {
              this.nextElementSibling.querySelector("a").focus();
            }
          }

          break;

        case context.keys.LEFT:
          if (this.dataset.layout === "col") {
            context.gotToSubMenuItem(
              siblings,
              parseInt(this.dataset.submenuindex) - 1
            );
          } else {
            this.closest("ul").previousElementSibling.focus();
          }
          break;

        case context.keys.UP:
          if (this.dataset.layout === "col" && this.nextElementSibling) {
            this.nextElementSibling.lastElementChild.querySelector("a").focus();
          } else {
            context.gotToSubMenuItem(
              siblings,
              parseInt(this.dataset.submenuindex) - 1
            );
          }
          break;

        case context.keys.DOWN:
          if (this.dataset.layout === "col" && this.nextElementSibling) {
            this.nextElementSibling.querySelector("a").focus();
          } else {
            context.gotToSubMenuItem(
              siblings,
              parseInt(this.dataset.submenuindex) + 1
            );
          }
          break;

        case context.keys.HOME:
          context.gotToSubMenuItem(siblings, 0);
          break;

        case context.keys.END:
          context.gotToSubMenuItem(siblings, siblings.length - 1);
          break;

        case context.keys.ESC:
          if (this.dataset.layout === "col") {
            this.closest("ul").previousElementSibling.focus();
          } else {
            this.offsetParent.previousElementSibling.focus();
          }
          break;

        default:
          break;
      }
    });
  });
};

export default A11yMegaMenu;
