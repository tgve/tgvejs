import React from 'react';
import { shallow } from 'enzyme';
// import { BrowserRouter } from 'react-router-dom';

import Home from '../home';
import { generateLayer } from '../home/util';
import { sampleGeojson } from './utils';
import { LAYERS } from '../components/settings/settingsUtils';
// import DeckGL from 'deck.gl';
const w = shallow(<Home location={{ search: null }} />);

test('Home shallow and mount', () => {
  // console.log(w.debug())
  expect(w.find('DeckGL')).not.toBeNull();
  expect(w.find('InteractiveMap')).not.toBeNull();
  expect(w.find("div.loader").length).toBe(1)
})

test('Home child DeckSidebarContainer', () => {
  const wd = shallow(<Home hideCharts={true} />);
  const ds = wd.find('div').find('DeckSidebarContainer');
  // console.log(ds.debug());
  expect(ds.props().hideCharts).toBe(true)
})

test('generateLayer works', () => {
  let result = generateLayer(
    {}, {}, () => { }
  )
  expect(result).toBeUndefined

  result = generateLayer(
    {},
    { data: sampleGeojson },
    { multiVarSelect: {} },
    () => { }
  )
  expect(
    result.filtered.length === sampleGeojson.features.length
  ).toBe(true)
  expect(LAYERS).toContain(result.layerName)
  expect(['polygon', 'line', 'point'])
    .toContain(result.geomType)
  expect(result.alert).toBe(null)
})

test("spatial filterGeojson works", () => {
  // see sampleGeojson for the lng/lats used below
  const noResult = {
    "_sw": {
      "lng": 0,
      "lat": 100
    },
    "_ne": {
      "lng": 1,
      "lat": 101
    }
  }
  const oneResult = {
    "_sw": {
      "lng": 100,
      "lat": 0
    },
    "_ne": {
      "lng": 101,
      "lat": 1
    }
  }
  const value = {
    filter: {
      what: "boundsSubset",
      bounds: noResult
    }
  }
  let result = generateLayer(
    value,                    // filtering object
    { data: sampleGeojson },  // props
    { multiVarSelect: {} }    // state
  )
  const e = {
    loading: false,
    alert: { content: 'Filtering returns no results' }
  }
  expect(result).toEqual(e)

  value.filter.bounds = oneResult
  result = generateLayer(
    value,
    { data: sampleGeojson },
    { multiVarSelect: {} }
  )
  expect(result.filtered.length).toBe(1)
})
