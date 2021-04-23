import { isString } from '../../JSUtils';
const addOptionsToObject = (opt, obj) => {
  Object.keys(opt).forEach(key => {
    obj[key] = opt[key]
  })
  return obj
}

const getLayerProps = (name) => {
  if(!isString(name)) return null

  const options = {
    pickable: ['boolean', true],
  }
  if (name === 'hex') {
    const hexObject = {
      extruded: ['boolean', true],
      // key: [type, min, max, step, default]
      radius: ['number', 50, 1000, 50, 100],
      elevationScale: ['number', 2, 8, 2, 4],
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
      stroked: ['boolean', false],
      filled: ['boolean', true],
      lineWidthScale: ['number', 20, 100, 20, 5],
      lineWidthMinPixels: ['number', 2, 20, 2, 2],
      // getFillColor: [160, 160, 180, 200],
      // getLineColor: [255, 160, 180, 200],
      getRadius: ['number', 10, 100, 10, 10],
      getLineWidth: ['number', 1, 10, 1, 1],
      getElevation: ['number', 30, 100, 30, 30],
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
      wrapLongitude: ['boolean'],
      // getIcon: d => 'marker-1',
      // getSize: d => 5,
      // getColor: d => [Math.sqrt(d.exits), 140, 0],
    }
   return iconObject
  } else if (name === 'sgrid') {
    const sgridObject = {
      // getPosition: d => d.geometry.coordinates,
      // getWeight: d => d.properties.weight,
      cellSizePixels: ['number', 4, 10, 4, 4],
      // colorRange,
      // gpuAggregation,
    }
    return addOptionsToObject(options, sgridObject)
  } else if (name === 'grid') {
    const gridObject = {
      cellSize: ['number', 100, 1000, 100, 100],
      elevationScale: ['number', 4, 10, 4, 2],
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
  // } else if (name === 'heatmap') {
  //   const heatObject = {

  //   }
  //   return addOptionsToObject(options, heatObject);
  // } else if (name === "scatterplot") {
  //   const scatterObject = {
  //   }
  //   return addOptionsToObject(options, scatterObject);
  // } else if (name === "text") {
  //   const textObject = {
  //   }
  //   return addOptionsToObject(options, textObject);
  // } else if (name === "barvis") {
  //   const barvisObject = {
  //   }
  //   return addOptionsToObject(options, barvisObject);
  // }
}
export {
  getLayerProps
}
