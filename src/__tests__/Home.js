import React from 'react';
import { render, screen } from '@testing-library/react'

import Home from '../home';
import {
  generateLayer,
  // getViewPort must be mocked
} from '../home/util';
import { sampleGeojson } from './utils';
import { LAYERS } from '../components/settings/settingsUtils';

// see https://jestjs.io/docs/mock-functions
jest.mock('../home/util', () => {
  const originalModule = jest.requireActual('../home/util')
  return {
    __esModule: true,
    ...originalModule,
    // just return the state viewport
    getViewPort: jest.fn((state) => state.viewport)
  }
})

test('Home shallow and mount', async () => {
  await render(<Home location={{ search: null }} />)
  // screen.debug()
  /**
   * 1. there is the main message
   * 2. there is add data button
   * 3. there is the fly to search
   *
   */
  expect(await screen
    .queryByRole("heading")
    .textContent)
    .toBe("Nothing to show");

  expect(await screen
    .queryByRole("button")
    .textContent)
    .toBe("Add data")

  expect(await screen
    .getByPlaceholderText(/fly to/)
    .textContent)
    .toBe("")
})

test('Home - show Charts', async () => {
  await render(<Home data={sampleGeojson} />)
  // screen.debug()

  expect(await screen
    .queryByRole("heading", { level: 2 })
    .textContent)
    .toBe("3 rows");
  expect((await screen
    .findByText(/generate/i))
    // await before getting textContent
    .textContent)
    .toBe('Generate graphs from columns')
  expect(await screen
    .findByText(/vis/i))
    .toBeInTheDocument()
})

test('Home - hide Charts', async () => {
   await render(
  <Home data={sampleGeojson} hideSidebar={true}/>)

  // screen.debug()
  expect(await screen
    .queryByRole("heading", { level: 2 }))
    .toBeNull()
  expect(await screen
    .queryByRole("heading", { level: 6 }))
    .toBeNull()
  // above must be used as below will generate
  // test error
  // https://timdeschryver.dev/blog/making-sure-youre-using-the-correct-query#byrole-provides-a-solution-to
  // expect(await screen
  //   .findByText(/generate/i))
  //   .toEqual({})
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
