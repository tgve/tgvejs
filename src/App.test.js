import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { BaseProvider, DarkTheme, LightTheme } from 'baseui';

import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, div);
  ReactDOM.unmountComponentAtNode(div);
});

test('App - should create snapshot', () => {
  const component = renderer.create(
    <BrowserRouter><App /></BrowserRouter>
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})

test('App - dark/light themes set', () => {
  const m = shallow(<App />);
  expect(m.find(BaseProvider).prop('theme')).toEqual(DarkTheme);

  const n = shallow(<App dark={false}/>);
  expect(n.find(BaseProvider).prop('theme')).toEqual(LightTheme);

})

test('App - API params set', () => {
  const m = shallow(<App />).find('Welcome');
  // console.log(m.find('Welcome').props());
  // console.log(m.debug());
  expect(m.props().hideCharts).toEqual(undefined);
  expect(m.props().hideChartGenerator).toEqual(undefined);
  expect(m.props().defaultURL).toEqual(undefined);

  const n = shallow(<App hideCharts={true}/>)
    .find('Welcome');
  expect(n.props().hideCharts).toEqual(true);

})

/*
  defaultURL: apiValue(defaultURL, "defaultURL", "REACT_APP_DEFAULT_URL"),
  geographyURL: apiValue(geographyURL, "geographyURL",
    "REACT_APP_GEOGRAPHY_URL"),
    geographyColumn: apiValue(geographyColumn, "geographyColumn",
    "REACT_APP_GEOGRAPHY_COLUMN"),
    column: apiValue(column, "column", "REACT_APP_COLUMN_NAME"),
    tooltipColumns: apiValue(tooltipColumns, "tooltipColumns",
    "REACT_APP_TOOLTIP_COLUMNS"),
    layerStyle: apiValue(layerName, "layerName", "REACT_APP_LAYER_NAME"),
    // if no boolean found set a default value
    dark: expected(apiValue(dark, "dark", "REACT_APP_DARK", true),
      "boolean", true),
    hideChartGenerator: apiValue(hideChartGenerator, "hideChartGenerator",
      "REACT_APP_HIDE_CHART_GENERATOR", true),
    hideCharts: apiValue(hideCharts, "hideCharts",
      "REACT_APP_HIDE_CHARTS", true),
    hideSidebar: apiValue(hideSidebar, "hideSidebar",
      "REACT_APP_HIDE_SIDEBAR", true),
    viewport: jsonStr(qsr.viewport) || viewport || settings.viewport,
    data: jsonStr(qsr.data) || data || staticData,
    // react component
    leftSidebarContent,
  */

test('App - API params ENV',() => {
  process.env.REACT_APP_DEFAULT_URL = "https://react.com"
  process.env.REACT_APP_GEOGRAPHY_URL = "geographyURL"
  process.env.REACT_APP_GEOGRAPHY_COLUMN = "geographyColumnName"
  process.env.REACT_APP_COLUMN_NAME = "columnName"
  const m = shallow(<App />).find('Welcome');
  expect(m.props().defaultURL).toEqual("https://react.com");
  expect(m.props().geographyURL).toEqual("geographyURL");
  expect(m.props().geographyColumn).toEqual("geographyColumnName");
  expect(m.props().column).toEqual("columnName");

})