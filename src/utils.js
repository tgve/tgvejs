import React from 'react';
import {
  ScatterplotLayer, HexagonLayer, GeoJsonLayer,
  IconLayer, ScreenGridLayer, GridLayer, LineLayer
} from 'deck.gl';
import {
  interpolateOrRd, schemeBlues
} from 'd3-scale-chromatic';

import qs from 'qs'; // warning: importing it otherways would cause minificatino issue.

import mapping from './location-icon-mapping.json';
import Constants from './Constants';
import { isString, isNumber } from './JSUtils.js';
import IconClusterLayer from './icon-cluster-layer';
import { ArcLayer } from '@deck.gl/layers';

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

/**
 * Function to count frequency of values of `property` given.
 * 
 * TODO: Double check to see if it is slightly different
 * version of propertyCount
 * 
 * 
 * @param {Object} data 
 * @param {String} property 
 * @param {Boolean} noNulls 
 */
const xyObjectByProperty = (data, property, noNulls = true) => {
  if (!data || !property) return;
  //data = [{...data = 12/12/12}]       
  const map = new Map()
  data.forEach(feature => {
    let value = feature.properties[property];
    if (typeof (value) === 'string' && value.split("/")[2]) {
      value = value.split("/")[2]
    }
    if (noNulls && value !== null) { // remove nulls here
      if (map.get(value)) {
        map.set(value, map.get(value) + 1)
      } else {
        map.set(typeof value === 'number' ? +(value) : value, 1)
      }
    }
  });
  const sortedMap = typeof Array.from(map.keys())[0] === 'number' ?
    Array.from(map.keys()).sort() : Array.from(map.keys())

  return sortedMap.map(key => {
    return (
      {
        x: key,
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
      sizeScale: 60,
      getPosition: d => d.geometry.coordinates,
      wrapLongitude: true,
      // getIcon: d => 'marker-1',
      // getSize: d => 5,
      // getColor: d => [Math.sqrt(d.exits), 140, 0],
      onHover: renderTooltip
    }
    addOptionsToObject(options, iconObj)
    return (new IconClusterLayer(iconObj))
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
      onHover: renderTooltip
    }
    addOptionsToObject(options, lineObject)
    return (new LineLayer(lineObject))
  } else if (name == 'arc') {
    const arcObject = {
      id: 'arc-layer',
      data,
      pickable: true,
      // getSourcePosition: d => d.geometry.coordinates[0],
      // getTargetPosition: d => d.geometry.coordinates[1],
    }
    addOptionsToObject(options, arcObject)
    return (new ArcLayer(arcObject))
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
  let value = (((oldValue - values.oldMin) * (values.newMax - values.newMin))
    / (values.oldMax - values.oldMin)) + values.newMin
  return +value.toFixed(2)
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

const shortenName = (name, n = 26) => {
  if (isNumber(name)) {
    return parseFloat(Number.parseFloat(name).toFixed(2).toString())
  }
  if (!name || name.length <= n || !isString(name)) return name;
  let shortened = name.trim();
  const extension = name.split('.').length > 1 &&
    name.split('.').pop().length < 10 && name.split('.').pop();
  shortened.replace(extension, "");
  if (name.length > 10) {
    shortened = shortened.substring(0, 10) + "..." + (extension || "")
  }
  return (shortened);
}

const percentDiv = (title, left, cb, dark) => {
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
        color: dark ? 'white' : 'black',
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
  if (window.innerWidth < 640) return true;
  (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

function hexToRgb(hex) {
  let bigint = parseInt(hex.substring(1, hex.length), 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  return 'rgb(' + r + "," + g + "," + b + ")";
}

/**
 * Generate colour scale for unique set of values
 * based on the index of the values in an array.
 * 
 * @param {object} d particular property to get color for from features
 * @param {*} features features in a geojson featureset
 * @param {*} p index/name of column to generate color scale with
 */
const colorScale = (d, features, p = 0) => {
  if (!d || !features || features.length === 0) return null;
  const x = isNumber(p) ? Object.keys(d.properties)[p] : p;
  let domainIsNumeric = true;
  let domain = features.map(feature => {
    // uber move to show isochrones
    const i = feature.properties[x];
    if (isNumber(i) &&
      p === 'Mean.Travel.Time..Seconds.') {
      return (Math.floor(i / 300))
    } else if (domainIsNumeric && !isNumber(i)) {
      // stop getting here if already been
      domainIsNumeric = false;
    }
    return isNumber(i) ? +(i) : i
  })
  domain = Array.from(new Set(domain))
  // sort the domain if possible
  if (domainIsNumeric) {
    domain = domain.sort((a, b) => { return (a - b) })
  }
  const index = domain.indexOf(isNumber(d.properties[x]) &&
    p === 'Mean.Travel.Time..Seconds.' ?
    Math.floor(d.properties[x] / 300) : d.properties[x])
  // console.log(domain, index)
  let col = interpolateOrRd(index / domain.length);
  col = col.substring(4, col.length - 1)
    .replace(/ /g, '')
    .split(',');
  return col
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
  // describeFeatureVariables in geojsonutils
  // String, Number, Boolean and Object
  if (!dataType) return (null)
  switch (dataType) {
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

const searchNominatom = (location, callback) => {
  const url = "https://nominatim.openstreetmap.org/search/" +
    location + "?format=json";
  fetchData(url, (json) => {
    typeof callback === 'function' && callback(json)
  })
}

const ATILOGO = (dark = true) => (
  <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
    <g id="ATI_logo_black_ATI_logo_black_W1024px" fill={dark ? "#ffffff" : '#000000'}>
      <g id="logo-line-1" data-svg-origin="0.8190000057220459 0.7929999828338623" transform="matrix(1,0,0,1,0,0)" style={{ zIndex: 0, visibility: 'inherit', opacity: 1 }}>
        <path d="M273.346,71.521 L233.737,71.521 C235.771,58.945 242.738,52.485 253.966,52.485 C265.183,52.485 272.837,60.128 273.346,71.521 M299.694,83.932 C299.694,52.816 282.185,33.27 254.131,33.27 C226.425,33.27 207.72,52.816 207.72,81.718 C207.72,111.985 226.08,131.363 254.983,131.363 C277.938,131.363 293.744,120.479 299.529,100.424 L272.495,100.424 C269.775,107.735 263.987,111.475 255.493,111.475 C242.573,111.475 234.588,103.654 233.902,90.05 L299.529,90.05 C299.694,87.327 299.694,84.948 299.694,83.932" id="Fill-13"></path>
        <path d="M117.531,128.642 L143.027,128.642 L143.027,83.08 C143.027,63.192 148.647,53.667 160.371,53.667 C171.081,53.667 175.162,59.62 175.162,74.751 L175.162,128.642 L200.658,128.642 L200.658,72.031 C200.658,57.749 198.622,50.437 193.181,44.156 C187.738,37.861 178.392,33.78 169.209,33.78 C159.354,33.78 149.664,38.713 143.027,47.042 L143.027,0.793 L117.531,0.793 L117.531,128.642" id="Fill-12"></path>
        <polyline id="Fill-11" points="55.645 0.796 0.819 0.796 0.819 23.242 42.3 23.242 42.3 128.632 69.158 128.632 69.158 23.242 110.474 23.242 110.474 0.796 55.645 0.796"></polyline>
      </g>
      <g id="logo-line-2" transform="matrix(1,0,0,1,169,149)" data-svg-origin="0.9760000109672546 0.0860000029206276" style={{ zIndex: 0, visibility: 'inherit', opacity: 1 }}>
        <path d="M831.16,79.656 C831.16,94.445 823.69,104.3 812.635,104.3 C801.586,104.3 794.45,94.279 794.45,78.804 C794.45,63.671 801.928,53.308 812.814,53.308 C824.03,53.308 831.16,63.506 831.16,79.656 M855.82,108.724 L855.82,35.289 L832.87,35.289 L832.87,46.848 C825.9,37.158 818.078,33.076 807.029,33.076 C784.253,33.076 768.268,52.112 768.268,78.97 C768.268,106.169 783.222,124.202 805.668,124.202 C817.571,124.202 825.05,120.451 831.85,111.281 L831.85,120.972 C831.85,137.794 826.24,145.106 813.486,145.106 C804.306,145.106 798.025,140.515 797.504,133.382 L772.173,133.382 C773.877,152.076 789.175,163.125 813.145,163.125 C835.42,163.125 849.19,154.121 853.95,136.268 C855.65,129.631 855.82,127.087 855.82,108.724" id="Fill-22"></path>
        <path d="M701.193,35.283 L676.88,35.283 L676.88,127.932 L702.389,127.932 L702.389,79.994 C702.389,61.465 707.819,52.792 719.557,52.792 C724.997,52.792 729.589,55.349 732.133,59.417 C733.836,62.482 734.346,65.547 734.346,73.534 L734.346,127.932 L759.842,127.932 L759.842,75.402 C759.842,58.91 758.825,52.957 755.085,47.007 C749.476,38.168 739.951,33.249 728.227,33.249 C716.834,33.249 707.144,38.168 701.193,46.841 L701.193,35.283" id="Fill-21"></path>
        <path d="M637.104,24.567 L662.601,24.567 L662.601,0.088 L637.104,0.088 L637.104,24.567 Z M637.104,127.938 L662.601,127.938 L662.601,35.285 L637.104,35.285 L637.104,127.938 Z" id="Fill-20"></path>
        <path d="M569.69,127.936 L595.186,127.936 L595.186,86.965 C595.186,64.189 601.991,55.339 619.334,55.339 C622.055,55.339 623.747,55.515 626.467,56.191 L626.467,34.09 C624.089,33.238 622.564,33.073 619.676,33.073 C608.106,33.073 598.926,38.172 594.004,47.352 L594.004,35.286 L569.69,35.286 L569.69,127.936" id="Fill-19"></path>
        <path d="M532.476,127.936 L556.789,127.936 L556.789,35.286 L531.28,35.286 L531.28,83.225 C531.28,93.259 530.442,98.358 527.884,102.44 C524.822,107.538 519.721,110.424 514.112,110.424 C508.672,110.424 504.08,108.048 501.536,103.798 C499.833,100.737 499.323,97.672 499.323,89.685 L499.323,35.286 L473.827,35.286 L473.827,87.816 C473.827,104.308 474.847,110.259 478.584,116.212 C484.193,125.05 493.883,129.97 505.442,129.97 C516.67,129.97 526.36,125.05 532.476,116.377 L532.476,127.936" id="Fill-18"></path>
        <polyline id="Fill-17" points="425.87 127.936 452.728 127.936 452.728 22.531 494.041 22.531 494.041 0.086 384.389 0.086 384.389 22.531 425.87 22.531 425.87 127.936"></polyline>
        <path d="M287.694,35.283 L263.38,35.283 L263.38,127.932 L288.89,127.932 L288.89,79.994 C288.89,61.465 294.319,52.792 306.057,52.792 C311.498,52.792 316.089,55.349 318.633,59.417 C320.336,62.482 320.846,65.547 320.846,73.534 L320.846,127.932 L346.342,127.932 L346.342,75.402 C346.342,58.91 345.325,52.957 341.585,47.007 C335.977,38.168 326.452,33.249 314.728,33.249 C303.334,33.249 293.644,38.168 287.694,46.841 L287.694,35.283" id="Fill-16"></path>
        <path d="M226.718,85.77 C226.718,102.428 219.24,111.952 206.144,111.952 C197.991,111.952 192.206,107.364 192.206,101.08 C192.206,93.934 198.501,90.362 214.472,87.818 L223.322,86.456 C223.653,86.28 224.849,86.115 226.718,85.77 M250.687,87.473 C250.852,80.671 250.852,76.59 250.852,74.553 C250.852,57.388 248.818,50.077 241.851,43.272 C235.046,36.305 224.339,32.565 210.912,32.565 C186.088,32.565 170.448,44.468 169.254,64.356 L195.436,64.356 C195.944,55.175 201.221,50.584 211.419,50.584 C221.961,50.584 226.552,56.192 226.718,69.278 C215.5,69.964 200.37,72.177 192.041,74.388 C174.353,78.635 165.68,87.818 165.68,101.92 C165.68,118.413 179.451,129.971 199.353,129.971 C214.307,129.971 223.653,125.049 230.457,113.656 L230.457,117.396 C230.457,120.967 230.623,122.839 231.309,127.937 L253.244,127.937 C251.373,120.116 250.687,110.935 250.687,96.147 L250.687,87.473" id="Fill-15"></path>
        <polygon id="Fill-14" points="130.939 127.937 156.435 127.937 156.435 0.087 130.939 0.087"></polygon>
        <path d="M79.347,73.37 L45.508,73.37 L62.51,20.319 L79.347,73.37 Z M125.075,127.937 L80.529,0.087 L45.343,0.087 L0.976,127.937 L28.341,127.937 L38.541,96.311 L86.659,96.311 L97.024,127.937 L125.075,127.937 Z" id="Fill-1"></path>
      </g>
      <g id="logo-line-3" transform="matrix(1,0,0,1,24,297)" data-svg-origin="0.7670000195503235 0.34700000286102295" style={{ zIndex: 0, visibility: 'inherit', opacity: 1 }}>
        <path d="M592.476,71.073 L552.866,71.073 C554.9,58.497 561.868,52.037 573.096,52.037 C584.313,52.037 591.966,59.68 592.476,71.073 M618.824,83.484 C618.824,52.368 601.315,32.822 573.261,32.822 C545.552,32.822 526.849,52.368 526.849,81.273 C526.849,111.537 545.21,130.915 574.113,130.915 C597.068,130.915 612.874,120.031 618.659,99.976 L591.625,99.976 C588.902,107.29 583.117,111.028 574.623,111.028 C561.702,111.028 553.718,103.206 553.032,89.602 L618.659,89.602 C618.824,86.879 618.824,84.501 618.824,83.484" id="Fill-10"></path>
        <path d="M521.303,35.543 L506.348,35.543 L506.348,13.1 L480.839,13.1 L480.839,35.543 L467.246,35.543 L467.246,54.758 L480.839,54.758 L480.839,97.256 C480.839,109.501 481.858,114.765 485.43,120.029 C490.187,127.175 497.168,130.24 508.548,130.24 C513.826,130.24 516.546,129.898 521.303,128.702 L521.303,109.666 C518.238,110.008 517.221,110.173 516.039,110.173 C509.058,110.173 506.348,106.271 506.348,96.236 L506.348,54.758 L521.303,54.758 L521.303,35.543" id="Fill-9"></path>
        <path d="M434.281,128.196 L458.595,128.196 L458.595,35.546 L433.085,35.546 L433.085,83.485 C433.085,93.52 432.247,98.618 429.69,102.7 C426.625,107.799 421.527,110.684 415.918,110.684 C410.478,110.684 405.886,108.308 403.342,104.061 C401.639,100.997 401.129,97.932 401.129,89.945 L401.129,35.546 L375.633,35.546 L375.633,88.076 C375.633,104.568 376.65,110.519 380.39,116.472 C385.998,125.31 395.689,130.23 407.247,130.23 C418.476,130.23 428.163,125.31 434.281,116.637 L434.281,128.196" id="Fill-8"></path>
        <path d="M364.433,35.543 L349.479,35.543 L349.479,13.1 L323.969,13.1 L323.969,35.543 L310.376,35.543 L310.376,54.758 L323.969,54.758 L323.969,97.256 C323.969,109.501 324.989,114.765 328.56,120.029 C333.317,127.175 340.298,130.24 351.678,130.24 C356.956,130.24 359.676,129.898 364.433,128.702 L364.433,109.666 C361.368,110.008 360.351,110.173 359.169,110.173 C352.188,110.173 349.479,106.271 349.479,96.236 L349.479,54.758 L364.433,54.758 L364.433,35.543" id="Fill-7"></path>
        <path d="M288.764,0.347 L276.009,0.347 L276.009,24.823 L301.519,24.823 L301.519,0.347 L288.764,0.347 Z M288.764,35.533 L276.009,35.533 L276.009,128.197 L301.519,128.197 L301.519,35.533 L288.764,35.533 Z" id="Fill-6"></path>
        <path d="M265.918,35.543 L250.964,35.543 L250.964,13.1 L225.454,13.1 L225.454,35.543 L211.862,35.543 L211.862,54.758 L225.454,54.758 L225.454,97.256 C225.454,109.501 226.474,114.765 230.046,120.029 C234.803,127.175 241.784,130.24 253.164,130.24 C258.441,130.24 261.162,129.898 265.918,128.702 L265.918,109.666 C262.854,110.008 261.837,110.173 260.654,110.173 C253.673,110.173 250.964,106.271 250.964,96.236 L250.964,54.758 L265.918,54.758 L265.918,35.543" id="Fill-5"></path>
        <path d="M207.476,65.123 C207.641,44.891 193.194,32.825 168.373,32.825 C144.404,32.825 129.105,44.384 129.105,62.238 C129.105,69.029 131.991,75.83 137.092,80.422 C142.877,85.697 148.993,88.076 165.995,91.65 C178.57,94.359 183.162,97.421 183.162,103.209 C183.162,108.638 177.553,112.213 169.059,112.213 C158.341,112.213 152.732,107.111 152.909,97.256 L126.892,97.256 C127.236,118.849 142.367,130.918 168.883,130.918 C194.048,130.918 209.689,119.357 209.689,100.83 C209.689,86.714 201.36,78.209 182.997,73.452 L164.633,68.698 C157.666,66.826 154.601,64.272 154.601,60.19 C154.601,54.581 159.369,51.186 167.356,51.186 C177.719,51.186 181.98,55.091 182.487,65.123 L207.476,65.123" id="Fill-4"></path>
        <path d="M61.442,35.543 L37.128,35.543 L37.128,128.192 L62.638,128.192 L62.638,80.254 C62.638,61.725 68.068,53.055 79.806,53.055 C85.246,53.055 89.838,55.609 92.381,59.68 C94.085,62.742 94.594,65.807 94.594,73.794 L94.594,128.192 L120.091,128.192 L120.091,75.662 C120.091,59.17 119.074,53.22 115.334,47.267 C109.725,38.428 100.2,33.509 88.476,33.509 C77.083,33.509 67.392,38.428 61.442,47.102 L61.442,35.543" id="Fill-3"></path>
        <polyline id="Fill-2" points="13.508 0.347 0.767 0.347 0.767 128.197 26.249 128.197 26.249 0.347 13.508 0.347"></polyline>
      </g>
    </g>
  </g>
)

/**
 * 
 * @param {*} options 
 */
const generateLegend = (options) => {
  //quick check 
  const {domain, interpolate = interpolateOrRd, title} = options;
  if (!domain || !Array.isArray(domain) || !isNumber(domain[0])) return
  const jMax = domain[domain.length - 1], jMin = domain[0];
  const legend = [<p>{title}</p>]
  for (var i = 0; i < 10; i += 1) {
    legend.push(
      <>
        {i === 0 &&
          <i>{(title === humanize('Mean.Travel.Time..Seconds.') ?
            +(jMin) / 300 : jMin).toFixed(2)
          }</i>
        }
        <span key={i} style={{ background: interpolate(i / 10) }}>
        </span>
        {i === 9 &&
          <i>{(title === humanize('Mean.Travel.Time..Seconds.') ?
            +(jMax) / 300 : jMax).toFixed(2)
          }</i>
        }
      </>)
  }
  return legend;
}

/**
 * 
 * @param {*} data features from a geojson object
 * @param {*} column 
 */
const generateDomain = (data, column) => {
  if (!data || !Array.isArray(data) || !column ||
    !isString(column) || data.length === 0) return;

  let domainIsNumeric = true;
  let domain = data.map(feature => {
    // uber move to show isochrones
    const i = feature.properties[column];
    if (isNumber(i) &&
      column === 'Mean.Travel.Time..Seconds.') {
      return (Math.floor(i / 300));
    }
    return isNumber(i) ? +(i) : i;
  });
  domain = Array.from(new Set(domain));
  // sort the domain if possible
  if (domainIsNumeric) {
    domain = domain.sort((a, b) => { return (a - b); });
  }
  return domain
}

const sortNumericArray = (array) => {
  let domainIsNumeric = true;
  // sort the domain if possible
  array.map(e => !isNumber(e) && (domainIsNumeric = false))
  if (domainIsNumeric) {
    array = array.sort((a, b) => { return (a - b); });
  }
  return array
}

const getMax = (arr) => {
  return arr.reduce((max, v) => max >= v ? max : v, -Infinity);
}
const getMin = (arr) => {
  return arr.reduce((max, v) => max <= v ? max : v, Infinity);
}
export {
  getResultsFromGoogleMaps,
  getParamsFromSearch,
  xyObjectByProperty,
  suggestUIforNumber,
  generateDeckLayer,
  suggestDeckLayer,
  sortNumericArray,
  colorRangeNames,
  searchNominatom,
  generateLegend,
  generateDomain,
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
  ATILOGO,
  getBbx,
  getMin,
  getMax,
  isURL,
}