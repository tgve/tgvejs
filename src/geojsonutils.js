import {
  isNumber, isBoolean, isObject,
  isDate
} from './JSUtils';

const { DateTime } = require("luxon");

// thanks turfjs
//http://wiki.geojson.org/GeoJSON_draft_version_6
const sfType = (geojson) => {
  if (geojson.type === "FeatureCollection") { return "FeatureCollection"; }
  if (geojson.type === "GeometryCollection") { return "GeometryCollection"; }
  if (geojson.type === "Feature" && geojson.geometry !== null) { return geojson.geometry.type; }
  return geojson.type;
}

const properties = (geojson) => {
  if (!geojson || !geojson.features) return null;
  var properties = geojson.features[0].properties;
  return Object.keys(properties);
}

/**
 * {some: data, another: value}
 * turn it into {some: type, another: type}
 * @param {*} feature 
 */
const describeGeojson = (feature) => {
  if(!feature || feature.type !== 'Feature') return null;
  const description = {};
  
  Object.keys(feature.properties).forEach(key => {
    let v_type = String;
    const value = feature.properties[key];

    if(isDate(value) || 
    DateTime.fromFormat(value + '', 'MMMM dd yyyy').isValid ||
    DateTime.fromFormat(value + '', 'MMMM d yyyy').isValid ||
    DateTime.fromFormat(value + '', 'MMM d yyyy').isValid ||
    DateTime.fromFormat(value + '', 'MMM dd yyyy').isValid ||
    DateTime.fromFormat(value + '', 'dd/MM/yyyy').isValid ||
    DateTime.fromISO(value).isValid || // "19-2-1999"
    DateTime.fromHTTP(value).isValid ||
    (typeof value === Number && DateTime.fromMillis(value).isValid)) {
      v_type = Date
    } else if(isNumber(value)) {
      v_type = Number
    } else if(isBoolean(value)) {
      v_type = Boolean
    } else if(isObject(value)) {
      v_type = Object 
    }
    description[key] = v_type;
  })  
  return(description) 
}

/**
 * This function takes a geojson object and optionally a property
 * it returns a set (in array) object of all values for that property.
 * 
 * If no property is given it gets all properties
 * of each feature and adds unique values for each in a Set.
 * 
 * @param {*} geojson 
 * @param {*} property 
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
        if(typeof(all[each]) === 'object') { // a set
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

const propertyCount = (data, key, list) => {
  if (!data || !key || !list) return;
  let sub_data = []; // match it with list
  data.forEach(feature => {
    Object.keys(feature.properties).forEach(each => {
      if (each === key) {
        // create an array matching given list
        // if no list match first 
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
  getPropertyValues,
  describeGeojson,
  propertyCount,
  properties,
  sfType
}