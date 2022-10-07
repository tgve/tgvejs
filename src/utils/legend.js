import React, { useState } from 'react';
import { interpolateOrRd } from 'd3-scale-chromatic';
import { styled } from 'baseui';

import {
  isNumber, randomToNumber,
} from './JSUtils.js';
import { iWithFaName, shortenName } from './utils';

const Header = styled("div", ({ $theme }) => ({
  backgroundColor: $theme.colors.backgroundTertiary,
  display: 'flex', justifyContent: 'space-between',
  position: '-webkit-sticky', /* Safari */
  position: 'sticky',
  top: 0
}))

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
const Legend = (options) => {

  const [open, setOpen] = useState(
    options.hasOwnProperty('open') ? options.open : true)
  const { domain, interpolate = interpolateOrRd, title } = options

  const r = randomToNumber(domain && domain.length) // defaults to 0
  if (!domain || !Array.isArray(domain)) return null

  const toggleButton = iWithFaName(
    open ? 'fa fa-compress' : 'fa fa-expand',
    () => { setOpen(o => !o) },
    { fontSize: '1.1em' },
    open ? "Minimize legend" : "Expand legend"
  )

  const jMax = domain[domain.length - 1], jMin = domain[0];
  const numeric = isNumber(jMin) && isNumber(jMax)
  const legend = [<Header key="tgve-legend-header">
    <p key='title'>{title}</p>
    {toggleButton}
  </Header>]
  const legendMax = numeric && domain.length > 10 ? 10 : domain.length
  for (var i = 0; i < legendMax; i += 1) {
    // break the tgve legend css
    let item = <p
      title={domain[i]}
      key={i} style={{ textAlign: 'left' }}>
      <span style={{
        borderRadius: 0, width: 15, /* compared to 10 for numeric */
        background: interpolate(i / legendMax)
      }} />
      {shortenName(domain[i], 8)}
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
  return open ? legend : toggleButton;
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
  var item = lookup.reverse().find((item) => num >= item.value);
  return item ? (num / item.value)
    .toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

export {
  Legend
}
