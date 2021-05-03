class Utility {
    _addPolyfills() {
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
    };
    _error(err) {
        console.error(err);
    }
    _isValidURL(string) {
        var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        return (res !== null)
    }
    _hasSpecialCharacter(param) {
        var format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return format.test(param)
    }
    _hasClass(el, className) {
        if (el.classList) {
            return el.classList.contains(className);
        } else {
            return new RegExp("(^| )" + className + "( |$)", "gi").test(el.className);
        }
    };
}

export default Utility;