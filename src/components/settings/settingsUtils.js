import {
  ScatterplotLayer, HexagonLayer, GeoJsonLayer,
  ScreenGridLayer, GridLayer, LineLayer,
  HeatmapLayer, TextLayer, ArcLayer, PathLayer, PointCloudLayer
} from 'deck.gl';
import IconClusterLayer from '../../icon-cluster-layer';
import BarLayer from '../customlayers/BarLayer'
import { isString } from '../../utils/JSUtils';

const addOptionsToObject = (opt, obj) => {
  Object.keys(opt).forEach(key => {
    obj[key] = opt[key]
  })
  return obj
}

const makeObject = (type, min, max, def, step) => {
  return ({ type, min, max, default: def, step })
}

const options = {
  pickable: { type: 'boolean', value: true },
  extruded: { type: 'boolean', value: true },
  autoHighlight: { type: 'boolean', value: true},
}
const layers = {};

const hexObject = {
  class: { value: HexagonLayer, type: 'class' },
  extruded: { type: 'boolean', value: true },
  // key: [type, min, max, step, default]
  radius: makeObject('number', 50, 1000, 100, 50),
  elevationScale: makeObject('number', 1, 8, 1, 2),
  // getPosition(d) { return d.geometry.coordinates},
  // opacity: ['number', 0, 1, 0.1, 0.3]
}
layers['hex'] = addOptionsToObject(options, hexObject)
const scatterObj = {
  class: { value: ScatterplotLayer, type: 'class' },
  opacity: makeObject('number', 0, 1, 0.8, 0.1),
  getRadius: {type: 'column', value: 'number', default: 30},
  radiusScale: makeObject('number', 0, 1, 0.8, 0.1),
  radiusMinPixels: makeObject('number', 1, 10, 1, 1),
  radiusMaxPixels: makeObject('number', 1, 100, 100, 5),
}
layers['scatterplot'] = addOptionsToObject(options, scatterObj)
const geojsonObject = {
  class: { value: GeoJsonLayer, type: 'class' },
  pickable: { type: 'boolean', value: true },
  extruded: { type: 'boolean', value: false },
  stroked: { type: 'boolean', value: false },
  filled: { type: 'boolean', value: true },
  lineWidthScale: makeObject('number', 20, 100, 20, 5),
  lineWidthMinPixels: makeObject('number', 2, 20, 2, 2),
  // getFillColor: [160, 160, 180, 200],
  // getLineColor: [255, 160, 180, 200],
  // getRadius: makeObject('number', 10, 1000, 30, 10),
  // getLineWidth: makeObject('number', 1, 10, 1, 1),
  getRadius: { type: 'column', value: 'number', default: 30},
  getLineWidth: { type: 'column', value: 'number', default: 1},
  getElevation: makeObject('number', 30, 100, 30, 10),
  // getElevation: f => Math.sqrt(f.properties.valuePerSqm) * 10,
  // getFillColor: f => COLOR_RANGE(f.properties.growth),
}
layers['geojson'] = geojsonObject;
const iconObject = {
  class: { value: IconClusterLayer, type: 'class' },
  // iconAtlas: atlas,
  // iconMapping: mapping,
  // sizeScale: makeObject('number'),
  // getPosition: d => d.geometry.coordinates,
  wrapLongitude: { type: 'boolean', value: false },
  // getIcon: d => 'marker-1',
  // getSize: d => 5,
  // getColor: d => [Math.sqrt(d.exits), 140, 0],
}
layers['icon'] = addOptionsToObject(options, iconObject)
const sgridObject = {
  class: { value: ScreenGridLayer, type: 'class' },
  // getPosition: d => d.geometry.coordinates,
  // getWeight: d => d.properties.weight,
  cellSizePixels: makeObject('number', 50, 100, 50, 5),
  // colorRange,
  // gpuAggregation,
}
layers['sgrid'] = addOptionsToObject(options, sgridObject)
const gridObject = {
  class: { value: GridLayer, type: 'class' },
  cellSize: makeObject('number', 100, 50000, 100, 50),
  elevationScale: makeObject('number', 4, 10, 4, 2),
}
layers['grid'] = addOptionsToObject(options, gridObject)
const lineObject = {
  class: { value: LineLayer, type: 'class' },
  getWidth: { type: 'column', value: 'number', default: 1},

  // getPosition: function(d) { return d.geometry.coordinates},
  /**
   * TODO
   */
  getSourcePosition: d => d.geometry.coordinates[0],
  getTargetPosition: d => d.geometry.coordinates[1],
}
layers['line'] =  addOptionsToObject(options, lineObject)
const arcObject = {
  // [Math.sqrt(+(d.properties.hs2)) * 1e13, 140, 0]
  class: { value: ArcLayer, type: 'class' },
  getWidth: { type: 'column', value: 'number', default: 1},
  getWeight: { type: 'column', value: 'number', default: 1},
  getTilt: { type: 'column', value: 'number', default: 0},
  getSourcePosition: d => d.geometry.coordinates[0],
  getTargetPosition: d => d.geometry.coordinates[1],
  getSourceColor: [255, 255, 178],
  getTargetColor: [189, 0, 38],
}
layers['arc'] = addOptionsToObject(options, arcObject)
const pathObject = {
  class: { value: PathLayer, type: 'class' },
  // TODO: drop down to switch
  widthUnits: 'pixels',
  getPath: d => d.geometry.coordinates,
  getWidth: { type: 'column', value: 'number', default: 2},
  widthScale: { type: 'column', value: 'number', default: 1},
  widthMinScale: makeObject('number', 0, 100, 1, 2),
}
layers['path'] = addOptionsToObject(options, pathObject)
const heatObject = {
  class: { value: HeatmapLayer, type: 'class' },
  getWeight: { type: 'column', value: 'number', default: 1}
}
layers['heatmap'] = addOptionsToObject(options, heatObject);
const textObject = {
  class: { value: TextLayer, type: 'class' },
  getText: { type: 'column', value: 'string', default: ""}

}
layers["text"] = addOptionsToObject(options, textObject);
const barvisObject = {
  class: { value: BarLayer, type: 'class' },
  getRotationAngle: { type: 'column', value: 'number', default: 0},
  getScale: { type: 'column', value: 'number', default: 20}
}
layers["barvis"] = addOptionsToObject(options, barvisObject);

const pointCloudObject = {
  class: { value: PointCloudLayer, type: 'class' },
  pointSize: makeObject('number', 1, 100, 10, 2),
  opacity: makeObject('number', 0, 1, 0.5, 0.1),
  // TODO: add trigger arrays before defining these
  // getPosition: { type: 'column', value: 'array',
  // default: (d) => d.geometry.coordinates},
  // getNormal: { type: 'column', value: 'array', default: (d) => d.properties.normal},
  // getColor: { type: 'column', value: 'array', default: (d) => d.properties.color}
}
layers["pointcloud"] = addOptionsToObject(options, pointCloudObject);
/**
 * Frozen object to keep the properties intact.
 *
 * @param {String} name
 * @returns
 */
const getLayerProps = (name) => {
  if (!isString(name)) return null
  return Object.freeze(layers[name])
}

const LAYERS = Object.keys(layers)

export {
  getLayerProps,
  LAYERS
}
