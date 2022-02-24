import * as helpers from '@turf/helpers';

import { fetchData } from '../../utils';
import { DEV_URL, PRD_URL } from '../../Constants';

const URL = (process.env.NODE_ENV === 'development' ? DEV_URL : PRD_URL);

  /**
   * The logic here is simple even if the code is not:
   * Unique object of all "geography" with corresponding code in data[1]
   *
   * Then using turfjs generate geojson features using data[0] (json) values
   * and "geography" from the data[1].
   *
   * Then return the "collection"
   */

const fetchSPENSER = (callback) => {
  const fullURL = URL + '/api/spenser2';
  fetchData(fullURL, (data, error) => {
    console.log(data.length);

    if (!error && data[1]) {
      console.log(JSON.parse(data[1]))
      let collection = [];
      const map_code_point = {}
      JSON.parse(data[1]).features.forEach(f => {
        map_code_point[f.properties.Area] =
          f.geometry.coordinates
      })
      for (let index = 0; index < data[0].length; index++) {
        let e = data[0][index]; //just too large for forEach.
        const line = helpers.multiPolygon(
          map_code_point[e.c] // in the data Area is c for code
          , //properties next
          { code:e.c, age:e.a, sex: e.s, ethnicity: e.e, year: e.y }
        )
        collection.push(line)
      }
      collection = helpers.featureCollection(collection);
      console.log(collection);

      callback && callback(collection)
    } else {
      console.log(error);
    }
  })
}

const fetchQuant = (callback) => {
  const fullURL = URL + '/api/quant';
  // console.log(fullURL);

  fetchData(fullURL, (data, error) => {
    if (!error && data.length == 2) {
      // console.log(JSON.parse(data[1]))
      let collection = [];
      const map_code_point = {}
      JSON.parse(data[1]).features.forEach(f => {
        map_code_point[f.properties.msoa11cd] =
          f.geometry.coordinates
      })
      data[0].forEach(e => {
        const line = helpers.lineString([
          map_code_point[e.origin_msoacode],
          map_code_point[e.destination_msoacode],
        ], //properties next
          { base: +(e.base), hs2: +(e.data) }
        )
        if (line.geometry.coordinates[0] && line.geometry.coordinates[1]) {
          collection.push(line)
        }
      })
      collection = helpers.featureCollection(collection);
      // console.log(collection);

      callback && callback(collection, fullURL)
    } else {
      console.log(error);
    }
  })
}
export {
  fetchSPENSER,
  fetchQuant
}
