import { sample } from 'underscore';
import {firstLastNCharacters, humanize,
  colorScale, generateDomain, xyObjectByProperty,
  suggestDeckLayer
} from '../utils';
import { LAYERS } from '../components/settings/settingsUtils';

const sampleGeojson = { "type": "FeatureCollection",
"features": [
  { "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [102.0, 0.5]},
    "properties": {
      "prop0": "value0",
      "prop1": -1
    }
    },
  { "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
        ]
      },
    "properties": {
      "prop0": "value1",
      "prop1": 0.0
      }
    },
  { "type": "Feature",
     "geometry": {
       "type": "Polygon",
       "coordinates": [
         [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
           [100.0, 1.0], [100.0, 0.0] ]
         ]

     },
     "properties": {
       "prop0": "value0",
       "prop1": 1.0
       }
     }
  ]
}

test('firstLastNCharacters', () => {
  expect(firstLastNCharacters("abcdefg")).toEqual("abcde...")
  expect(firstLastNCharacters("abcdefghijk"))
  .toEqual("abcde...ghijk")
  expect(firstLastNCharacters("I am the only person"))
  .toEqual("I am ...erson")
})

test("humanize", () => {
  expect(humanize("foo")).toEqual("Foo")
})

test("colorScale", () => {
  // console.log(colorScale(1,[1,2]));
  // [255, 247, 236, 180]
  expect(colorScale(1,[1,2])).toEqual([255, 247, 236, 180])
})

test("generateDomain", () => {
  // console.log(generateDomain(sampleGeojson.features, "prop1"))
  expect(generateDomain(sampleGeojson)).toBeUndefined();
  // column missing
  expect(generateDomain(sampleGeojson.features)).toBeUndefined();
  expect(generateDomain(sampleGeojson.features, "prop0"))
  .toContain("value0")
})

test("xyObjectByProperty", () => {
  expect(xyObjectByProperty(sampleGeojson.features, "prop0"))
  .toHaveLength(2)
})

test("suggestDeckLayer", () => {
  const s = suggestDeckLayer(sampleGeojson.features)
  expect(LAYERS).toContain(s)
})