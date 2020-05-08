import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer'; 
import { shallow } from 'enzyme';
import { BaseProvider, DarkTheme } from 'baseui';

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

  const m = shallow(<App />);
  console.log(m.find(BaseProvider).children());
  expect(m.find(BaseProvider).prop('theme')).toEqual(DarkTheme);
})