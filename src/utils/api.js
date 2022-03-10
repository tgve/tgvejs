// importing it other ways would cause minification issue.
import qs from 'qs';
import { isArray, isObject, isString } from './JSUtils';


/**
 * Search parameters should take priority. Then comes
 * component level parameters and finally ENV vars.
 *
 * @param {*} props properties to extract APIs from
 * @param {*} search search query that can be parsed with qs
 * @returns {Object} of all valid or undefined TGVE API parameters.
 */
const params = function (props, search = "") {
  const qsr = typeof search === 'string' &&
    qs.parse(search.replace("?", ""))

  const staticData = document.getElementById('tgve-data')
    && document.getElementById('tgve-data').textContent
    && jsonStr(document.getElementById('tgve-data').textContent);

  const settings = (document.getElementById('tgve-settings')
    && document.getElementById('tgve-settings').textContent
    && jsonStr(document.getElementById('tgve-settings').textContent))
    || {};

  const apiValue = function (paramName, ENV_NAME, bool = false) {
    const param = props[paramName]
    if (qsr.hasOwnProperty(paramName)) {
      return bool ? boolStr(qsr[paramName]) : qsr[paramName]
    } else if (bool && typeof param === 'boolean') {
      return param
    } else if (!bool && param) {
      return param
    } else if (settings.hasOwnProperty(paramName)) {
      return bool ? boolStr(settings[paramName]) : settings[paramName]
    } else if (process.env.hasOwnProperty(ENV_NAME)) {
      return bool ? boolStr(process.env[ENV_NAME]) : process.env[ENV_NAME]
    }
  }

  // if not correct type found return a default
  const expected = function (found, expected, def) {
    return typeof found === expected ? found : def
  }


  return ({
    defaultURL: apiValue("defaultURL", "REACT_APP_DEFAULT_URL"),                  // String
    geographyURL: apiValue("geographyURL", "REACT_APP_GEOGRAPHY_URL"),            // String
    geographyColumn: apiValue("geographyColumn", "REACT_APP_GEOGRAPHY_COLUMN"),   // String
    column: apiValue("column", "REACT_APP_COLUMN"),                               // String
    tooltipColumns: apiValue("tooltipColumns", "REACT_APP_TOOLTIP_COLUMNS"),      // Object
    layerName: apiValue("layerName", "REACT_APP_LAYER_NAME"),                     // String
    // if no boolean found set a default value
    dark: expected(apiValue("dark", "REACT_APP_DARK", true),                      // Boolean
      "boolean", true),
    hideChartGenerator: apiValue("hideChartGenerator",                            // Boolean
      "REACT_APP_HIDE_CHART_GENERATOR", true),
    hideCharts: apiValue("hideCharts",                                            // Boolean
      "REACT_APP_HIDE_CHARTS", true),
    hideSidebar: apiValue("hideSidebar",                                          // Boolean
      "REACT_APP_HIDE_SIDEBAR", true),
    viewport: jsonStr(qsr.viewport) || props.viewport || settings.viewport,       // Object
    data: jsonStr(qsr.data) || props.data || staticData,                          // Object
    select: keySetObject(qsr.select) || props.select,                             // Object | String
    // react component
    leftSidebarContent: props.leftSidebarContent                                  // React object
  })
}

const boolStr = function (str) {
  if (str === 'true') return true
  if (str === 'false') return false
  return undefined
}

const jsonStr = function (str) {
  try {
    const json = JSON.parse(str);
    return json
  } catch (e) {
    return false;
  }
}

/**
 * The subset object in tgvejs `multiVarSelect`
 * is composed of {key: Set()} with the set including
 * values for which the key is subset by.
 *
 * @param {Object|String} filterStr
 * @returns {Object}
 */
const keySetObject = function (filterStr) {
  // is it json with array?
  const json = jsonStr(filterStr);
  const result = {}
  if (isObject(json)) {
    // sanity check on json object
    Object.keys(json).forEach(key => {
      if (isArray(json[key])) {
        result[key] = new Set(json[key])
      }
    })
    return result
  } else if (isString(filterStr)) {
    // validate format
    // select=key:val1,val2,val3
    const regex = new RegExp(/^[\w+._-\s\\(\\)]+:[\w+._-\s\\(\\)]+/);
    if(!regex.test(filterStr)) return null
    const array = filterStr.split(":")
    if (array.length < 1) return null
    for (let i = 0; i < array.length; i += 2) {
      // ["key", "val1,val2,val3", "key" ..]
      const values = array[i + 1] && array[i + 1].split(",")
      if (isArray(values)) {
        result[array[i]] = new Set(values)
      }
    }
    return result
  }
  return null
}

export {
  keySetObject,
  jsonStr,
  params
}
