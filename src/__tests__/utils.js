import {firstLastNCharacters, humanize,
  colorScale, generateDomain, xyObjectByProperty,
  suggestDeckLayer, isURL,
  uniqueValuePercentage
} from '../utils/utils';
import { LAYERSTYLES } from '../Constants';

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
  expect(LAYERSTYLES).toContain(s)
})

const array = Array.from({length: 10}, (v, i) => i)

test("uniqueValuePercentage", () => {
  expect(uniqueValuePercentage(array)).toBe(true)
  expect(uniqueValuePercentage(
    array.concat(array)
  )).toBe(false)
  expect(uniqueValuePercentage(
    array.concat(array), 49 // it is 50 so true
  )).toBe(true)
})

test("isURL", () => {
  if(!Array.prototype.flat) {
    Object.defineProperty(Array.prototype, 'flat', {
      value: function(depth = 1) {
        return this.reduce(function (flat, toFlatten) {
          return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
        }, []);
      }
    });
  }
  const ll = ["http://localhost", "http://127.0.0.1"]
  const devURLS = ll.map(lh => [lh, lh+":8080", lh+":8000",
  lh+":5000", lh+":3000"]).flat()
  expect(isURL(ll[0])).toBe(true)
  devURLS.slice(-4).forEach(e => expect(isURL(e)).toBe(true))
})