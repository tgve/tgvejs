import * as helpers from '@turf/helpers';

import { fetchData } from '../../utils';
import { DEV_URL, PRD_URL } from '../../Constants';

const URL = (process.env.NODE_ENV === 'development' ? DEV_URL : PRD_URL);

const fetchQuant = (callback) => {
  const fullURL = URL + '/api/quant';
  console.log(fullURL);

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
      
      callback && callback(collection)
    } else {
      console.log(error);
    }
  })
}

export {
  fetchQuant
}