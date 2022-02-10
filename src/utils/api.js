// importing it other ways would cause minification issue.
import qs from 'qs';

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

  const { defaultURL, tooltipColumns, geographyURL,
    geographyColumn, column, data, layerName, dark,
    leftSidebarContent, viewport, hideChartGenerator,
    hideCharts, 
    // > version 1.3.5-beta.0
    hideSidebar } = props;
  
  const staticData = JSON.parse(document.getElementById('tgve-data').textContent);

  return ({
    dark: qsr.hasOwnProperty("dark") ? 
      boolStr(qsr.dark) : typeof dark === 'boolean' ? 
      dark : process.env.REACT_APP_DARK || true,
    // TODO get these from a settings-json file/object
    // as well as envs
    defaultURL: qsr.defaultURL || defaultURL 
      || process.env.REACT_APP_DEFAULT_URL,
    tooltipColumns: qsr.tooltipColumns|| tooltipColumns 
      || process.env.REACT_APP_TOOLTIP_COLUMNS
      || { column1: "accident_severity", column2: "date" },
    geographyURL: qsr.geographyURL || geographyURL 
      || process.env.REACT_APP_GEOGRAPHY_URL,
    geographyColumn: qsr.geographyColumn || geographyColumn 
      || process.env.REACT_APP_GEOGRAPHY_COLUMN_NAME,
    column: qsr.column || column 
      || process.env.REACT_APP_COLUMN_NAME,
    layerStyle: qsr.layerName || layerName 
      || process.env.REACT_APP_LAYER_NAME,
    hideChartGenerator: qsr.hasOwnProperty("hideChartGenerator") ? 
      boolStr(qsr.hideChartGenerator) : hideChartGenerator || hideChartGenerator 
      || process.env.REACT_APP_HIDE_CHART_GENERATOR,
    hideCharts: qsr.hasOwnProperty("hideCharts") ? 
      boolStr(qsr.hideCharts) : typeof hideCharts === "boolean" ?
      hideCharts : process.env.REACT_APP_HIDE_CHARTS,
    // > version 1.3.5-beta.0
    hideSidebar: (qsr.hasOwnProperty("hideSidebar")) ?
      boolStr(qsr.hideSidebar) : typeof hideSidebar === "boolean" ?
      hideSidebar : process.env.REACT_APP_HIDE_SIDEBAR,
    // doubt these can be injected from envs
    data: staticData || jsonStr(qsr.data) || data,
    leftSidebarContent,
    viewport,
  })
}

const boolStr = function(str) {
  if(str === 'true') return true
  return false
}

const jsonStr = function(str) {
  try {
    const json = JSON.parse(str);
    return json
  } catch (e) {
    return false;
  }
}

export {
  jsonStr,
  params
}