import React, { useState } from 'react';
import {
  XYPlot, XAxis, YAxis, LineSeries,
  Crosshair, DiscreteColorLegend
} from 'react-vis';
import { format } from 'd3-format';

import { shortenName } from '../../utils';

const W = 250;

/**
 * React Hook to generate a multi line plot. Requires: 
 * multi line data {data: [[{x:v,y:v},],[]]} object arrays and
 * maximum of 10 lines.
 * 
 * Note: options.legend must match order of options.data multi
 * dimensional array.
 * TODO: consider {data: {legend1: array, legend2: array}}
 * 
 * @param {Object} options 
 */
export default function MultiLinePlot(options) {
  const [hint, setHint] = useState();

  // if (!Array.isArray(options.data) ||
  //   options.data.length > 10) return null;

  const limit = 10;

  const { plotStyle, title, noXAxis, noYAxis,
    onValueClick, data, legend } = options;

  return options.data && options.data.length > 1 &&
    // https://github.com/uber/react-vis/issues/584#issuecomment-401693372
    <div className="unselectable" 
      style={{ 
        position: 'relative', 
      }}>
      {!options.noLimit &&
        options.data && options.data.length > limit &&
        <h4>Plotting first {limit} values:</h4>}
      {title &&
        <h4>{title}</h4>
      }
      <XYPlot xType="ordinal"
        margin={{ bottom: (plotStyle && plotStyle.marginBottom) || 40 }} // default is 40
        animation={{ duration: 1 }}
        height={(plotStyle && plotStyle.height) || W}
        width={(plotStyle && plotStyle.width) || W}
        onMouseLeave={() => { setHint(false) }}
      >
        {!noXAxis && // if provided dont
          <XAxis
            tickSize={0}
            tickFormat={v => shortenName(v, 10)}
            tickValues={
              (data[0].length > limit)
                ? data[0]
                  .filter((item, idx) => {
                    if ((idx % Math.floor(data[0].length / limit)) === 0) {
                      return item.x
                    }
                  }).map(item => (item.x))
                : data[0].map(item => (item.x))
            }
            tickLabelAngle={-65} 
            style={{
              line: { strokeWidth: 0 },
              text: { fill: options.dark ? '#fff' : '#000' } 
            }} />}
        {!noYAxis && // if provided dont
          <YAxis
            tickSize={0}
            tickLabelAngle={-45} tickFormat={v => format(".2s")(v)} style={{
              line: { strokeWidth: 0 },
              title: { fill: options.dark ? '#fff' : '#000' },
            }} position="end" title={data[0][data[0].length-1].x} />
        }
        {data.map((line, i) =>
          <LineSeries
            key={"line-" + i}
            onValueClick={onValueClick}
            onNearestX={(_, { index }) => {
              setHint(data.map(d => d[index]))
            }}
            style={{ fill: 'none' }}
            data={line} />)}
        {hint && <Crosshair
          values={hint}
          style={'test-class-name'}
        > 
          <div style={{
              color: options.dark ? '#fff' : '#000'
            }}>
            <p>{hint[0] && hint[0].x}</p>
            {
              legend.map((e, i) => e + ": " + hint[i].y + " ")
            }
          </div>
        </Crosshair>}
      </XYPlot>
      <DiscreteColorLegend
        orientation="horizontal" width={W}
        items={legend} />
    </div>;
}