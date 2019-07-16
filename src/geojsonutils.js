import {isNumber, isBoolean, isObject} from './JSUtils';

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
    if(isNumber(value)) {
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
 * If no property is given it will take the first property from 
 * the first feature using `properties()` function.
 * 
 * @param {*} geojson 
 * @param {*} property 
 */
const getPropertyValues = (geojson, property) => {
  if (!geojson || !geojson.features) return null;
  if(!property) { // get first property's values
    property = properties(geojson)[0]
  }
  const values = new Set();
  geojson.features.forEach(feature => {
    Object.keys(feature.properties).forEach(each => {
      if (each === property) {
        values.add(feature.properties[each])
      }
    })
  })
  return Array.from(values);
}

const propertyCount = (data, key, list) => {
  if (!data) return;
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