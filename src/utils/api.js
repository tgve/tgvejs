const params = function (props) {
    const { defaultURL, tooltipColumns, geographyURL,
        geographyColumn, column, data, layerName, dark,
        leftSidebarContent, viewport, hideChartGenerator,
        hideCharts } = props;
    const isDark = dark || process.env.REACT_APP_DARK || true;
    return ({dark: isDark,
    // TODO get these from a settings-json file/object
    // as well as envs
    defaultURL: defaultURL || process.env.REACT_APP_DEFAULT_URL,
    tooltipColumns: tooltipColumns || process.env.REACT_APP_TOOLTIP_COLUMNS
    || { column1: "accident_severity", column2: "date" },
    geographyURL: geographyURL || process.env.REACT_APP_GEOGRAPHY_URL,
    geographyColumn: geographyColumn || process.env.REACT_APP_GEOGRAPHY_COLUMN_NAME,
    column: column || process.env.REACT_APP_COLUMN_NAME,
    layerStyle: layerName || process.env.REACT_APP_LAYER_NAME,
    // doubt they can be injected from envs
    data,
    leftSidebarContent,
    viewport,
    hideChartGenerator,
    hideCharts})
}
export {
    params
}