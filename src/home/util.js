import React from 'react';
import { difference } from 'underscore';
import booleanContains from '@turf/boolean-contains';
import { polygon } from '@turf/helpers';
import centroid from '@turf/centroid';
import bbox from '@turf/bbox';
import { FlyToInterpolator } from 'react-map-gl';

import {
  generateDeckLayer, suggestDeckLayer,
  colorScale, getOSMTiles, colorRanges, getBbx,
  generateDomain, convertRange, getMin, getMax,
  humanize, colorRangeNamesToInterpolate, getColorArray,
  getViewportParams,
  isArrayNumeric
} from '../utils/utils';
import { Legend } from '../utils/legend';
import {
  LIGHT_SETTINGS, BLANKSTYLE, DECK_LAYER_NAMES
} from '../Constants';

import {
  getPropertyValues, setGeojsonProps,
  sfType
} from '../utils/geojsonutils';
import { CustomSlider } from '../components/showcases/Widgets';
import { isObject } from '../utils/JSUtils';
import { DECKGL_INIT, LAYERS_2D_REGEX } from '../Constants'

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const newRange = (d, columnName, min, max) => {
  let newMax = max, newMin = min;
  if (min < 1 || max > 300) {
    newMax = 10; newMin = 1;
  }
  const r = convertRange(
    d.properties[columnName], {
    oldMin: min, oldMax: max, newMax: newMax, newMin: newMin
  });
  return r;
}

/**
   * This is a helper function for index.js in home component.
   *
   * This function works only in the context of the index.js component.
   * The reason is that is in TGVE any rerender at main component (home)
   * is costly. The function returns an object to update home.state
   *
   * @param {*} values includes:
   * {Object} filter multivariate filter of properties
   * {String} cn short for colorName passed from callbacks
   * {Object} layerOptions to override layer properties
   * {Object} customError useful to show an alert when layer
   * is generated
   * @param {Object} state read state
   * @param {Function} renderTooltip to pass to DeckGL
   * @param {Function} callingFunction the function that calls
   * this function from Home component
   *
   * @returns {Object|undefined} depending on values and state
   * either undefined or an object to setState of index.js
   */
const generateLayer = (values = {}, state, renderTooltip,
  callingFunction) => {
  const { layerOptions = {}, filter, cn, customError } = values;

  if (filter && filter.what === 'mapstyle') {
    const newStyle = "mapbox://styles/mapbox/" + filter.selected + "-v9";
    return ({
      mapStyle: filter.what === 'mapstyle' ? filter.selected === "No map" ?
        BLANKSTYLE : !MAPBOX_ACCESS_TOKEN ? getOSMTiles(filter.selected) :
          newStyle : state.mapStyle,
    })
  }
  const { colorName: currentColorName, iconLimit, geography, geographyColumn,
    multiVarSelect } = state;

  // we must check state only for data
  // as data may have been added locally via "Add data"
  let data = state.data && state.data.features

  // data or geography and add column data
  if (!data) return;

  if (filter && filter.what === "%") {
    data = data.slice(0, filter.selected / 100 * data.length)
  }
  // to optimize the search keep state as the source of truth
  if (state.coords || (filter && filter.what === 'column')) {
    data = state.filtered;
  }

  // when separate geography is provided
  // data has no geography set yet
  // assemble geometry from state.geometry if so
  // is there a geometry provided?
  if (geography) {
    // is geometry equal to or bigger than data provided?
    // if (data.length > geography.features.length) {
    // for now just be aware
    //TODO: alert or just stop it?
    // }
    data = setGeojsonProps(geography, data, geographyColumn)
    // critical check
    if (!data || !data.features) {
      return ({
        alert: { content: 'Is there a matching geography column?' }
      })
    };
    // it was data.features when this function started
    data = data.features || data;
  }
  data = filterGeojson(data, filter, state, multiVarSelect)

  // critical check
  if (!data || !data.length) {
    return ({
      loading: false,
      alert: { content: 'Filtering returns no results' }
    })
  };

  const column = (filter && filter.what === 'column' && filter.selected) ||
    state.column;
  // in case there is no or one column
  const columnName = column
    //get first property of the first feature
    || (Object.keys(data[0].properties) && Object.keys(data[0].properties)[0])
    || 0;

  const geomType = sfType(
    geography ? geography.features[0] : data[0]
  ).toLowerCase();

  let layerName = (filter && filter.what ===
    'layerName' && filter.selected) || state.layerName

  if (!DECK_LAYER_NAMES.includes(state.layerName)) {
    layerName = suggestDeckLayer(geography ? geography.features : data);
  }
  // TODO: incorporate this into suggestDeckLayer
  // if (!new RegExp("point", "i").test(geomType)) layerName = "geojson"
  const switchToIcon = data.length < iconLimit && !layerName &&
    (!filter || filter.what !== 'layerName') && geomType === "point";
  if (switchToIcon) layerName = 'icon';

  // generate a domain
  const domain = generateDomain(data, columnName);

  const options = _generateOptions(state, cn, currentColorName, layerOptions,
    layerName, data, columnName, domain, geomType, callingFunction);

  // attempt legend
  let newLegend = state.legend;
  newLegend = domain && domain.length > 1
    && <Legend domain={domain}
      title={humanize(columnName)}
      interpolate={colorRangeNamesToInterpolate(
        cn || currentColorName
      )}
    />

  const alayer = generateDeckLayer(
    layerName, data, renderTooltip, options
  )

  return ({
    alert: switchToIcon ?
      { content: 'Switched to icon mode. ' } : customError || null,
    loading: false,
    layerName,
    geomType,
    tooltip: "",
    filtered: data,
    layers: [alayer],
    layerOptions: options,
    // do not save if not given etc
    multiVarSelect: filter && filter.what === "multi" ?
      filter.selected : multiVarSelect,
    road_type: filter && filter.what === 'road_type' ? filter.selected :
      state.road_type,
    colorName: cn || currentColorName,
    column, // all checked
    coords: filter && filter.what === 'coords' ? filter.selected :
      state.coords,
    legend: newLegend,
    bottomPanel: <CustomSlider
      data={state.date && state.data.features}
      dates={getPropertyValues(state.data, "alt")} />
  })
}

/**
 * The algorithm is as follows
 *
 * 1. Loop through the geojson featuers only once
 * 2. Loop through the selected column values only once
 * 3. Does the set in (2) include property valu from (1)
 *
 * e.g:
 * 1. {features:[{properties:{a:1, b:2}}]}
 * 2. selected: {a: Set([1])}
 * 3. selected.a.includes(features[0].properties.a)?
 *
 * That means the maximum number of loops will be
 * selected.n columns
 */

const filterGeojson = (data, filter, state, multiVarSelect) => {
  const filterValues = (filter && filter.what === 'multi') ||
    (isObject(multiVarSelect) && Object.keys(multiVarSelect).length);
  const filterCoords = filter && filter.what === 'coords';
  const bbox = filter && filter.what === 'boundsSubset'
    && getBbx(filter.bounds)
  const { xmin, ymin, xmax, ymax } = bbox || {};
  const poly = bbox && polygon([[
    [xmin, ymin], [xmin, ymax],
    [xmax, ymax], [xmax, ymin],
    [xmin, ymin]]])

  if (!filterValues && !filterCoords && !bbox) return data
  // includes resetting a previously selected value
  const selected = (filter && filter.what === 'multi' && filter.selected)
    || multiVarSelect;
  return data.filter(
    d => {
      if (filterValues) {
        // go through each selection
        // selected.var > Set()
        for (let each of Object.keys(selected)) {
          const nextValue = d.properties[each] + "";
          // each from selected must be in d.properties
          // *****************************
          // compare string to string
          // *****************************
          if (!selected[each].has(nextValue)) {
            return false;
          }
        }
      }
      if (filterCoords) {
        // coords in
        if (difference(filter.selected || state.coords,
          d.geometry.coordinates.flat()).length !== 0) {
          return false;
        }
      }
      // feature2 MultiPolygon geometry not supported
      if (bbox) {
        if (poly && d && d.geometry
          && sfType(d) !== 'MultiPolygon'
          && d.geometry.coordinates
          && !booleanContains(poly, d)) return false
      }
      return (true);
    }
  );
}

const initViewState = (props) => {
  const { viewport, layerName } = props;
  const init = viewport && Object.keys(viewport) ?
    Object.assign(DECKGL_INIT, viewport) : DECKGL_INIT;
  const param = getViewportParams(props.location ?
    props.location.search : window.location.search);
  if (param) {
    //lat=53.814&lng=-1.534&zoom=11.05&bea=0&pit=55&alt=1.5
    Object.keys(param).forEach(key => {
      Object.keys(init).forEach(iKey => {
        if (iKey.startsWith(key)) {
          init[key] = param[key];
        }
      });
    });
  }
  if (layerName
    && new RegExp(LAYERS_2D_REGEX, "i").test(layerName)) {
    init["pitch"] = 0
  }
  return init;
}

const getViewPort = (state, newData, bboxLonLat, map) => {
  const data = newData || state.data;
  if ((!data || data.length === 0) && !bboxLonLat) return;
  const bounds = bboxLonLat ?
    bboxLonLat.bbox : bbox(data)
  const center = bboxLonLat ?
    [bboxLonLat.lon, bboxLonLat.lat] : centroid(data).geometry.coordinates;

  map || map.fitBounds(bounds, { padding: 100 })

  return ({
    ...state.viewport,
    longitude: center[0],
    latitude: center[1],
    transitionDuration: 500,
    transitionInterpolator: new FlyToInterpolator(),
    // transitionEasing: d3.easeCubic
  });
}

export {
  generateLayer,
  initViewState,
  getViewPort
}
/**
 * Internal function to generate Deck.GL layer options.
 * The settingsUtil.js generates the generic options,
 * this function customises them based on the input in
 * run time. Mainly deals with:
 * - Generating coloring options
 * - Geographic filtering for linestring simple features
 * - Updating Deck.GL layer updateTriggers object
 */
function _generateOptions(state, cn, currentColorName, layerOptions, layerName, data,
  columnName, domain, geomType, callingFunction) {
  const colorRange = colorRanges(cn || currentColorName)
  const options = Object.assign({
    ...state.layerOptions,
    lightSettings: LIGHT_SETTINGS,
    colorRange: colorRange,
    getColor: getColorArray(cn || currentColorName)
  }, layerOptions);
  const numericValidDomain = isArrayNumeric(domain) && domain.length > 1

  if (layerName === 'heatmap') {
    options.getPosition = d => d.geometry.coordinates;
    // options.getWeight = d => d.properties[columnName]
    options.updateTriggers = {
      // even if nulls
      getWeight: typeof (options.getWeight) === 'function' &&
        data.map(d => options.getWeight(d))
    };
  }
  // TODO: color
  if (layerName === 'scatterplot') {
    if (numericValidDomain) {
      const min = getMin(domain), max = getMax(domain);
      options.getRadius = d => {
        return newRange(d, columnName, min, max);
      };
    }
  }

  if (layerName === 'arc') {
    if (numericValidDomain) {
      const min = getMin(domain), max = getMax(domain);
      options.getSourceColor = colorScale(min, domain, 180, cn || currentColorName);
      options.getTargetColor = colorScale(max, domain, 180, cn || currentColorName);
    } else {
      options.getSourceColor = colorRange[0]
      options.getTargetColor = colorRange[colorRange.length - 1]
    }
  }

  const getValue = (d) => d.properties[columnName];
  const fill = (d) => colorScale(
    // domain converts numerics into numbers
    // must do the same here
    +getValue(d) ? +getValue(d) : getValue(d),
    domain, 180, cn || currentColorName
  );
  const trigger = data.map((d) => fill(d))
  // so long as there is some properties to generate a range
  // if not a constant
  const fillOrConstantColor = domain && domain.length > 1 ?
  fill : colorRange[colorRange.length - 1]

  // caters for line and path layers
  if (geomType === 'linestring' || layerName === 'line') {
    options.getColor = fillOrConstantColor;
    options.getPath = d => d.geometry.coordinates;
    options.onClick = (info) => {
      if (info && info.hasOwnProperty('coordinate')) {
        if ((['path', 'arc', 'line'].includes(layerName)
          || geomType === 'linestring') &&
          info.object.geometry.coordinates) {
          typeof callingFunction === 'function'
            && callingFunction({
              filter: {
                what: 'coords',
                selected: info.object.geometry.coordinates[0]
              }
            });
        }
      }
    };
    if (numericValidDomain) {
      const min = getMin(domain), max = getMax(domain);
      options.getWidth = d => {
        return newRange(d, columnName, min, max);
      }; // avoid id
      options.updateTriggers = {
        getColor: trigger,
      };
    }
  }

  if (geomType === "polygon" || geomType === "multipolygon" ||
    layerName === 'geojson' || layerName === "scatterplot") {

    options.getFillColor = fillOrConstantColor;
    options.getLineColor = fillOrConstantColor;
    options.updateTriggers = {
      getFillColor: trigger,
      getLineColor: trigger
    };
  }

  if (layerName === 'pointcloud' || layerName === 'barvis') {
    options.getColor = fillOrConstantColor;
    options.updateTriggers = {
      getColor: trigger,
      getPosition: [data.length]
    };
  }
  return options;
}

