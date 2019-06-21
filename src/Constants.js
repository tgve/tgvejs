function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

define("PRD_URL", 'http://stats19.geoplumber.com');
define("DEV_URL", 'http://localhost:8000');
define("UI_LIST", [
    "checkbox",
    "radio",
    "buttongroups",
    "dropdown",
    "slider"])      
