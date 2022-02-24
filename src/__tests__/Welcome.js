import React from 'react';
import {shallow} from 'enzyme';
// import { BrowserRouter } from 'react-router-dom';

import Welcome from '../Welcome';
// import DeckGL from 'deck.gl';
const w = shallow(<Welcome location={{search: null}}/>);

test('Welcome shallow and mount', () => {
  // console.log(w.debug())
  expect(w.find('DeckGL')).not.toBeNull();
  expect(w.find('InteractiveMap')).not.toBeNull();
  expect(w.find("div.loader").length).toBe(1)
})

test('Welcome child DeckSidebarContainer', () => {
  const wd = shallow(<Welcome hideCharts={true}/>);
  const ds = wd.find('div').find('DeckSidebarContainer');
  // console.log(ds.debug());
  expect(ds.props().hideCharts).toBe(true)
})
