import {
  isNumber, isBoolean, isObject,
  isDate, isString
} from './JSUtils';

const { DateTime } = require("luxon");

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
 * Find all columns which can be considered as key columns.
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
    if(Array.from(all_property_counts[column]).length === 
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
  if(!array || array.length === 0) return false;
  let result = true;
  array.forEach(e => {
    if(!isString(e) || e.length !== 9 || !e.match(/^[EWS]\d{2}.{6}$/)) {
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
const describeFeatureVariables = (feature) => {
  if (!feature || feature.type !== 'Feature') return null;
  const description = {};

  Object.keys(feature.properties).forEach(key => {
    let v_type = String;
    const value = feature.properties[key];

    if (isDate(value) ||
      DateTime.fromFormat(value + '', 'MMMM dd yyyy').isValid ||
      DateTime.fromFormat(value + '', 'MMMM d yyyy').isValid ||
      DateTime.fromFormat(value + '', 'MMM d yyyy').isValid ||
      DateTime.fromFormat(value + '', 'MMM dd yyyy').isValid ||
      DateTime.fromFormat(value + '', 'dd/MM/yyyy').isValid ||
      DateTime.fromISO(value).isValid || // "19-2-1999"
      DateTime.fromHTTP(value).isValid ||
      (typeof value === Number && DateTime.fromMillis(value).isValid)) {
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
  if(!list || list.length === 0) {
    list_copy = getPropertyValues ({
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
 * @param {Object} list of values to return their counts
 * @param {String} key2 a different property as key
 * @returns {Object} 
 */
const propertyCountByProperty = (data, key, list, key2) => {
  if (!data || !key || !list || !key2 || key === key2) return;
  let sub_data = {} // create object based on key2 values
  data.forEach(feature => {
    const k2 = key2 === 'date' &&  
    DateTime.fromFormat(feature.properties[key2] + '', 'dd/MM/yyyy').isValid ? 
    feature.properties[key2].split("/")[2] : feature.properties[key2];
    Object.keys(feature.properties).forEach(each => {
      if (each === key) {
        // create object based on key2 values
        if (sub_data[k2] && sub_data[k2][feature.properties[each]]) {
          sub_data[k2][feature.properties[each]] += 1;
        }
        else {
          sub_data[k2] = Object.assign(
            sub_data[k2] || {}, { [feature.properties[each]]: 1}
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

export {
  describeFeatureVariables,
  propertyCountByProperty,
  getPropertyValues,
  getKeyColumns,
  propertyCount,
  properties,
  coordsAsXY,
  isONSCode,
  sfType
}