import React from 'react';
import {
  ScatterplotLayer, HexagonLayer, GeoJsonLayer,
  IconLayer, ScreenGridLayer, GridLayer, LineLayer
} from 'deck.gl';
import { interpolateSinebow } from 'd3-scale-chromatic';

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
    .then((response) => response.text())
    .then((response) => {
      try {
        const json = JSON.parse(response);
        // console.log(json);
        callback(json)
      } catch (error) {
        callback(undefined, error)
      }
    })
    .catch((error) => {
      console.error(error);
      callback(null, error)
    });

}

const xyObjectByProperty = (data, property) => {
  if (!data || !property) return;
  //data = [{...data = 12/12/12}]       
  const map = new Map()
  data.forEach(feature => {
    let value = feature.properties[property];    
    if(typeof(value) === 'string' && value.split("/")[2]) {
      value = value.split("/")[2]
    }
    if (map.get(value)) {
      map.set(value, map.get(value) + 1)
    } else {
      map.set(value, 1)
    }
  });
  const sortedMap = typeof Array.from(map.keys())[0] === 'number' ?
  Array.from(map.keys()).sort() : Array.from(map.keys())
  console.log(sortedMap);
  
  return sortedMap.map(key => {
    return (
      {
        x: typeof key === 'number' ? +(key) : key,
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
  } else if (name === 'line') {
    const lineObject = {
      id: 'line-layer',
      data,
      pickable: true,
      getWidth: 100,
      getPosition: d => d.geometry.coordinates,
      onHover: renderTooltip
    }
    addOptionsToObject(options, lineObject)
    return (new LineLayer(lineObject))
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

const suggestDeckLayer = (geojson) => {
  // basic version should suggest a layer
  // based on the geojson data types
  // go through each feature? in case of features.

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

/**
 * Changes a `_` separated `str` to space separated and
 * camel cases all words
 * 
 * @param {*} str 
 */
const humanize = (str) => {
  if (!str) return str
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
        background: 'rgb(18, 147, 154)',
        // background: 'rgb(200, 120, 0)'
      }}>
      </div>
    </div>
  )
}

/**
 * Thanks to https://stackoverflow.com/a/34695026/2332101
 * @param {*} str 
 */
const isURL = (str) => {
  var a = document.createElement('a');
  a.href = str;
  return (a.host && a.host !== window.location.host);
}

const isMobile = function () {
  var check = false;
  (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

const colorScale = (d, features, p = 0) => {
  if (!d || !features || features.length === 0) return null;
  const x = Object.keys(d.properties)[p];
  let domain = features.map(feature => feature.properties[x])
  domain = Array.from(new Set(domain))
  // console.log(d, d.properties[x], domain);
  const index = domain.indexOf(d.properties[x])
  const col = interpolateSinebow(index / domain.length);
  return col.substring(4, col.length - 1)
    .replace(/ /g, '')
    .split(',');
}

const colorRangeNames = ['inverseDefault', 'yellowblue', 'greens',
'oranges', 'diverge', 'default'];

const colorRanges = (name) => {
  if (!name) return
  const colors = {
    yellowblue: [
      [255, 255, 204],
      [199, 233, 180],
      [127, 205, 187],
      [65, 182, 196],
      [44, 127, 184],
      [37, 52, 148]
    ],
    greens: [
      [237, 248, 233],
      [199, 233, 192],
      [161, 217, 155],
      [116, 196, 118],
      [49, 163, 84],
      [0, 109, 44],
    ],
    oranges: [
      [254, 237, 222],
      [253, 208, 162],
      [253, 174, 107],
      [253, 141, 60],
      [230, 85, 13],
      [166, 54, 3],
    ],
    diverge: [
      [140, 81, 10],
      [216, 179, 101],
      [246, 232, 195],
      [199, 234, 229],
      [90, 180, 172],
      [1, 102, 94]
    ],
    inverseDefault: [
      [189, 0, 38],
      [240, 59, 32],
      [253, 141, 60],
      [254, 178, 76],
      [254, 217, 118],
      [255, 255, 178]
    ],
    default: [
      [255, 255, 178],
      [254, 217, 118],
      [254, 178, 76],
      [253, 141, 60],
      [240, 59, 32],
      [189, 0, 38],
    ]
  }
  return (colors[name])
}

const iconJSType = (dataType) => {
  // describeGeojson in geojsonutils
  // String, Number, Boolean and Object
  if(!dataType) return(null)  
  switch(dataType) {
    case "String":
      dataType = "fa fa-globe";
      break;
    case "Number":
      dataType = "fa fa-list";
      break;
    case "Object":
      dataType = "fa fa-sack";
      break;
    default:
      dataType = "fa fa-question-circle";
  }
  return dataType
}
export {
  getResultsFromGoogleMaps,
  getParamsFromSearch,
  suggestUIforNumber,
  generateDeckLayer,
  suggestDeckLayer,
  xyObjectByProperty,
  colorRangeNames,
  convertRange,
  getCentroid,
  shortenName,
  colorRanges,
  percentDiv,
  iconJSType,
  colorScale,
  fetchData,
  humanize,
  isMobile,
  getBbx,
  isURL,
}