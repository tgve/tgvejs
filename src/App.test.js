import React from 'react';
import ReactDOM from 'react-dom';
// import { waitFor, cleanup } from '@testing-library/react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import { BaseProvider, DarkTheme, LightTheme } from 'baseui';

import App from './App';

test('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

test('App defaults to dark theme when given no prop', () => {
  const m = shallow(<App />);
  expect(m.find(BaseProvider).prop('theme')).toEqual(DarkTheme);
});

test('App can be set to light theme via props', () => {
  const n = shallow(<App dark={false}/>);
  expect(n.find(BaseProvider).prop('theme')).toEqual(LightTheme);
});

test('App snapshot dark theme', () => {
  const appDark = renderer.create(<App />);
  expect(appDark.toJSON()).toMatchSnapshot();
});

test('App snapshot light theme', () => {
  const appLight = renderer.create(<App dark={false}/>);
  expect(appLight.toJSON()).toMatchSnapshot();
});

test('Test empty state', () => {
  const wrapper = mount(<App />);
  // From this: https://stackoverflow.com/questions/56228092/how-to-find-an-element-by-its-text-in-enzyme
  const emptyDataComponent = wrapper.findWhere(node => (
    node.type() &&
    node.name() &&
    node.text() === "Nothing to show"
  ));

  expect(emptyDataComponent).not.toBe({});

  wrapper.unmount();
});

/*
test('App - dark/light themes set', async () => {
  const m = shallow(<App />);
  expect(m.find(BaseProvider).prop('theme')).toEqual(DarkTheme);
  process.env.REACT_APP_DEFAULT_URL = "https://raw.githubusercontent.com/tgve/example-data/main/casualties_100.geojson"
  const { asFragment } = render(<App />);

  global.fetch = jest.fn((url) =>
    Promise.resolve({
      text: () => Promise.resolve(`{
"type": "FeatureCollection",
"name": "casualties_100",
"features": [
{ "type": "Feature", "properties": { "accident_index": "201301EK40214", "police_force": "Metropolitan Police", "accident_severity": "Slight", "number_of_casualties": 1, "date": "2013-04-11", "day_of_week": "Thursday", "local_authority_district": "Camden", "local_authority_highway": "Camden", "first_road_class": "A", "road_type": "Single carriageway", "speed_limit": 30, "junction_detail": "Not at junction or within 20 metres", "second_road_class": "", "urban_or_rural_area": "Urban", "lsoa_of_accident_location": "E01000863", "datetime": "2013-04-11T11:40:00Z", "sex_of_casualty": "Female", "casualty_type": "Pedestrian", "age_of_casualty": null, "vehicle_type": "", "towing_and_articulation": "", "sex_of_driver": "" }, "geometry": { "type": "Point", "coordinates": [ -0.141282, 51.539844 ] } }
]}`),
    })
  );

  await waitFor(() => {
    expect(screen.getByText('Nothing to show')).toBeInTheDocument();
  });
  expect(asFragment()).toMatchSnapshot();

  const n = shallow(<App dark={false}/>);
  expect(n.find(BaseProvider).prop('theme')).toEqual(LightTheme);
  const appLight = renderer.create(<App dark={false}/>);
  expect(appLight.toJSON()).toMatchSnapshot();
})
*/

test('App - API params set', () => {
  const m = shallow(<App/>).find('Welcome');
  expect(m.props().hideCharts).toEqual(undefined);
  expect(m.props().hideChartGenerator).toEqual(undefined);

  const n = shallow(<App hideCharts={true}/>)
    .find('Welcome');
  expect(n.props().hideCharts).toEqual(true);

})

test('App - API params ENV',() => {
  process.env.REACT_APP_DEFAULT_URL = "https://react.com"
  process.env.REACT_APP_GEOGRAPHY_URL = "geographyURL"
  process.env.REACT_APP_GEOGRAPHY_COLUMN = "geographyColumn"
  process.env.REACT_APP_COLUMN = "column"
  process.env.REACT_APP_TOOLTIP_COLUMNS = "tooltipColumns"
  process.env.REACT_APP_LAYER_NAME = "layerName"
  process.env.REACT_APP_DARK = true
  process.env.REACT_APP_HIDE_CHART_GENERATOR = true
  process.env.REACT_APP_HIDE_CHARTS = true
  process.env.REACT_APP_HIDE_SIDEBAR = true
  const m = shallow(<App />).find('Welcome');
  expect(m.props().defaultURL).toEqual("https://react.com");
  expect(m.props().geographyURL).toEqual("geographyURL");
  expect(m.props().geographyColumn).toEqual("geographyColumn");
  expect(m.props().column).toEqual("column");
  expect(m.props().tooltipColumns).toEqual("tooltipColumns");
  expect(m.props().layerName).toEqual("layerName");
  expect(m.props().dark).toEqual(true);
  expect(m.props().hideChartGenerator).toEqual(true);
  expect(m.props().hideCharts).toEqual(true);
  expect(m.props().hideSidebar).toEqual(true);
})

