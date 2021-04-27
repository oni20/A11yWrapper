import A11yCarousel from "./components/Carousel";
import A11ySuggestionBox from "./components/SuggestionBox";
import A11ySlider from "./components/Slider";

// Plugin Configuration
var _A11yWrapper = function (selector) {
    this.node = document.querySelectorAll(selector);
    return this;
};

_A11yWrapper.prototype = {
    carousal: function (...settings) {
        this.node.forEach((node, index) => {
            return new A11yCarousel(
                node,
                settings[index] === undefined ? settings[0] : settings[index]
            );
        });
    },
    autosuggestion: function (settings) {
        return new A11ySuggestionBox(this.node[0], settings);
    },
    slider: function (...settings) {
        this.node.forEach((node, index) => {
            return new A11ySlider(
                node,
                settings[index] === undefined ? settings[0] : settings[index]
            );
        });
    },
};

// export to global namespace
window.A11yWrapper = function (selector) {
    return new _A11yWrapper(selector);
};