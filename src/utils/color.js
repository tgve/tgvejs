import {
  interpolateOrRd, // schemeBlues
  interpolateReds, interpolateYlGnBu, interpolateGreens,
  interpolateOranges, interpolateSinebow,
  schemeSet1
} from 'd3-scale-chromatic';
import { scaleThreshold } from 'd3-scale';
import { isArray, isString } from './JSUtils';
// const cb9 = [[228,26,28,255], [55,126,184,255], [77,175,74,255],
// [152,78,163,255], [255,127,0,255], [255,255,51,255], [166,86,40,255],
// [247,129,191,255]]

function hexToRgb(hex, array = false) {
  if (!isString(hex)) return;
  let bigint = parseInt(hex.substring(1, hex.length), 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  if (array) return [r, g, b]
  return 'rgb(' + r + "," + g + "," + b + ")";
}

/**
 * Generate colour scale for unique set of values
 * based on the index of a value in an array domain of the set.
 *
 * @param {any} v particular value to use in interpolateOrRd
 * @param {Array} domain domain to use in interpolateOrRd
 * @param {Number} alpha value to add to colour pallete
 * @param {String} colorName colorName found in
 * `colorRangeNamesToInterpolate`
 *
 * @returns depending on the domain and `colorName` it
 * could return an array of hex array or a hex string
 */
const colorScale = (v, domain, alpha = 180, colorName) => {
  if (!v || !isArray(domain) || !domain.length) return null;
  if (colorName === colorRangeNames[5] && domain.length <= 10) {
    const rgb = hexToRgb(schemeSet1[domain.indexOf(v)], true);
    if (isArray(rgb)) {
      return [...rgb, alpha]
    }
    return undefined
  }
  const index = domain.indexOf(v)
  const d3InterpolateFn = isString(colorName) &&
    colorRangeNamesToInterpolate(colorName) ?
    colorRangeNamesToInterpolate(colorName) : interpolateOrRd;
  let rgb = d3InterpolateFn(index / domain.length);
  rgb = rgb.substring(4, rgb.length - 1)
    .replace(/ /g, '')
    .split(',').map(x => +x); // deck.gl 8 int not strings
  return [...rgb, alpha]
}

const colorRangeNames = ['inverseDefault', 'yellowblue', 'greens',
  'oranges', 'diverge', 'default'];

const colorRangeNamesToInterpolate = (name) => {
  if (!name) return interpolateOrRd;
  if (name === colorRangeNames[0]) {
    return interpolateReds;
  } else if (name === colorRangeNames[1]) {
    return interpolateYlGnBu;
  } else if (name === colorRangeNames[2]) {
    return interpolateGreens;
  } else if (name === colorRangeNames[3]) {
    return interpolateOranges;
  } else if (name === colorRangeNames[4]) {
    return interpolateSinebow;
  } else {
    return interpolateOrRd
  }
}

const colorRanges = (name) => {
  const colors = {
    yellowblue: [
      [255, 255, 204],
      [199, 233, 180],
      [127, 205, 187],
      [65, 182, 196],
      [44, 127, 184],
      [37, 52, 148]
    ],
    greens: [
      [237, 248, 233],
      [199, 233, 192],
      [161, 217, 155],
      [116, 196, 118],
      [49, 163, 84],
      [0, 109, 44],
    ],
    oranges: [
      [254, 237, 222],
      [253, 208, 162],
      [253, 174, 107],
      [253, 141, 60],
      [230, 85, 13],
      [166, 54, 3],
    ],
    diverge: [
      [140, 81, 10],
      [216, 179, 101],
      [246, 232, 195],
      [199, 234, 229],
      [90, 180, 172],
      [1, 102, 94]
    ],
    inverseDefault: [
      [189, 0, 38],
      [240, 59, 32],
      [253, 141, 60],
      [254, 178, 76],
      [254, 217, 118],
      [255, 255, 178]
    ],
    default: [
      [255, 255, 178],
      [254, 217, 118],
      [254, 178, 76],
      [253, 141, 60],
      [240, 59, 32],
      [189, 0, 38],
    ]
  }
  if (!isString(name)) return (colors['default'])
  return (colors[name])
}

/**
 * TODO: much better colour array needed.
 * The purpose here was to use the same
 * colour palette used for the ranges.
 *
 * @param {String} name
 * @returns
 */
const getColorArray = (name) => {
  if (!isString(name)) return null;
  const colors = {
    yellowblue: [0, 52, 148],
    greens: [0, 255, 0],
    oranges: [166, 166, 0],
    diverge: [255, 102, 94],
    inverseDefault: [255, 255, 178],
    default: [189, 0, 38],
  }
  return (colors[name])
}

const COLOR_RANGE = scaleThreshold()
  .domain([-0.6, -0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2])
  .range([
    [65, 182, 196],
    [127, 205, 187],
    [199, 233, 180],
    [237, 248, 177],
    // zero
    [255, 255, 204],
    [255, 237, 160],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [189, 0, 38],
    [128, 0, 38]
  ]);


export {
  colorRangeNamesToInterpolate,
  colorRangeNames,
  getColorArray,
  colorRanges,
  COLOR_RANGE,
  colorScale,
}


