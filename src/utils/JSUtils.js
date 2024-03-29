/*
Utility Functions

thanks https://github.com/realm/github-gantt/blob/master/utilities.js

*/
var isString = function(x) {
    return x !== null && x !== undefined && x.constructor === String
}

var isNumber = function(x) {
    return x !== null && x !== undefined && x.constructor === Number
}

var isBoolean = function(x) {
    return x !== null && x !== undefined && x.constructor === Boolean
}

var isObject = function(x) {
    return x !== null && x !== undefined && x.constructor === Object
}

var isArray = function(x) {
    return x !== null && x !== undefined && x.constructor === Array
}

var isDate = function(d) {
  if ( Object.prototype.toString.call(d) === "[object Date]" ) {
    if ( isNaN( d.getTime() ) ) {
      return false;
    }
    else {
      return true;
    }
  }
  else {
    return false;
  }
}

// var isRealmObject = function(x) {
//     return x !== null && x !== undefined && x.constructor === Realm.Object
// }

// var isRealmList = function(x) {
//     return x !== null && x !== undefined && x.constructor === Realm.List
// }

var sanitizeFloat = function(number) {
    if (isNumber(number)) {
        return number;
    }
    else if (isString(number)) {
        let n = parseFloat(number);
        if (isNaN(n)) {
          return null;
        }
        else {
          return n;
        }
    }
    else {
        return null;
    }
}

var sanitizeInt = function(number) {
    if (isNumber(number)) {
        return number;
    }
    else if (isString(number)) {
        return parseInt(number);
    }
    else {
        return null;
    }
}

var sanitizeString = function(string) {
    if (isString(string)) {
        return string;
    }
    else if (isNumber(string)) {
        return string.toString();
    }
    else {
        return null;
    }
}

var sanitizeStringNonNull = function(string) {
    if (isString(string)) {
        return string;
    }
    else if (isNumber(string)) {
        return string.toString();
    }
    else {
        return "";
    }
}

var sanitizeBool = function(bool) {
    if (isBoolean(bool)) {
        return bool;
    }
    else if (isNumber(bool)) {
        return Boolean(bool);
    }
    else {
        return null;
    }
}

function isEmptyOrSpaces(str){
  return str === null || str.match(/^ *$/) !== null;
}

function randomToNumber (n = 0) {
  if(!n || !+n) return 0;
  return Math.floor(Math.random() * n)
}

function isStringNumeric (str) {
  if(typeof str !== 'string') return false
  return !isNaN(str) && !isNaN(parseFloat(str))
}

function isNullUndefinedNaN (str) {
  return str === null
      || str === undefined
      //typeof NaN === 'number'
      || (typeof str === 'number' && isNaN(str))
}

exports.isNullUndefinedNaN = isNullUndefinedNaN;
exports.isStringNumeric = isStringNumeric;
exports.randomToNumber = randomToNumber;
exports.isBoolean = isBoolean;
exports.isString = isString;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.isArray = isArray;
exports.isDate = isDate;
// exports.isRealmObject = isRealmObject;
// exports.isRealmList = isRealmList;
exports.sanitizeFloat = sanitizeFloat;
exports.sanitizeInt = sanitizeInt;
exports.sanitizeString = sanitizeString;
exports.sanitizeStringNonNull = sanitizeStringNonNull;
exports.sanitizeBool = sanitizeBool;
exports.isEmptyOrSpaces = isEmptyOrSpaces;
