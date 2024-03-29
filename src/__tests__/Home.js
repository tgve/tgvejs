import React from 'react';
import { render, screen } from '@testing-library/react'

import Home from '../home';
import {
  generateLayer,
  // getViewPort must be mocked
} from '../home/util';
import { sampleGeojson } from './utils';
import { LAYERS } from '../components/settings/settingsUtils';
import { screenshot } from '../utils/utils';
import { DECK_LAYER_NAMES } from '../Constants';

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

jest.mock('../utils/utils', () => {
  const originalModule = jest.requireActual('../utils/utils')
  return {
    __esModule: true,
    ...originalModule,
    // just return the state viewport
    screenshot: jest.fn(() => {})
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

test('Home - layers', async () => {
  // screen.debug()
  DECK_LAYER_NAMES.forEach(layer => {
    render(<Home layerName={layer} data={sampleGeojson} />)
  })
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

test('Home generateLayer works', () => {
  let result = generateLayer(
    {}, {}, () => { }
  )
  expect(result).toBeUndefined()

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

// test('Home take screenshot', async () => {
//   await render(<Home data={sampleGeojson} />)
//   // let iTags = await container.querySelectorAll('i')
//   // querySelector can find tag names
//   screenshot(
//     {getCanvas:() => ({
//       width: 600, height: 400
//     }),},
//     {redraw: () => {}},
//     () => {}
//   )
//   // above fails and jest-mock-canvas
//   // did not help so stop here.
// })

test("Home call mock screenshot", () => {
  screenshot()
  expect(screenshot).toHaveBeenCalled()
})

test("Home geo & csv", () => {
  const unmocked = global.fetch

  global.fetch = () =>
    Promise.resolve({
      json: () => Promise.resolve(sampleGeojson),
      text: () => Promise.resolve(`
        ranking,la_code,name,ranking_count
        Good,E06000001,Hartlepool,32
        Good,E06000002,Middlesbrough,54
        Good,E06000003,Redcar and Cleveland,44
      `),

    })
  const gurl = "https://raw.githubusercontent.com/saferactive/tgve/main/las-only-code.geojson"
  const durl = "https://raw.githubusercontent.com/tgve/example-data/main/schools/data.csv"
  render(<Home
    geographyURL={gurl}
    defaultURL={durl}
    geographyColumn="la_code" />)

  global.fetch = unmocked
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

test('onStateChange callback works', async () => {
  const callback = jest.fn(() => {})
  await render(
    <Home
      onStateChange={callback}
      data={sampleGeojson}
      hideSidebar={true} />)

  expect(callback).toHaveBeenCalled()
})

test('onViewStateChange callback works', async () => {
  const callback = jest.fn(() => {})
  await render(
    <Home
      onViewStateChange={callback}
      data={sampleGeojson}
      hideSidebar={true} />)
  // because in tests we do not call
  // viewport update callback is never reached
  expect(callback).not.toHaveBeenCalled()
})
