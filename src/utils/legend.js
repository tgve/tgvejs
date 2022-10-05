import React from 'react';

import {
  isNumber, randomToNumber,
} from './JSUtils.js';
import { shortenName } from './utils';

/**
 * Helper function to generate a legend from: a `domain`,
 * an `interpolate` function and a `title`.
 *
 * It works with both numerical & categorical arrays.
 * In the case of numerical values, it generates the gradient,
 * whilst in the categorical case it generates a legend.
 *
 * @param {Object} options
 * @returns {Object} React.Fragment
 */
 const generateLegend = (options) => {
  //quick check
  const { domain, interpolate = interpolateOrRd, title } = options;
  const r = randomToNumber(domain && domain.length) // defaults to 0
  if (!domain || !Array.isArray(domain)) return null

  const legend = [<p key='title'>{title}</p>]
  const jMax = domain[domain.length - 1], jMin = domain[0];
  const legendMax = isNumber(jMin) &&
    isNumber(jMax) && domain.length > 10 ? 10 : domain.length
  for (var i = 0; i < legendMax; i += 1) {
    // break the tgve legend css
    let item = <p key={i} style={{
      textAlign: 'left'
    }}><span style={{
      background: interpolate(i / legendMax),
    }} /> {shortenName(domain[i], 8)}
    </p>
    if (+domain[i]) {
      // implement the tgve legend css
      item = <i key={i}>{nFormatter(jMin)}</i>
      if (i === (legendMax - 1)) {
        item = <i key={i}>{nFormatter(jMax)}</i>
      } else if (i !== 0) {
        item = <span key={i} style={{ background: interpolate(i / legendMax) }}>
        </span>
      }
    }
    legend.push(item)
  }
  return legend;
}


// credit https://so.com/a/9462382/11101153
function nFormatter(num, digits = 2) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

export {
  generateLegend
}
