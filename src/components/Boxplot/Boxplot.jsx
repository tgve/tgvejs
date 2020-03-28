import React from 'react';
import { ascending, quantile } from 'd3-array';

import { isNumber } from '../../JSUtils';
import { convertRange } from '../../utils';

import './style.css'

export default (props) => {
  const { data, lineAttrs, plotStyle, dark } = props;
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  let isNumeric = true;
  data.forEach(e => {
    if (!isNumber(e)) {
      isNumeric = false
    }
  });
  if (!isNumeric) return null;
  // proceed
  const W = 100, H = (plotStyle && plotStyle.height) || 100, limit = 5;
  // Compute summary statistics used for the box:
  let data_sorted = data.sort(ascending)
  data_sorted = data_sorted.map(e => convertRange(e, {
    oldMax: data_sorted[data_sorted.length - 1],
    oldMin: data_sorted[0],
    newMax: W - 5, newMin: 5
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
  const Y = 5, yHeight = 60, yMiddle = Y + (yHeight / 2);

  // show less on scale depending on settings
  let scale = data;
  if (data.length > limit) {
    scale = [];
    data.forEach((item, idx) => {
      let d = Math.floor(data.length / limit);
      if (d === 1) d = 2;
      if ((idx % d) === 0) {
        let l = Math.floor(item);
        if (l > 1000) l = (l / 1000).toFixed(1) + "k"
        scale.push(l)
      }
    })
  }
  // console.log(scale);

  return (
    <div style={{
      width: '100%',
      height: H,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        maxWidth: '600px',
      }}>
        <svg width='100%' height='100%'>
          <g style={{
            stroke: (plotStyle && plotStyle.lineColor) || 'rgb(18, 147, 154)'
          }}>
            <line
              x1={min + "%"}
              x2={q1 + "%"}
              y1={yMiddle + "%"}
              y2={yMiddle + "%"}
              {...lineAttrs}
            />
            {/* bottom line */}
            <line
              style={{ strokeWidth: 1 }}
              x1={min + "%"} x2={min + "%"} y1={Y + "%"}
              y2={(Y + yHeight) + "%"} {...lineAttrs} />
            <line
              x1={max + "%"}
              x2={q3 + "%"}
              y1={yMiddle + "%"}
              y2={yMiddle + "%"}
              {...lineAttrs}
            />
            {/* top line */}
            <line
              style={{ strokeWidth: 1 }}
              x1={max + "%"} x2={max + "%"} y1={Y + "%"}
              y2={(Y + yHeight) + "%"} {...lineAttrs} />
            <rect
              x={q1 + "%"}
              width={interQuantileRange + "%"}
              y={Y + "%"}
              height={yHeight + "%"}
              fill={(plotStyle && plotStyle.fillColor) || 'rgb(18, 147, 154)'}
              stroke={(dark ? "white" : "black") + " 0.5px"}
            />
            {/* median */}
            <line
              style={{ stroke: dark ? 'white' : 'black', strokeWidth: 1 }}
              x1={median + "%"} x2={median + "%"}
              y1={Y + "%"} y2={(Y + yHeight) + "%"} {...lineAttrs} />
            {/* outliers */}
            {
              outliers.map((e, i) => <circle
                key={e + "-" + i}
                r="5"
                // avoid placing first on top/bottom line
                cx={(e > max ? e + 2 : e - 2) + "%"}
                cy={yMiddle + "%"}
                style={{
                  fill: 'none',
                  opacity: 1
                }}></circle>)
            }
            {/* axis */}
            {/* <line 
            x1={'5%'} y1="80%" x2={(W - 10) + "%"} y2={'80%'} /> */}
            {
              scale && scale.map((v, i) => {
                const x1 = i * (W / scale.length);
                return (
                  <g key={x1 + "-" + i}>
                    {/* <line 
                    style={{ stroke: 'white', strokeWidth: 0.5 }}
                  x1={x1 + "%"} y1={"80%"} x2={x1} y2={'82%'} /> */}
                    <text fill={dark ? 'white' : 'black'} x={(x1 + 2) + "%"} y={"85%"}
                      // transform="rotate(10)" style={{textAnchor:"end"}}
                      className="d3-axis-labels">{v}</text>
                  </g>
                )
              })
            }
          </g>
        </svg>
      </div>
    </div>
  )
}