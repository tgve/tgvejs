import React from 'react';
import { shallow } from 'enzyme';
import { Notification } from 'baseui/notification';

import RBAlert from '../components/RBAlert'

test('Shallow and mount', () => {
  // needs alert object to render
  const m = shallow(<RBAlert alert={{content: "message"}}/>);
  expect(m.find(Notification).prop('kind')).toEqual("warning");

})
