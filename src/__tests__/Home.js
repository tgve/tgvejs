import React from 'react';
import {shallow} from 'enzyme';
// import { BrowserRouter } from 'react-router-dom';

import Home from '../home';
// import DeckGL from 'deck.gl';
const w = shallow(<Home location={{search: null}}/>);

test('Home shallow and mount', () => {
  // console.log(w.debug())
  expect(w.find('DeckGL')).not.toBeNull();
  expect(w.find('InteractiveMap')).not.toBeNull();
  expect(w.find("div.loader").length).toBe(1)
})

test('Home child DeckSidebarContainer', () => {
  const wd = shallow(<Home hideCharts={true}/>);
  const ds = wd.find('div').find('DeckSidebarContainer');
  // console.log(ds.debug());
  expect(ds.props().hideCharts).toBe(true)
})
