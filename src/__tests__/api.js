import { apiToReactApp, jsonFromKeySetObject, keySetObject, TGVE_API } from '../utils/api';

test("keySetObject is valid", () => {
  expect(keySetObject("{not:['valid']}")).toBeNull()
  expect(keySetObject(null)).toBeNull()
  let str = `{"key1": ["val1"], "key2": ["val2"]}`
  const set1 = keySetObject(str)
  str = `key1:val1:key2:val2`
  const set2 = keySetObject(str)
  expect(Object.keys(set1)).toEqual(Object.keys(set2))
  expect(Object.values(set1)).toEqual(Object.values(set2))

})

test("jsonFromKeySetObject is valid", () => {
  const m = {a: new Set([1,2]), b: new Set([3,4])}
  const r = jsonFromKeySetObject(m)
  expect(JSON.stringify(r)).toEqual('{\"a\":[1,2],\"b\":[3,4]}')
  expect(jsonFromKeySetObject()).toEqual({})
})

test("apiToReactApp works", () => {
  const RA_V = [
    'REACT_APP_DEFAULT_URL',
    'REACT_APP_GEOGRAPHY_URL',
    'REACT_APP_GEOGRAPHY_COLUMN',
    'REACT_APP_COLUMN',
    'REACT_APP_LAYER_NAME',
    'REACT_APP_TOOLTIP_COLUMNS',
    'REACT_APP_VIEWPORT',
    'REACT_APP_DATA',
    'REACT_APP_DARK',
    'REACT_APP_HIDE_CHART_GENERATOR',
    'REACT_APP_HIDE_CHARTS',
    'REACT_APP_HIDE_SIDEBAR',
    'REACT_APP_SELECT'
    //ignore
    // leftSidebarContent
    // onViewStateChange
    // onStateChange
  ]

  Object.keys(TGVE_API).slice(0, -3)
    .forEach((e, i) => {
      expect(apiToReactApp(e)).toEqual(RA_V[i])
    });
})
