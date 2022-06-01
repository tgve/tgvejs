import {firstLastNCharacters, humanize,
  colorScale, generateDomain, xyObjectByProperty,
  suggestDeckLayer, isURL,
  uniqueValuePercentage,
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
    // eslint-disable-next-line no-extend-native
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

test("updateHistory works", () => {
  // TODO: either call updateHistory from
  // react-test-renderer or via
  // testing-library/react
  const mockHistoryPush = jest.fn();

  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
      push: mockHistoryPush,
    }),
  }));
  //expect(history.location).toBeUndefined()
  // updateHistory({defaultURL: "blah"})
  // console.log("Here is the history:", mockHistoryPush)
})

const sample20CasualtiesGeojson = {
  "type": "FeatureCollection",
  "name": "casualties_20",
  "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  "features": [
  { "type": "Feature", "properties": { "date": "2013-04-11", "day_of_week": "Thursday", "accident_severity": "Slight", "road_type": "Single carriageway", "speed_limit": 30, "datetime": "2013-04-11 11:40:00+00", "age_of_casualty": null, "sex_of_casualty": "Female", "sex_of_driver": "" }, "geometry": { "type": "Point", "coordinates": [ -0.141282, 51.539844 ] } },
  { "type": "Feature", "properties": { "date": "2018-05-03", "day_of_week": "Thursday", "accident_severity": "Slight", "road_type": "Dual carriageway", "speed_limit": 30, "datetime": "2018-05-03 22:15:00+00", "age_of_casualty": 33, "sex_of_casualty": "Male", "sex_of_driver": "" }, "geometry": { "type": "Point", "coordinates": [ -0.119207, 51.515537 ] } },
  { "type": "Feature", "properties": { "date": "2011-11-11", "day_of_week": "Friday", "accident_severity": "Slight", "road_type": "Dual carriageway", "speed_limit": 30, "datetime": "2011-11-11 23:30:00+00", "age_of_casualty": null, "sex_of_casualty": "Female", "sex_of_driver": "Male" }, "geometry": { "type": "Point", "coordinates": [ -0.122569, 51.531992 ] } },
  { "type": "Feature", "properties": { "date": "2013-02-18", "day_of_week": "Monday", "accident_severity": "Slight", "road_type": "Single carriageway", "speed_limit": 30, "datetime": "2013-02-18 22:00:00+00", "age_of_casualty": null, "sex_of_casualty": "Male", "sex_of_driver": "Male" }, "geometry": { "type": "Point", "coordinates": [ -0.187506, 51.516107 ] } },
  { "type": "Feature", "properties": { "date": "2011-12-15", "day_of_week": "Thursday", "accident_severity": "Slight", "road_type": "Single carriageway", "speed_limit": 30, "datetime": "2011-12-15 15:00:00+00", "age_of_casualty": null, "sex_of_casualty": "Male", "sex_of_driver": "" }, "geometry": { "type": "Point", "coordinates": [ -0.154631, 51.441494 ] } },
  { "type": "Feature", "properties": { "date": "2014-06-28", "day_of_week": "Saturday", "accident_severity": "Slight", "road_type": "Single carriageway", "speed_limit": 30, "datetime": "2014-06-28 13:57:00+00", "age_of_casualty": 16, "sex_of_casualty": "Male", "sex_of_driver": "Male" }, "geometry": { "type": "Point", "coordinates": [ -0.210127, 51.527336 ] } },
  { "type": "Feature", "properties": { "date": "2018-05-09", "day_of_week": "Wednesday", "accident_severity": "Slight", "road_type": "One way street", "speed_limit": 30, "datetime": "2018-05-09 11:20:00+00", "age_of_casualty": 51, "sex_of_casualty": "Male", "sex_of_driver": "" }, "geometry": { "type": "Point", "coordinates": [ 0.0042, 51.539212 ] } },
  { "type": "Feature", "properties": { "date": "2017-11-22", "day_of_week": "Wednesday", "accident_severity": "Slight", "road_type": "Dual carriageway", "speed_limit": 30, "datetime": "2017-11-22 08:28:00+00", "age_of_casualty": 42, "sex_of_casualty": "Male", "sex_of_driver": "Not known" }, "geometry": { "type": "Point", "coordinates": [ -0.079797, 51.523891 ] } },
  { "type": "Feature", "properties": { "date": "2013-11-07", "day_of_week": "Thursday", "accident_severity": "Slight", "road_type": "Single carriageway", "speed_limit": 30, "datetime": "2013-11-07 19:30:00+00", "age_of_casualty": null, "sex_of_casualty": "Female", "sex_of_driver": "" }, "geometry": { "type": "Point", "coordinates": [ -0.016624, 51.604259 ] } },
  { "type": "Feature", "properties": { "date": "2018-10-07", "day_of_week": "Sunday", "accident_severity": "Slight", "road_type": "Dual carriageway", "speed_limit": 30, "datetime": "2018-10-07 11:05:00+00", "age_of_casualty": 46, "sex_of_casualty": "Male", "sex_of_driver": "Female" }, "geometry": { "type": "Point", "coordinates": [ 0.063245, 51.578925 ] } },
  { "type": "Feature", "properties": { "date": "2013-02-11", "day_of_week": "Monday", "accident_severity": "Slight", "road_type": "Single carriageway", "speed_limit": 30, "datetime": "2013-02-11 18:55:00+00", "age_of_casualty": null, "sex_of_casualty": "Male", "sex_of_driver": "" }, "geometry": { "type": "Point", "coordinates": [ -0.098022, 51.501741 ] } },
  { "type": "Feature", "properties": { "date": "2012-10-25", "day_of_week": "Thursday", "accident_severity": "Slight", "road_type": "Single carriageway", "speed_limit": 30, "datetime": "2012-10-25 11:00:00+00", "age_of_casualty": null, "sex_of_casualty": "Male", "sex_of_driver": "Male" }, "geometry": { "type": "Point", "coordinates": [ -0.203838, 51.533264 ] } },
  { "type": "Feature", "properties": { "date": "2018-05-19", "day_of_week": "Saturday", "accident_severity": "Serious", "road_type": "One way street", "speed_limit": 20, "datetime": "2018-05-19 08:20:00+00", "age_of_casualty": 31, "sex_of_casualty": "Male", "sex_of_driver": "" }, "geometry": { "type": "Point", "coordinates": [ -0.122335, 51.534112 ] } },
  { "type": "Feature", "properties": { "date": "2012-04-22", "day_of_week": "Sunday", "accident_severity": "Slight", "road_type": "Dual carriageway", "speed_limit": 30, "datetime": "2012-04-22 01:30:00+00", "age_of_casualty": null, "sex_of_casualty": "Male", "sex_of_driver": "" }, "geometry": { "type": "Point", "coordinates": [ -0.100525, 51.493507 ] } },
  { "type": "Feature", "properties": { "date": "2017-03-28", "day_of_week": "Tuesday", "accident_severity": "Slight", "road_type": "Single carriageway", "speed_limit": 30, "datetime": "2017-03-28 13:54:00+00", "age_of_casualty": 20, "sex_of_casualty": "Male", "sex_of_driver": "" }, "geometry": { "type": "Point", "coordinates": [ -0.010869, 51.481375 ] } },
  { "type": "Feature", "properties": { "date": "2009-11-04", "day_of_week": "Wednesday", "accident_severity": "Slight", "road_type": "Single carriageway", "speed_limit": 30, "datetime": "2009-11-04 15:40:00+00", "age_of_casualty": null, "sex_of_casualty": "Male", "sex_of_driver": "" }, "geometry": { "type": "Point", "coordinates": [ -0.082845, 51.496007 ] } },
  { "type": "Feature", "properties": { "date": "2014-01-15", "day_of_week": "Wednesday", "accident_severity": "Slight", "road_type": "Dual carriageway", "speed_limit": 30, "datetime": "2014-01-15 09:09:00+00", "age_of_casualty": 35, "sex_of_casualty": "Female", "sex_of_driver": "" }, "geometry": { "type": "Point", "coordinates": [ -0.116593, 51.50213 ] } },
  { "type": "Feature", "properties": { "date": "2014-03-03", "day_of_week": "Monday", "accident_severity": "Slight", "road_type": "Dual carriageway", "speed_limit": 30, "datetime": "2014-03-03 20:20:00+00", "age_of_casualty": 31, "sex_of_casualty": "Male", "sex_of_driver": "" }, "geometry": { "type": "Point", "coordinates": [ -0.012629, 51.530361 ] } },
  { "type": "Feature", "properties": { "date": "2016-12-02", "day_of_week": "Friday", "accident_severity": "Slight", "road_type": "One way street", "speed_limit": 30, "datetime": "2016-12-02 07:15:00+00", "age_of_casualty": 49, "sex_of_casualty": "Male", "sex_of_driver": "Male" }, "geometry": { "type": "Point", "coordinates": [ 0.13056, 51.570833 ] } },
  { "type": "Feature", "properties": { "date": "2017-12-02", "day_of_week": "Saturday", "accident_severity": "Slight", "road_type": "Single carriageway", "speed_limit": 30, "datetime": "2017-12-02 15:17:00+00", "age_of_casualty": 51, "sex_of_casualty": "Female", "sex_of_driver": "" }, "geometry": { "type": "Point", "coordinates": [ -0.112261, 51.498789 ] } }
  ]
}
export {
  sampleGeojson,
  sample20CasualtiesGeojson
}
