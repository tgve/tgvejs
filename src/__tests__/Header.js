import React from 'react';
import {shallow, mount} from 'enzyme';
import { Navbar, Nav } from 'react-bootstrap';
import { BrowserRouter } from 'react-router-dom';

import Header from '../components/Header';

test('Shallow and mount', () => {
  const header = shallow(<Header />);
  // console.log(header.text());
  // console.log(header.debug());
  const route = header.find('Route').prop('children')();
  expect(route.key).toBeNull(); 
  const m = mount(<BrowserRouter><Header /></BrowserRouter>);
  // console.log(m.props());
  expect(m.contains(BrowserRouter)).toEqual(true);
  expect(m.find(BrowserRouter).children()
  .contains(Header)).toEqual(true);
  const h = m.find(BrowserRouter).children().find(Header).children();
  // console.log(h.find(Navbar).children().debug());
  // <Navbar inverse={true} collapseOnSelect={true}
  // ....
  // ..
  const nb = h.find(Navbar).children();
  expect(nb.prop('inverse')).toEqual(false); // not inverse in branch theme
})