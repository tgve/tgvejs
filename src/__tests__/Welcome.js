import React from 'react';
import {shallow, mount} from 'enzyme';
import { BrowserRouter } from 'react-router-dom';

import Welcome from '../Welcome';
import DeckGL from 'deck.gl';

test('Welcome shallow and mount', () => {
  const w = shallow(<Welcome location={{search: null}}/>);
  // console.log(w.debug())
  expect(w.find('DeckGL')).not.toBeNull(); 
  expect(w.find('InteractiveMap')).not.toBeNull();
  expect(w.find("div.loader").length).toBe(1)
})