// importing it other ways would cause minification issue.
import qs from 'qs';
import { isArray, isObject, isString } from './JSUtils';


/**
 * Search parameters should take priority. Then comes
 * component level parameters and finally ENV vars.
 *
 * @param {*} props properties to extract APIs from
 * @param {*} search search query that can be parsed with qs
 * @returns {object} of all valid or undefined TGVE API parameters.
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
    /** String */
    defaultURL: apiValue("defaultURL", "REACT_APP_DEFAULT_URL"),
    geographyURL: apiValue("geographyURL", "REACT_APP_GEOGRAPHY_URL"),
    geographyColumn: apiValue("geographyColumn", "REACT_APP_GEOGRAPHY_COLUMN"),
    column: apiValue("column", "REACT_APP_COLUMN"),
    layerName: apiValue("layerName", "REACT_APP_LAYER_NAME"),
    /**  Object */
    tooltipColumns: apiValue("tooltipColumns", "REACT_APP_TOOLTIP_COLUMNS"),
    viewport: jsonStr(qsr.viewport) || props.viewport || settings.viewport,
    data: jsonStr(qsr.data) || props.data || staticData,
    // if no boolean found set a default value
    /** Boolean */
    dark: expected(apiValue("dark", "REACT_APP_DARK", true),
      "boolean", true),
    hideChartGenerator: apiValue("hideChartGenerator",
      "REACT_APP_HIDE_CHART_GENERATOR", true),
    hideCharts: apiValue("hideCharts",
      "REACT_APP_HIDE_CHARTS", true),
    hideSidebar: apiValue("hideSidebar",
      "REACT_APP_HIDE_SIDEBAR", true),

    // TOTO: strict checks on props.select to be
    // either like qsr or exactly like multiVarSelect
    /** Object | String */
    select: keySetObject(qsr.select) || props.select,
    // react component
    /** React object */
    leftSidebarContent: props.leftSidebarContent,
    /** Callback */
    onViewStateChange: props.onViewStateChange,
    onStateChange: props.onStateChange
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
 * @param {object|string} filterStr
 * @returns {object}
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

// reverse keySetObject above to JSON
const jsonFromKeySetObject = (multiVarSelect) => {
  if (!multiVarSelect || !Object.keys(multiVarSelect)) return {}
  return Object.keys(multiVarSelect).reduce((p, c) => {
    p[c] = Array.from(multiVarSelect[c])
    return p
  }, {})
}

export {
  jsonFromKeySetObject,
  keySetObject,
  jsonStr,
  params
}
