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
  describeGeojson,
  propertyCount,
  properties,
  sfType
}