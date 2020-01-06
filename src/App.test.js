import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer'; 

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