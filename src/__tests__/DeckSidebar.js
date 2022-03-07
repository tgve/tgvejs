import React from 'react';
import { shallow } from 'enzyme';
import { Input } from 'baseui/input';

import DeckSidebar from '../components/decksidebar/DeckSidebar'

test('Shallow and mount', () => {
  const m = shallow(<DeckSidebar />);
  expect(m.find(Input).prop('id')).toEqual("search-nominatum");

})
