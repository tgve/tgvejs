import React from 'react';
import { difference, isString } from 'underscore';
import booleanContains from '@turf/boolean-contains';
import { polygon } from '@turf/helpers';

import {
  generateDeckLayer, suggestDeckLayer,
  colorScale, getOSMTiles, colorRanges, getBbx,
  generateDomain, setGeojsonProps, convertRange, getMin, getMax,
  generateLegend, humanize, colorRangeNamesToInterpolate, getColorArray,
} from '../utils/utils';
import {
  LIGHT_SETTINGS, BLANKSTYLE
} from '../Constants';

import { getPropertyValues, sfType } from '../utils/geojsonutils';
import { CustomSlider } from '../components/showcases/Widgets';
import { isArray, isNumber } from '../utils/JSUtils';

const newRange = (d, columnNameOrIndex, min, max) => {
  let newMax = max, newMin = min;
  if (min < 1 || max > 300) {
    newMax = 10; newMin = 1;
  }
  const r = convertRange(
    d.properties[columnNameOrIndex], {
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
   * @param {Object} props read props
   * @param {Object} state read state
   * @param {Function} renderTooltip to pass to DeckGL
   *
   * @returns {Object|undefined} depending on values, props and state
   * either undefined or an object to setState of index.js
   */
const generateLayer = (values = {}, props, state, renderTooltip) => {
  const { layerOptions = {}, filter, cn, customError } = values;

  if (filter && filter.what === 'mapstyle') {
    const newStyle = "mapbox://styles/mapbox/" + filter.selected + "-v9";
    return ({
      mapStyle: filter.what === 'mapstyle' ? filter.selected === "No map" ?
        BLANKSTYLE : !MAPBOX_ACCESS_TOKEN ? getOSMTiles(filter.selected) :
          newStyle : state.mapStyle,
    })
  }
  const { colorName, iconLimit, geography, geographyColumn,
    multiVarSelect } = state;

  let data = (props.data && props.data.features)
    || (state.data && state.data.features)
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
    data = filterGeojson(data, filter, state, multiVarSelect)
  } else {
    data = filterGeojson(data, filter, state, multiVarSelect)
  }
  // critical check
  if (!data || !data.length) {
    return ({
      alert: { content: 'Filtering returns no results' }
    })
  };

  let column = (filter && filter.what === 'column' && filter.selected) ||
    state.column;
  // in case there is no or one column
  const columnNameOrIndex = column || 0;

  const geomType = sfType(
    geography ? geography.features[0] : data[0]
  ).toLowerCase();

  let layerName = (filter && filter.what ===
    'layerName' && filter.selected) || state.layerName ||
    suggestDeckLayer(geography ? geography.features : data);
  // TODO: incorporate this into suggestDeckLayer
  // if (!new RegExp("point", "i").test(geomType)) layerName = "geojson"
  const switchToIcon = data.length < iconLimit && !layerName &&
    (!filter || filter.what !== 'layerName') && geomType === "point";
  if (switchToIcon) layerName = 'icon';

  const options = Object.assign({
    ...state.layerOptions,
    lightSettings: LIGHT_SETTINGS,
    colorRange: colorRanges(cn || colorName),
    getColor: getColorArray(cn || colorName)
  }, layerOptions);
  // generate a domain
  const domain = generateDomain(
    data,
    columnNameOrIndex === 0 ?
      // TODO better check than just data[0]
      Object.keys(data[0].properties)[columnNameOrIndex] : columnNameOrIndex);

  if (layerName === 'heatmap') {
    options.getPosition = d => d.geometry.coordinates
    // options.getWeight = d => d.properties[columnNameOrIndex]
    options.updateTriggers = {
      // even if nulls
      getWeight: typeof (options.getWeight) === 'function' &&
        data.map(d => options.getWeight(d))
    }
  }
  // TODO
  if (layerName === 'scatterplot') {
    if (isValueNumeric(data, columnNameOrIndex)) {
      const min = getMin(domain), max = getMax(domain)
      options.getRadius = d => {
        return newRange(d, columnNameOrIndex, min, max);
      }
    }
  }
  let newLegend = state.legend;

  const getValue = (d) => {
    // columnNameOrIndex must be init with 0
    // TODO write tests for no props at all
    if (+columnNameOrIndex || +columnNameOrIndex === 0) {
      // if not checking against 0 then, we will have 0 passed to properties
      // which could return undefined like obj = {foo:'bar', baz: 'boo'}; obj[0]
      return (d.properties[Object.keys(d.properties)[columnNameOrIndex]])
    } else {
      return (d.properties[columnNameOrIndex])
    }
  }
  const fill = (d) => colorScale(
    +getValue(d) ? +getValue(d) : getValue(d),
    domain, 180, cn || state.colorName
  )

  if (geomType === 'linestring') {
    options.getColor = fill;
    options.getPath = d => d.geometry.coordinates
    options.onClick = (info) => {
      if (info && info.hasOwnProperty('coordinate')) {
        if (['path', 'arc', 'line'].includes(layerName) &&
          info.object.geometry.coordinates) {
          generateLayer({
            filter: {
              what: 'coords',
              selected: info.object.geometry.coordinates[0]
            }
          }, props, state)
        }
      }
    }
    if (isValueNumeric(data, columnNameOrIndex)) {
      const min = getMin(domain), max = getMax(domain)
      options.getWidth = d => {
        return newRange(d, columnNameOrIndex, min, max);
      }; // avoid id
    }
    options.updateTriggers = {
      getColor: data.map((d) => fill(d)),
    }
  }

  if (geomType === "polygon" || geomType === "multipolygon" ||
    layerName === 'geojson' || layerName === "scatterplot") {

    options.getFillColor = fill;

    options.updateTriggers = {
      getFillColor: data.map((d) => fill(d))
    }
  }

  if (layerName === 'pointcloud' || layerName === 'barvis') {
    options.getColor = fill;
    options.updateTriggers = {
      getColor: data.map((d) => fill(d)),
      getPosition: [data.length]
    }
  }

  // attempt legend
  const columnName = +columnNameOrIndex || +columnNameOrIndex === 0 ?
    Object.keys(data[0].properties)[columnNameOrIndex] : columnNameOrIndex
  newLegend = generateLegend(
    {
      domain,
      title: humanize(columnName),
      interpolate: colorRangeNamesToInterpolate(
        cn || state.colorName
      )
    }
  )

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
    colorName: cn || colorName,
    column, // all checked
    coords: filter && filter.what === 'coords' ? filter.selected :
      state.coords,
    legend: newLegend,
    bottomPanel: <CustomSlider
      data={state.data.features}
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
    Object.keys(multiVarSelect).length;
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

const isValueNumeric = (data, columnNameOrIndex) => {
  if (!isArray(data)) return null
  if (!isString(columnNameOrIndex)
    && !isNumber(columnNameOrIndex)) return null
  const r = Math.floor(Math.random() * data.length)
  return +(data[r] && data[r].properties &&
    data[r].properties[columnNameOrIndex]);
}

export {
  generateLayer
}
