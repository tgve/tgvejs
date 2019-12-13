import React, { useState, useEffect } from 'react';
import { ascending, quantile } from 'd3-array';

import { isNumber } from '../../JSUtils';
import { convertRange } from '../../utils';

import './style.css'

const W = 250;
const limit = 5;
export default (props) => {
  const { className, data, marginLeft, marginTop,
    lineAttrs, plotStyle } = props;
  let isNumeric = true;
  data.forEach(e => {
    if (!isNumber(e)) {
      isNumeric = false
    }
  });
  if (!data || !Array.isArray(data) || data.length === 0 ||
    !isNumeric) return null;

  // Compute summary statistics used for the box:
  let data_sorted = data.sort(ascending)
  data_sorted = data_sorted.map(e => convertRange(e, {
    oldMax: data_sorted[data_sorted.length - 1],
    oldMin: data_sorted[0],
    newMax: W - 10, newMin: 10
  }))

  let q1 = +quantile(data_sorted, .25).toFixed(2)
  let median = +quantile(data_sorted, .5).toFixed(2)
  let q3 = +quantile(data_sorted, .75).toFixed(2)
  let interQuantileRange = +(q3 - q1).toFixed(2)
  // https://www.purplemath.com/modules/boxwhisk3.htm
  let min = +(q1 - 1.5 * interQuantileRange).toFixed(2)
  let max = +(q1 + 1.5 * interQuantileRange).toFixed(2)
  // console.log(min, max, q1, q3, interQuantileRange);
  const outliers = data_sorted.filter(e => e > max || e < min)
  // console.log(outliers);

  // rescale variables according to screensize
  const Y = 5, yHeight = 30, yMiddle = Y + (yHeight / 2);

  // show less on scale depending on settings
  const scale = data.length > limit ?
  data.filter((item, idx) => {
      if ((idx % Math.floor(data.length / limit)) === 0) {
        console.log(idx);
        
        return item
      }
    }) : data

  console.log(data.length > limit);
  
  return (
    <div style={{
      position: 'relative',
      padding: '5px',
    }}>
      <svg width={W} height={50}>
        <g>
          <line
            style={{ stroke: 'red', strokeWidth: 2 }}
            x1={min}
            x2={q1}
            y1={yMiddle}
            y2={yMiddle}
            {...lineAttrs}
          />
          {/* bottom line */}
          <line
            style={{ stroke: 'red', strokeWidth: 1 }}
            x1={min} x2={min} y1={Y} y2={Y + yHeight} {...lineAttrs} />
          <line
            style={{ stroke: 'red', strokeWidth: 2 }}
            x1={max}
            x2={q3}
            y1={yMiddle}
            y2={yMiddle}
            {...lineAttrs}
          />
          {/* top line */}
          <line
            style={{ stroke: 'red', strokeWidth: 1 }}
            x1={max} x2={max} y1={Y} y2={Y + yHeight} {...lineAttrs} />
          <rect
            x={q1}
            width={interQuantileRange}
            y={Y}
            height={yHeight}
            fill={'#f00'}
            stroke="black 0.5px"
          />
          {/* median */}
          <line
            style={{ stroke: 'black', strokeWidth: 1 }}
            x1={median} x2={median} y1={Y} y2={Y + yHeight} {...lineAttrs} />
          {/* outliers */}
          {
            outliers.map(e => <circle
              key={e} 
              r="3" cx={e} cy={yMiddle}
              style={{fill: 'none', stroke: 'red', 
              opacity: 1}}></circle>)
          }
          {/* axis */}
          {/* <line 
            x1={0} y1={40} x2={W} y2={40} /> */}
          {
            scale && scale.map((v, i) => {
              const x1 = i * (W / scale.length);
              return (
                <g key={v + "" + i}>
                  {/* <line 
                    style={{ stroke: 'white', strokeWidth: 0.5 }}
                  x1={x1} y1={40} x2={x1} y2={45} /> */}
                  <text x={x1 + 2} y={50}
                    // transform="rotate(10)"
                    className="d3-axis-labels">{v}</text>
                </g>
              )
            })
          }
        </g>
      </svg>
    </div>
  )
}