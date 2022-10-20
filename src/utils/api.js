// importing it other ways would cause minification issue.
import qs from 'qs';
import { areEqualFeatureArrays } from './geojsonutils';
import { isArray, isObject, isString } from './JSUtils';
const TGVE_API = {
  /** String */
  defaultURL: "string",
  geographyURL: "string",
  geographyColumn: "string",
  column: "string",
  layerName: "string",
  /**  Object */
  tooltipColumns: "object",
  viewport: "object",
  data: "object",
  // if no boolean found set a default value
  /** Boolean */
  dark: "boolean",
  hideChartGenerator: "boolean",
  hideCharts: "boolean",
  hideSidebar: "boolean",

  // TOTO: strict checks on props.select to be
  // either like qsr or exactly like multiVarSelect
  /** Object | String */
  select: "object|string",
  // react component
  /** React object */
  leftSidebarContent: "react",
  /** Callback */
  onViewStateChange: "function",
  onStateChange: "function"
}

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
    // first check query string (URL params)
    if (qsr.hasOwnProperty(paramName) && !param) {
      return bool ? boolStr(qsr[paramName]) : qsr[paramName]
      // then React props
    } else if (bool && typeof param === 'boolean') {
      return param
    } else if (!bool && param) {
      return param
      // then settings inside a html doc
    } else if (settings.hasOwnProperty(paramName)) {
      return bool ? boolStr(settings[paramName]) : settings[paramName]
      // finally env variables
    } else if (process.env.hasOwnProperty(ENV_NAME)) {
      return bool ? boolStr(process.env[ENV_NAME]) : process.env[ENV_NAME]
    }
  }

  // if not correct type found return a default
  const expected = function (found, expected, def) {
    return typeof found === expected ? found : def
  }


  const r = {}
  Object.keys(TGVE_API).forEach(k => {
    const RA = apiToReactApp(k)
    if(TGVE_API[k] === 'function' || TGVE_API[k] === 'react') {
      r[k] = props[k]
    } else if (k === 'select') {
      r[k] = keySetObject(qsr[k] || props[k]) || props[k]
      // TODO: move following two to apiValue func
    } else if (k === 'data') {
      r[k] = jsonStr(qsr[k]) || props[k] || staticData
    } else if (k === 'viewport' || k === 'tooltipColumns') {
      r[k] = jsonStr(qsr[k]) || props[k] || settings[k]
    } else if (k === 'dark') {
      r[k] = expected(apiValue(k, RA, true),"boolean", true)
    } else if (TGVE_API[k] === 'boolean') {
      r[k] = apiValue(k, RA, true)
    } else if (TGVE_API[k] === 'string') {
      r[k] = apiValue(k, RA)
    }
  })

  return (r)
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

const apiSplit = (str) => {
  if (!isString(str)) return null
  if (str.toUpperCase() === str) return str
  const m = /[A-Z]+/.exec(str)
  if (!m) return str.toUpperCase()
  const i = m.index
  if (i === 0) {
    //lower first letter & recall
    return apiSplit(str.charAt(0).toLowerCase() + str.slice(1))
  } else {
    return [str.slice(0, i), str.slice(i)]
  }
}

const apiToReactApp = (str) => {
  if (!isString(str)) return null
  const ra = "REACT_APP_"
  let w = [], r = apiSplit(str)
  if (isArray(r)) {
    do {
      w.push(r[0].toUpperCase())
      r = apiSplit(r[1])
    } while(isArray(r))
    w.push(r)
  } else {
    w = r
  }

  return ra + (isArray(w) ? w.join("_") : w)
}

const hasAPIChanged = (values = {}, compare = {}) => {
  const { data } = values
  if(!isObject(values) || !isObject(compare)) return null
  let r = false
  Object.keys(TGVE_API).forEach(k => {
    if(TGVE_API[k] === 'function' || TGVE_API[k] === 'react') {
      // how ?
    } else if (k === 'select') {
      // key: Set() object
      const a = values[k]
      isObject(a) && Object.keys(a).forEach(e => {
        if(!compare.hasOwnProperty(e)) {
          r = true
        }
        isObject(a[e]) && a[e].forEach(v => {
          if(!compare[k].has(v)) {
            r = true
          }
        })
      })
    } else if (k === 'data') {
      if (areEqualFeatureArrays(data, compare.data)) r = true
    } else if (k === 'viewport' || k === 'tooltipColumns') {
      // compare stringify
      if (JSON.stringify(values[k]) !== JSON.stringify[k]) {
        r = true
      }
    } else {
      if (values[k] !== compare[k]) {
        r = true
      }
    }
  })

  return(r)
}

export {
  jsonFromKeySetObject,
  hasAPIChanged,
  apiToReactApp,
  keySetObject,
  TGVE_API,
  jsonStr,
  params
}
