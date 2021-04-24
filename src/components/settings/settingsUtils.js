import { isString } from '../../JSUtils';
const addOptionsToObject = (opt, obj) => {
  Object.keys(opt).forEach(key => {
    obj[key] = opt[key]
  })
  return obj
}

const makeObject = (type, min, max, def, step) => {
  return ({ type, min, max, default: def, step })
}

const getLayerProps = (name) => {
  if (!isString(name)) return null

  const options = {
    pickable: { type: 'boolean', value: true },
  }
  if (name === 'hex') {
    const hexObject = {
      extruded: { type: 'boolean', value: true },
      // key: [type, min, max, step, default]
      radius: makeObject('number', 50, 1000, 100, 50),
      elevationScale: makeObject('number', 2, 8, 4, 2),
      // opacity: ['number', 0, 1, 0.1, 0.3]
    }
    return addOptionsToObject(options, hexObject)
  } else if (name === 'scatterplot') {
    const scatterObj = {
      opacity: 'number',
      radiusScale: 'number',
      radiusMinPixels: 'number',
      radiusMaxPixels: 'number',
      // getColor: d => [255, 140, 0],
    }
    return addOptionsToObject(options, scatterObj)
  } else if (name === 'geojson') {
    const geojsonObject = {
      stroked: { type: 'boolean', value: false },
      filled: { type: 'boolean', value: true },
      lineWidthScale: makeObject('number', 20, 100, 20, 5),
      lineWidthMinPixels: makeObject('number', 2, 20, 2, 2),
      // getFillColor: [160, 160, 180, 200],
      // getLineColor: [255, 160, 180, 200],
      getRadius: makeObject('number', 10, 1000, 30, 10),
      getLineWidth: makeObject('number', 1, 10, 1, 1),
      getElevation: makeObject('number', 30, 100, 30, 10),
      // getElevation: f => Math.sqrt(f.properties.valuePerSqm) * 10,
      // getFillColor: f => COLOR_RANGE(f.properties.growth),
    }
    return addOptionsToObject(options, geojsonObject)
  } else if (name === 'icon') {
    const iconObject = {
      // iconAtlas: atlas,
      // iconMapping: mapping,
      // sizeScale: 'number',
      // getPosition: d => d.geometry.coordinates,
      wrapLongitude: { type: 'boolean', value: false },
      // getIcon: d => 'marker-1',
      // getSize: d => 5,
      // getColor: d => [Math.sqrt(d.exits), 140, 0],
    }
    return iconObject
  } else if (name === 'sgrid') {
    const sgridObject = {
      // getPosition: d => d.geometry.coordinates,
      // getWeight: d => d.properties.weight,
      cellSizePixels: makeObject('number', 50, 100, 50, 5),
      // colorRange,
      // gpuAggregation,
    }
    return addOptionsToObject(options, sgridObject)
  } else if (name === 'grid') {
    const gridObject = {
      cellSize: makeObject('number', 100, 5000, 100, 50),
      elevationScale: makeObject('number', 4, 10, 4, 2),
    }
    return addOptionsToObject(options, gridObject)
  } // else if (name === 'line') {
  //   const lineObject = {

  //   }
  //   /**
  //    * TODO!
  //    */
  //   return addOptionsToObject(options, lineObject)
  // } else if (name === 'arc') {
  //   const arcObject = {
  //     // onHover: renderTooltip
  //     // getSourcePosition: d => d.geometry.coordinates[0],
  //     // getTargetPosition: d => d.geometry.coordinates[1],
  //   }
  //   return addOptionsToObject(options, arcObject)
  // } else if (name === 'path') {
  //   const pathObject = {
  //   }
  //   return addOptionsToObject(options, pathObject)
  // } 
  else if (name === 'heatmap') {
    const heatObject = {
      getWeight: { type: 'column', value: 'number', default: 1}
    }
    return addOptionsToObject(options, heatObject);
  }
  // } else if (name === "scatterplot") {
  //   const scatterObject = {
  //   }
  //   return addOptionsToObject(options, scatterObject);
  // } else if (name === "text") {
  //   const textObject = {
  //   }
  //   return addOptionsToObject(options, textObject);
  else if (name === "barvis") {
    const barvisObject = {
      getRotationAngle: { type: 'column', value: 'number', default: 1},
      getWidth: { type: 'column', value: 'number', default: 1}
    }
    return addOptionsToObject(options, barvisObject);
  }
}
export {
  getLayerProps
}
