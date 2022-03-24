import React from 'react';
import { shallow } from 'enzyme';
import { Input } from 'baseui/input';

import DeckSidebar from '../components/decksidebar/DeckSidebar'

test('Shallow and mount', () => {
  const w = shallow(<DeckSidebar />);
  expect(w.find(Input).prop('id')).toEqual("search-nominatum");
  // console.log(w.debug())
  expect(w.text().includes('Nothing to show')).toBe(true)

})
