import axios from "axios";
import Utility from './Utility';

function A11ySuggestionBox(element, options) {
  // Assign element
  this.suggestionBox = element;
  
  // Initiate objects
  this.clearButton = null;
  this.autocompleteList = null;
  this.announceBox = null;
  this.keys = {
    ESC: 27,
    TAB: 9,
    RETURN: 13,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
  };
  this.currentFocus = -1;
  this.consoleError = [];
  this.isAlreadyCheckedFundCode = false;
  this.allSuggestionList = [];

  // Apply settings from Configuration object
  this.settings = options;
  this.searchType = (!options.searchType || options.searchType === "") ? 'contains' : options.searchType;
  this.noOfItems = options.noOfItems ? options.noOfItems : 10;
  this.minimumType =  options.minimumType ? options.minimumType : 2;
  this.SRText = options.SRText;
  this.screenReaderClassName = "visually-hidden";
  this.dataCanvas = options.dataCanvas ? options.dataCanvas
  : {
    source: [],
    hooks: [],
    displayKeyName: ""
  };

  // Register callback methods
  this.onItemSelected = options.onItemSelected || function () { return; };
  this.onFocusIn = options.onFocusIn || function () { return; };
  this.onFocusOut = options.onFocusOut || function () { return; };

  // Register Utility class
  this.Utility = new Utility();

  this.init();
  this.eventHandlers();
}

// Create Clear button
A11ySuggestionBox.prototype.showErrorLogInConsole = function (messageObj) {
  var context = this;
  context.consoleError.push(messageObj);
  console.clear();
  console.table(context.consoleError, ["FunctionName", "Message", "LineNo"]);
};

// Make a service call
A11ySuggestionBox.prototype.fetchData = function () {
  var context = this;

  axios.get(context.dataCanvas.source)
    .then(function (response) {
      context.allSuggestionList = response.data;
    })
    .catch(function (error) {
      context.showErrorLogInConsole({
        "FunctionName": "fetchData",
        "Message": error,
        "LineNo": 50
      });
    })
};

// Hide and clear auto suggestion box
A11ySuggestionBox.prototype.hideAndClearSuggestionBox = function () {
  var context = this;
  context.autocompleteList.innerHTML = "";
  context.announceBox.innerText = "";
  context.autocompleteList.parentElement.style.display = 'none';
};

// Create Clear button
A11ySuggestionBox.prototype.createClearButton = function () {
  var context = this,
    suggestionBoxID = context.suggestionBox.id,
    clearButton = document.createElement("button");

  clearButton.setAttribute('id', suggestionBoxID + '_clear_search_btn')
  clearButton.setAttribute('type', 'button');
  clearButton.style.display = 'none';
  clearButton.innerHTML = '<span class="sr-only">'+ context.SRText.closeBtn +'</span>X';
  clearButton.classList.add('btn', 'suggestionbox_clear_btn');
  context.suggestionBox.parentElement.insertBefore(clearButton, context.suggestionBox.nextSibling);

  context.clearButton = clearButton;
};

// Create Suggestion box container
A11ySuggestionBox.prototype.createSuggestionBoxContainer = function () {
  var context = this,
    suggestionBoxID = context.suggestionBox.id,
    suggestionBoxElement = document.createElement("div");

  suggestionBoxElement.setAttribute('id', suggestionBoxID + '_search_autocomplete');
  suggestionBoxElement.classList.add('autocomplete-suggestions');

  context.suggestionBox.parentElement.insertBefore(suggestionBoxElement, context.suggestionBox.nextSibling);
  suggestionBoxElement.innerHTML = `
    <div id="autocompleteList_${suggestionBoxID}"
      role="listbox" class="autocompleteList d-flex flex-column"
      aria-label="${context.SRText.suggestionBoxLabel}"
      tabindex="-1"></div>
  `;

  context.autocompleteList = document.getElementById(`autocompleteList_${suggestionBoxID}`);
};

// Create Announcement box
A11ySuggestionBox.prototype.createAnnouncementBox = function () {
  var context = this,
    suggestionBoxID = context.suggestionBox.id,
    announceElement = document.createElement("div");

  announceElement.setAttribute('id', suggestionBoxID + '_announce');
  announceElement.setAttribute("aria-live", "assertive");
  announceElement.classList.add(context.screenReaderClassName);

  // Insert instruction text first
  var instructionElement = document.createElement('span');
  instructionElement.classList.add(context.screenReaderClassName);
  instructionElement.setAttribute('id', suggestionBoxID + '_instruction');
  instructionElement.innerText = context.SRText.instruction;

  context.suggestionBox.parentElement.parentNode.insertBefore(instructionElement, context.suggestionBox.parentElement);

  // Then insert announcement box
  context.suggestionBox.parentElement.parentNode.insertBefore(announceElement, context.suggestionBox.parentElement);
  context.announceBox = announceElement;
};

// Assign fund data to corresponding object
A11ySuggestionBox.prototype.prepareSuggestionData = function (data) {
  var context = this;

  context.allSuggestionList = data.map(item => {
    var obj = {};
    obj[context.dataCanvas.displayKeyName] = item;
    return obj;
  });
};

// Initialize method
A11ySuggestionBox.prototype.init = function () {
  var context = this;

  // Make service call if URL is passed instead of an object
  if (typeof context.dataCanvas.source === 'string') {
    if (context.Utility._isValidURL(context.dataCanvas.source)) {
      context.fetchData();
    } else {
      context.Utility._error('Source string is not a valid service end point. Please provide valid URL or an array as Data source');
    }

  } else {
    var isPlainArr = context.dataCanvas.source.some(value => typeof value === 'string');

    if (isPlainArr) {
      context.dataCanvas.displayKeyName = 'DisplayText';
      context.prepareSuggestionData(context.dataCanvas.source);
    } else {
      context.allSuggestionList = context.dataCanvas.source;
    }
  }

  // Create Clear button
  context.createClearButton();

  // Create auto suggestion box container
  context.createSuggestionBoxContainer();

  // Create announce box
  context.createAnnouncementBox();

  // Set aria attributes
  context.suggestionBox.setAttribute('aria-describedby', context.suggestionBox.id + '_instruction');
  context.suggestionBox.setAttribute('aria-owns', context.autocompleteList.id);
};

// List of all handlers
A11ySuggestionBox.prototype.eventHandlers = function () {
  var context = this;

  // Clear button click event
  context.clearButton.addEventListener('click', function (event) {
    context.suggestionBox.value = "";
    context.suggestionBox.focus();

    context.hideAndClearSuggestionBox();
    context.currentFocus = -1;
    event.currentTarget.style.display = 'none';
  });

  // Key press event on input box
  context.suggestionBox.addEventListener('keydown', function (event) {
    context.doKeypress(event);
  });

  // Focus out event on input box -> only meant to set proper setting for a particular Fund code
  context.suggestionBox.addEventListener('focusin', function (event) {
    var searchedVal = event.target.value.trim();

    if (searchedVal !== "") {
      context.onFocusIn(searchedVal);
    }
  });

  // Focus out event on input box -> only meant to set proper setting for a particular Fund code
  context.suggestionBox.addEventListener('focusout', function (event) {
    var searchedVal = event.target.value.trim();

    if (searchedVal !== "") {
      context.onFocusOut(searchedVal);
    }
  });

  // On insert value
  context.suggestionBox.addEventListener('input', function (event) {
    var searchedVal = event.target.value.trim();

    searchedVal = searchedVal.trim();
    context.isAlreadyCheckedFundCode = false;

    context.currentFocus = -1;

    // for checking # characters
    if (searchedVal.length >= context.minimumType) {
      context.clearButton.style.display = 'block';

      // Check if numbers are not present			
      if (searchedVal.match(/\d/g) === null) {
        context.applySearch(searchedVal);
      } else {
        context.hideAndClearSuggestionBox();
      }
    } else {
      if (searchedVal.length == 0) {
        context.hideAndClearSuggestionBox();
      }
      context.clearButton.style.display = 'none';
    }
  });
};

// Function to deal with the keyborad interactions for the auto-suggest and highlight the currently selected option
A11ySuggestionBox.prototype.doKeypress = function (event) {
  var context = this,
    highligted = (context.autocompleteList.querySelector('.highligt') !== null);

  switch (event.which) {
    case context.keys.ESC:
    case context.keys.TAB:
      context.suggestionBox.removeAttribute("aria-activedescendant");
      context.hideAndClearSuggestionBox();
      break;

    case context.keys.RIGHT:
      context.selectOption(highligted)
      break;

    case context.keys.RETURN:
      event.preventDefault();
      event.stopPropagation();

      if (highligted) {
        context.selectOption(highligted);
      }
      break;

    case context.keys.UP:
      event.preventDefault();
      event.stopPropagation();

      context.currentFocus--;
      context.setActiveItem();
      break;

    case context.keys.DOWN:
      event.preventDefault();
      event.stopPropagation();

      context.currentFocus++;
      context.setActiveItem();
      break;

    default:
      break;
  }

  return;
};

// Performs the search based on the users input, and builds the list of suggestions
A11ySuggestionBox.prototype.applySearch = function (suggestedVal) {
  var context = this, searchedItem = suggestedVal.toUpperCase();

  context.suggestionBox.removeAttribute("aria-activedescendant");
  context.autocompleteList.innerHTML = "";
  context.announceBox.innerText = "";

  //Case insensitive search and return matches to build the  array of suggestions
  if (context.dataCanvas.displayKeyName === "") {
    context.Utility._error('Missing key name to fetch display text. Please provide key name in configuration object');
  } else {
    var keyName = context.dataCanvas.displayKeyName, results = [];

    if (context.allSuggestionList[0][keyName] === undefined) {
      context.Utility._error('"' + keyName + '" name is not a valid key. Please check the displayKeyName - key passed in Configuration object');
      results = [];
    } else {
      results = context.allSuggestionList.filter(item => {
        var retVal;

        switch (context.searchType) {
          case 'start':
            retVal = item[keyName].toUpperCase().lastIndexOf(searchedItem, 0) === 0;
            break;

          case 'end':
            retVal = item[keyName].toUpperCase().indexOf(searchedItem, item[keyName].length - searchedItem.length) !== -1;
            break;

          default:
            retVal = item[keyName].toUpperCase().indexOf(searchedItem) > -1;
            break;
        }
        return retVal;
      });
    }

    //Make sure we have at least 1 suggestion
    if (results.length > 0) {
      // Start things fresh by removing the suggestions div and emptying the live region before we start			
      context.autocompleteList.parentElement.style.display = 'block';
      
      for (let i = 0; i < results.length; i++) {
        if (i < context.noOfItems) {
          var dataSetbyHooks = " ";

          if (context.dataCanvas.hooks && context.dataCanvas.hooks.length > 0 && keyName !== 'DisplayText') {
            context.dataCanvas.hooks.map(hook => {
              if (results[i][hook] === undefined) {
                context.Utility._error('"' + hook + '" name is not a valid key in the object. Please check the hook name passed in Configuration object');
              } else {
                dataSetbyHooks += `data-${hook}="${results[i][hook]}" `
              }
            })
          }

          context.autocompleteList.innerHTML +=
            "<div role='option'" +
            "	  tabindex='-1'" +
            "	  class='autocomplete-suggestion'" +
            "	  id='suggestion-" + i + "'" +
            "	  aria-selected=false" +
            dataSetbyHooks +
            ">" +
            results[i][keyName] +
            "</div>";
        } else {
          break;
        }
      }

      context.announceBox.innerText = context.SRText.announceCount.replace('%number%', context.autocompleteList.children.length);

      [].map.call(context.autocompleteList.children, function (elem) {
        elem.addEventListener("click", function () {
          var retObj = {};
          retObj[context.dataCanvas.displayKeyName] = this.innerText;
          Object.assign(retObj, this.dataset);

          context.onItemSelected(retObj);

          // When an option is clicked, copy it's text into the input field, then close and remove the list of suggestions
          context.suggestionBox.value = this.innerText;
          context.suggestionBox.focus();
          context.hideAndClearSuggestionBox();
        });
      });
    }
  }
};

// Function to add and show active item
A11ySuggestionBox.prototype.setActiveItem = function () {
  var context = this,
    itemCollections = this.autocompleteList.getElementsByTagName('div');

  [].map.call(itemCollections, function (elem) {
    elem.classList.remove('highligt');
    elem.setAttribute('aria-selected', false);
  });

  if (context.currentFocus >= itemCollections.length) context.currentFocus = 0;
  if (context.currentFocus < 0) context.currentFocus = (itemCollections.length - 1);

  itemCollections[context.currentFocus].classList.add('highligt');
  itemCollections[context.currentFocus].setAttribute('aria-selected', true);
  context.suggestionBox.setAttribute("aria-activedescendant", itemCollections[context.currentFocus].id);
};

// Function to select the users chosen option
A11ySuggestionBox.prototype.selectOption = function (highligted) {
  var context = this;

  if (highligted) {
    var selectedFund = document.querySelector('.highligt');

    context.suggestionBox.removeAttribute("aria-activedescendant");
    selectedFund.click();
  }
  return;
};

export default A11ySuggestionBox;
