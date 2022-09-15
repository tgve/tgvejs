import {
  isNumber, isBoolean, isObject, isString, isStringNumeric,
  isArray } from './JSUtils';
import { isStringDate, uniqueValuePercentage,
  xyObjectByProperty } from './utils';

// thanks turfjs
//http://wiki.geojson.org/GeoJSON_draft_version_6
const sfType = (geojson) => {
  if (geojson.type === "FeatureCollection") { return "FeatureCollection"; }
  if (geojson.type === "GeometryCollection") { return "GeometryCollection"; }
  if (geojson.type === "Feature" && geojson.geometry !== null) {
    return geojson.geometry.type;
  }
  return geojson.type;
}

const properties = (geojson) => {
  if (!geojson || !geojson.features) return null;
  var properties = geojson.features[0].properties;
  return Object.keys(properties);
}

/**
 * Find all columns which can be considered as key/unique columns.
 * Using `getPropertyValues` we compare the length with
 * geojson objects and determin which olumn can be considered as key.
 *
 * @param {Object} geojson to process
 * @returns array of keys or null if none.
 */
const getKeyColumns = (geojson) => {
  if (!geojson || !geojson.features) return null;
  const keys = [];
  const all_property_counts = getPropertyValues(geojson);
  Object.keys(all_property_counts).forEach(column => {
    if (Array.from(all_property_counts[column]).length ===
      geojson.features.length) {
      keys.push(column);
      // if property values of column === geojson.features
      // must be unique
    }
  })
  return keys.length > 0 ? keys : null;
}

/**
 * Given an array of [E010000001, S010000001] the function checks
 * all values within the array and returns true if all matches
 * pattern for UK ONS codes.
 * See https://en.wikipedia.org/wiki/ONS_coding_system
 *
 * @param {*} array
 */
const isONSCode = (array) => {
  if (!array || array.length === 0) return false;
  let result = true;
  array.forEach(e => {
    if (!isString(e) || e.length !== 9 || !e.match(/^[EWS]\d{2}.{6}$/)) {
      result = false;
    }
  })
  return result;
}
/**
 * {some: data, another: value}
 * turn it into {some: type, another: type}
 * @param {Object} feature
 */
const describeFeatureVariables = (properties) => {
  if (!properties || !isObject(properties)) return null;
  const description = {};

  Object.keys(properties).forEach(key => {
    let v_type = String;
    const value = properties[key];

    if (isStringDate(value)) {
      v_type = Date
    } else if (isNumber(value)) {
      v_type = Number
    } else if (isBoolean(value)) {
      v_type = Boolean
    } else if (isObject(value)) {
      v_type = Object
    }
    description[key] = v_type;
  })
  return (description)
}

/**
 * This function takes a geojson object and optionally a property
 * it returns a set (in array) object of all values for that property.
 *
 * If no property is given it gets all properties
 * of each feature and adds unique values for each in a Set.
 *
 * @param {Object} geojson
 * @param {String} property
 */
const getPropertyValues = (geojson, property) => {
  if (!geojson || !geojson.features) return null;
  const all = {}
  let values = new Set();
  geojson.features.forEach(feature => {
    feature.properties && Object.keys(feature.properties) &&
    Object.keys(feature.properties).forEach((each) => {
      if (property && property === each) {
        // if the right property,
        // add it to the value to be returnd
        values.add(feature.properties[each])
      } else {
        if (typeof (all[each]) === 'object') { // a set
          all[each].add(feature.properties[each])
        } else {
          all[each] = new Set();
          all[each].add(feature.properties[each])
        }
      }
    })
  })
  return property ? Array.from(values) : all;
}

/**
 * Get a list of {x:property, y:count} objects for a features in
 * a geojson object. The function can return the counts for
 * a specific list provided or it would get all values in
 * the given key/column of the data.
 *
 * @param {Object} data features to loop through.
 * @param {String} key a particular property as key
 * @param {Object} list of values to limit return their counts
 *
 * @returns {Object}
 */
const propertyCount = (data, key, list) => {
  if (!data || !key) return;
  let sub_data = []; // match it with list
  let list_copy = list;
  if (!list || list.length === 0) {
    list_copy = getPropertyValues({
      features: data
    }, key)
  }
  data.forEach(feature => {
    Object.keys(feature.properties).forEach(each => {
      if (each === key) {
        // create an array matching given list
        // if no list match first
        const i = list_copy.indexOf(feature.properties[each]);
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

/**
 * Generate an object with frequency of values of a particular property, arranged
 * under a different property. Given features =
 * [{p1: a, p2: b, p3: v1},
 * {p1: a, p2: b, p3: v1},
 * {p1: b, p2: a, p3: v2},
 * ].
 * The function returns an object {v1: {a: 2, b: 2}, v2: {a:1, b:1}}
 *
 * @param {Object} data features to loop through.
 * @param {String} key a particular property as key
 * @param {String} key2 a different property as key
 * @param {Boolean} year extract year out of Date string?
 *
 * @returns {Object}
 */
const propertyCountByProperty = (data, key, key2, year = true) => {
  if (!data || !key || !key2 || key === key2) return;
  let sub_data = {} // create object based on key2 values
  data.forEach(feature => {
    const props = feature.properties;
    if(!props || !Object.keys(props)) return
    /**
     * TODO:
     */
    const k2 = year && new Date(props[key2]) &&
    new Date(props[key2]).getFullYear() ?
    new Date(props[key2]).getFullYear() : props[key2];
    Object.keys(props).forEach(each => {
      if (each === key) {
        // create object based on key2 values
        if (sub_data[k2] && sub_data[k2][props[each]]) {
          sub_data[k2][props[each]] += 1;
        }
        else {
          sub_data[k2] = Object.assign(
            sub_data[k2] || {}, { [props[each]]: 1 }
          );
        }
      }
    });
  });
  return sub_data;
}

const coordsAsXY = (geojson, sizeProperty) => {
  if (!geojson.features) return null;
  return (
    geojson.features.map(each => {
      // lon lat please
      const result = {
        x: each.geometry.coordinates[0],
        y: each.geometry.coordinates[1]
      }
      if (sizeProperty && each.properties[sizeProperty]) {
        result.size = each.properties[sizeProperty]
      }
      return (result)
    })
  )
}
/**
 * This function checks every value in a given column against
 * `isStringNumeric` function and tries to get a number value
 * from the column specified. If even one fails, it returns false.
 *
 * @param {*} data
 * @param {*} columnNameOrIndex
 * @returns
 */
const isColumnAllNumeric = (data, columnNameOrIndex) => {
  if(!Array.isArray(data)
  && (!isString(columnNameOrIndex) || !isNumber(columnNameOrIndex))) return null
  let isNumeric = true;
  data.forEach(d => {
    if(!isStringNumeric(d.properties[
      +columnNameOrIndex || +columnNameOrIndex === 0 ?
      Object.keys(d.properties)[columnNameOrIndex] : columnNameOrIndex
    ])) {
      isNumeric = false
    }
  })
  return isNumeric
}


/**
 * Function to get an arrays plotable properties.
 * This function checks the provided `geojson` properties,
 * 1. determine if given array is mostly keys
 * 2. determine if given array is mostly numerical
 * 3. determine if given arrays is mostly cardinal value
 * (male, female) or age groups
 *
 * if(1) and not (2) do nothing
 * if(2) return {x:1, y: v}
 * if(3) return {x:v, y: n}
 *
 * @param {*} data
 * @param {*} property
 * @returns {*}
 */
 const arrayPlotProps = (data, property) => {
  const empty = {
    data: [],
    type: null
  }
  if (!data || !Array.isArray(data)
  || !data.length || !property) return empty;
  const array = data.map(e => e.properties[property])
  const unique = uniqueValuePercentage(array, 95)

  const allNumbers = [];
  data.forEach(f => {
    const v = f.properties[property];
    if(isStringNumeric(v)) allNumbers.push(v);
  })

  // 95% valid numbers are good for a chart
  // for anything above 10 (magic number?)
  // anything below that (50%)
  const percentage = allNumbers.length/array.length * 100;
  const mostlyNumbs = allNumbers.length > 10 ?
  percentage > 95 : percentage > 50;
  // 95% keys and not numbers
  if(unique && !mostlyNumbs) return empty;

  const props = {
    data: mostlyNumbs ?
     data.map((e, i) => ({x: i, y: e.properties[property]}))
     :
     xyObjectByProperty(data, property),
    type: mostlyNumbs ? "continuous" : "cardinal"
  }

  return(props)
}

/**
 *
 * Function modifies `geojson` in place.
 *
 * @param {Object} geojson a gejson with matching `geoColumn` to `data` param
 * {features:[], type:}
 * @param {Object} data a json {properties:{}} object with matching
 * `geoColumn` to `geojson` param. Typically features of another geojons.
 * @param {String} geoColumn geocode which is shared between `geojson` and `data`.
 * It can be the same column name or mapped as `dataCol:geographyCol` string.
 *
 * @returns {Object} in all cases a geojson object,
 * if not valid input is given returns `geojson` parameter.
 */
 const setGeojsonProps = (geojson, data, geoColumn) => {
  const r = 0;
  if (!isObject(geojson) || !isArray(data) ||
    !geojson.features || !geojson.features[r] ||
    !data[r] || !data[r].properties) return geojson

  // either split or same values
  const splitOrSameString = (n) => {
    return (isString(geoColumn)
      && geoColumn.split(":")[n]) || geoColumn;
  }

  let dataColumn = splitOrSameString(0);
  let geojsonColumn = splitOrSameString(1)
  if (!geoColumn) {
    // try to find first matching column
    // compare first features 0 index
    const geoSmall = Object.keys(geojson.features[0].properties)
      .map(e => e.toLocaleLowerCase())
    const dataSmall = Object.keys(data[0].properties)
      .map(e => e.toLocaleLowerCase())
    const firstMatching = geoSmall.filter(e => dataSmall.includes(e))[0];
    dataColumn = geojsonColumn = firstMatching
  }
  // if no matching columns or
  // randomly checked a value and fails to find
  // values in both geojson objects then return geojson
  // TODO: be more tolerant!
  if ((!isString(dataColumn) && !isString(geojsonColumn))
    || !geojson.features[r].properties[geojsonColumn]
    || !data[r].properties[dataColumn]) return geojson

  const result = Object.assign({}, geojson)
  result.features = []
  // add geography to result
  // cost = geo.features.length * data.length
  geojson.features.forEach(feature => {
    for (let i = 0; i < data.length; i++) {
      if (feature.properties[geojsonColumn] ===
        data[i].properties[dataColumn]) {
        const obj = {
          type: feature.type,
          properties: data[i].properties,
          geometry: feature.geometry
        }
        result.features.push(obj)
        break;
      }
    }
  });
  return result
}

export {
  describeFeatureVariables,
  propertyCountByProperty,
  isColumnAllNumeric,
  getPropertyValues,
  setGeojsonProps,
  arrayPlotProps,
  getKeyColumns,
  propertyCount,
  properties,
  coordsAsXY,
  isONSCode,
  sfType
}
