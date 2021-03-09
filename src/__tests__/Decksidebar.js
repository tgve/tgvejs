import React from 'react';
import {shallow, mount} from 'enzyme';
import { Navbar } from 'react-bootstrap';
import { BrowserRouter } from 'react-router-dom';

import DeckSidebar from '../components/decksidebar/DeckSidebar';

test('DeckSidebar shallow and mount', () => {
  const dsb = shallow(<DeckSidebar />);
  // console.log(dsb.debug())
  const ta = dsb.find('ToastAlert');
  expect(ta.key).not.toBeNull(); 
  expect(dsb.find('AddVIS')).not.toBeNull();
  const m = mount(<BrowserRouter><DeckSidebar /></BrowserRouter>);
  expect(m.contains(BrowserRouter)).toEqual(true);
})