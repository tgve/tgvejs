import React from 'react';
import { shallow } from 'enzyme';
import { Input } from 'baseui/input';

import URL from '../components/URL'

test('Shallow and mount', () => {
  //header not tested in npm
  const m = shallow(<URL />);
  expect(m.find(Input).prop('id')).toEqual("url-input");

})
