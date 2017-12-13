import jasmineEnzyme from "jasmine-enzyme";
import jsdom from 'jsdom';
import config from "config";

export function loadGlobalDocument() {
    const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
    global.document = doc;
    global.window = doc.defaultView;
};

export function setUpJasmine() {
    jasmineEnzyme();
}

export function setUpLocalStorage(options) {
    let mock = (function () {
        return {
            authToken: options.authToken,
            getItem: function (key) {
                return this[key];
            },
            setItem: function (key, value) {
                this[key] = value;
            },
            removeItem: function (key) {
            },
            clear: function () {
            }
        };
    })();
    Object.defineProperty(window, 'localStorage', {value: mock, writable: true});
}


export default function configureTestingEnvironment() {
    setUpJasmine();
    loadGlobalDocument();
}

