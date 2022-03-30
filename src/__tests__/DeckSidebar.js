import React from 'react';
import { shallow } from 'enzyme';
import { Input } from 'baseui/input';

import DeckSidebar from '../components/decksidebar/DeckSidebar'
import Charts from '../components/decksidebar/Charts';
import { sampleGeojson } from './utils';

test('Shallow and mount - DeckSidebar', () => {
  const w = shallow(<DeckSidebar />);
  expect(w.find(Input).prop('id')).toEqual("search-nominatum");
  // console.log(w.debug())
  expect(w.text().includes('Nothing to show')).toBe(true)

})

test('Shallow and mount - Charts', () => {
  // see sampleGeojson for 'prop1'
  const w = shallow(
    <Charts
      data={sampleGeojson.features}
      column={'prop1'}/>
  );
  expect(w.find('SeriesPlot')).not.toBeNull();
  // console.log(w.state())
  expect(w.state()).toEqual({multiVarSelect: undefined})

})
