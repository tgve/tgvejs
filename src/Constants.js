function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

define("PRD_URL", 'http://stats19.geoplumber.com');
define("DEV_URL", 'http://localhost:8000');
define("UI_NAMES", [
    "checkbox",     // 1 or 2 - 5
    "radio",        // 2 - 5
    "buttongroups", // 2 or 3
    "dropdown",     // 5 - 10? 100?
    "slider"])      // 10 or more?
