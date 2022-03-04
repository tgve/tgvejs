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

test('App - API params ENV',() => {
  process.env.REACT_APP_DEFAULT_URL = "https://react.com"
  const m = shallow(<App />).find('Welcome');
  expect(m.props().defaultURL).toEqual("https://react.com");
})