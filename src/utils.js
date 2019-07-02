import React from 'react';
import {
  ScatterplotLayer, HexagonLayer, GeoJsonLayer,
  IconLayer, ScreenGridLayer, GridLayer
} from 'deck.gl';
import mapping from './location-icon-mapping.json';
import qs from 'qs'; // warning: importing it otherways would cause minificatino issue.
import Constants from './Constants';

const getResultsFromGoogleMaps = (string, callback) => {

  if (typeof (string) === 'string' && typeof (callback) === 'function') {
    let fullURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" +
      string
      + "&key=WRONG_KEY";
    // console.log(fullURL);
    fetch(fullURL)
      .then((response) => {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }
        // Examine the text in the response
        response.json()
          .then((data) => {
            //rouch search results will do.
            if (data.results.length === 0 || response.status === 'ZERO_RESULTS') {
              callback(response.status);
            } else {
              callback(data.results[0].geometry.location)
            }
          });
      })
      .catch((err) => {
        console.log('Fetch Error :-S', err);
      });

  }
  //ignore
};

const fetchData = (url, callback) => {
  fetch(url) // [0] => "", [1] => roads and [2] => qfactor
    .then((response) => response.json())
    .then((responseJson) => {
      try {
        // const json = JSON.parse(responseJson);
        // console.log(json);
        callback(responseJson)
      } catch (error) {
        console.error(error);
      }
    })
    .catch((error) => {
      console.error(error);
      callback(null, error)
    });

}

const summariseByYear = (data) => {
  if (!data) return;
  //data = [{...data = 12/12/12}]       
  const map = new Map()
  data.forEach(feature => {
    const year = feature.properties.date.split("/")[2]
    if (map.get(year)) {
      map.set(year, map.get(year) + 1)
    } else {
      map.set(year, 1)
    }
  });
  return Array.from(map.keys()).sort().map(key => {
    return (
      {
        x: +(key),
        y: +(map.get(key))
      }
    )
  })
}

const generateDeckLayer = (name, data, renderTooltip, options) => {
  const addOptionsToObject = (opt, obj) => {
    Object.keys(opt).forEach(key =>
      obj[key] = opt[key]
    )
  }
  if (name === 'hex') {
    const hexObj = {
      id: 'hexagon-layer',
      data: data,
      pickable: true,
      extruded: true,
      radius: 100,
      elevationScale: 1,
      getPosition: d => d.geometry.coordinates,
      onHover: renderTooltip
    }
    addOptionsToObject(options, hexObj)
    return (new HexagonLayer(hexObj))
  } else if (name === 'hex') {
    const scatterObj = {
      id: 'scatterplot-layer',
      data,
      pickable: true,
      opacity: 0.8,
      radiusScale: 6,
      radiusMinPixels: 1,
      radiusMaxPixels: 100,
      getPosition: d => d.geometry.coordinates,
      getRadius: d => Math.sqrt(d.exits),
      getColor: d => [255, 140, 0],
      onHover: renderTooltip
    }
    addOptionsToObject(options, scatterObj)
    return (new ScatterplotLayer(scatterObj))
  } else if (name === 'geojson') {
    const geojsonObj = {
      id: 'geojson-layer',
      data,
      pickable: true,
      stroked: false,
      filled: true,
      extruded: true,
      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      getFillColor: [160, 160, 180, 200],
      getLineColor: [255, 160, 180, 200],
      getRadius: 100,
      getLineWidth: 1,
      getElevation: 30,
      onHover: renderTooltip
    }
    addOptionsToObject(options, geojsonObj)
    return (new GeoJsonLayer(geojsonObj))
  } else if (name === 'icon') {
    // console.log(data);

    //icon from https://github.com/uber/deck.gl/blob/8d5b4df9e4ad41eaa1d06240c5fddb922576ee21/website/src/static/images/icon-atlas.png
    const iconObj = {
      id: 'icon-layer',
      data,
      pickable: true,
      iconAtlas: 'location-icon-atlas.png',
      iconMapping: mapping,
      sizeScale: 15,
      getPosition: d => d.geometry.coordinates,
      getIcon: d => 'marker-1',
      getSize: d => 5,
      // getColor: d => [Math.sqrt(d.exits), 140, 0],
      onHover: renderTooltip
    }
    addOptionsToObject(options, iconObj)
    return (new IconLayer(iconObj))
  } else if (name === 'sgrid') {
    const sgridObject = {
      id: 'screen_grid',
      data,
      getPosition: d => d.geometry.coordinates,
      // getWeight: d => d.properties.weight,
      cellSizePixels: 4,
      // colorRange,
      // gpuAggregation,
      onHover: renderTooltip
    }
    addOptionsToObject(options, sgridObject)
    return (new ScreenGridLayer(sgridObject))
  } else if (name === 'grid') {
    const gridObject = {
      id: 'screen_grid',
      data,
      pickable: true,
      extruded: true,
      cellSize: 100,
      elevationScale: 4,
      getPosition: d => d.geometry.coordinates,
      onHover: renderTooltip
    }
    addOptionsToObject(options, gridObject)
    return (new GridLayer(gridObject))
  }
  return (null)
}

const getCentroid = (coords) => {
  let center = coords.reduce((x, y) => {
    return [x[0] + y[0] / coords.length, x[1] + y[1] / coords.length]
  }, [0, 0])
  center = [parseFloat(center[1].toFixed(3)), parseFloat(center[0].toFixed(3))]
  return center;
}

const convertRange = (oldValue = 2, values = {
  oldMax: 10, oldMin: 1,
  newMax: 1, newMin: 0
}) => {
  // thanks to https://stackoverflow.com/a/929107/2332101
  // OldRange = (OldMax - OldMin)  
  // NewRange = (NewMax - NewMin)  
  // NewValue = (((OldValue - OldMin) * NewRange) / OldRange) + NewMin
  return (((oldValue - values.oldMin) * (values.newMax - values.newMin)) / (values.oldMax - values.oldMin)) + values.newMin
}

const getParamsFromSearch = (search) => {
  if (!search) return (null);

  const qsResult = qs.parse(search.replace("?", ""))
  // 3 decimal points is street level
  const lat = Number(qsResult.lat).toFixed(3);
  const lng = Number(qsResult.lng).toFixed(3);
  return ({
    latitude: !isNaN(lat) ? Number(lat) : 53.8321,
    longitude: !isNaN(lng) ? Number(lng) : -1.6362,
    zoom: Number(qs.parse(search).zoom) || 10,
    pit: Number(qs.parse(search).pit) || 55,
    bea: Number(qs.parse(search).bea) || 0,
    alt: Number(qs.parse(search).alt) || 1.5,
  })
};

const getBbx = (bounds) => {
  if (!bounds) return null;
  // xmin = -1.6449
  // ymin = 53.82925
  // xmax = -1.6270
  // ymax = 53.8389
  let xmin = bounds._sw.lng;
  let xmax = bounds._ne.lng;
  let ymin = bounds._sw.lat;
  let ymax = bounds._ne.lat;
  if (xmin > xmax) {
    xmax = bounds._sw.lng;
    xmin = bounds._ne.lng;
  }
  if (ymin > ymax) {
    ymax = bounds._sw.lat;
    ymin = bounds._ne.lat;
  }
  return ({ xmin, ymin, xmax, ymax })
}

const suggestUIforNumber = (number) => {
  // "checkbox",     
  // "radio",        
  // "buttongroups", 
  // "dropdown",     
  // "slider"])      
  const { UI_LIST } = Constants;
  if (!number) return UI_LIST[1];
  if (number === 1) {
    return UI_LIST[0];
  } else if (number > 3 && number <= 6) {
    return UI_LIST[1];
  } else if (number === 2 || number === 3) {
    return UI_LIST[2];
  } else if (number > 9 && number < 15) {
    return UI_LIST[3];
  } else {
    return UI_LIST[4]; // slider
  }
}

const humanize = (str) => {
  let frags = str.split('_');
  for (let i = 0; i < frags.length; i++) {
    frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
  }
  return frags.join(' ');
}

const shortenName = (name) => {
  if (!name || name.length <= 26) return name;
  const extension = name.split('.').pop();
  let shorten = name;
  shorten.replace(extension, "");
  return (shorten.substring(0, 10) + "..." + extension);
}

const percentDiv = (title, left, cb) => {
  return (
    <div
      key={title}
      onClick={() => typeof (cb) === 'function' && cb()}
      style={{
        cursor: 'pointer',
        textAlign: 'center',
        position: 'relative',
        float: 'left',
        width: '30%',
        color: 'white',
        margin: '10px 2px',
        border: '1px solid gray',
      }}>
      <span style={{ position: 'absolute', left: '10%' }}>
        {title}
      </span>
      <div style={{
        width: left + '%',
        height: 20,
        // background: 'rgb(18, 147, 154)',
        background: 'rgb(200, 120, 0)'
      }}>
      </div>
    </div>
  )
}

const propertyCount = (data, key, list) => {
  if (!data) return;
  let sub_data = []; // match it with list
  data.forEach(feature => {
    Object.keys(feature.properties).forEach(each => {
      if (each === key) {
        const i = list.indexOf(feature.properties[each]);
        if (sub_data[i] &&
          sub_data[i].x === feature.properties[each]) {
          sub_data[i].y += 1;
        }
        else {
          sub_data[i] = { x: feature.properties[each], y: 1 };
        }
      }
    });
  });
  return sub_data;
}

export {
  getResultsFromGoogleMaps,
  getParamsFromSearch,
  suggestUIforNumber,
  generateDeckLayer,
  summariseByYear,
  propertyCount,
  convertRange,
  getCentroid,
  shortenName,
  percentDiv,
  fetchData,
  humanize,
  getBbx,
}