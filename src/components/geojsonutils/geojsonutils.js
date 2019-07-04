var gju = this.gju = {};

// Export the geojson object for **CommonJS**
if (typeof module !== 'undefined' && module.exports) {  
  module.exports = gju;
}
gju.properties = function (geojson) {  
  if (!geojson || !geojson.features) return null;  
  var properties = geojson.features[0].properties;
  return Object.keys(properties);
}

gju.propertyCount = (data, key, list) => {
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