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

  const limit = 10;

  const { plotStyle, title, noXAxis, noYAxis,
    onValueClick, data, legend } = options;

  if (!Array.isArray(data) || data.length > limit) return null;
  
  // https://github.com/uber/react-vis/issues/584#issuecomment-401693372
  return <div 
    className="unselectable" style={{ position: 'relative', color: '#fff' }}>
      {!options.noLimit &&
        options.data && options.data.length > limit &&
        <h4>Plotting first {limit} values:</h4>}
      {noYAxis && title &&
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
            position="right" tickLabelAngle={-65} style={{
              line: { strokeWidth: 0 },
              text: { fill: options.dark ? '#fff' : '#000' } //, fontWeight: plotStyle && plotStyle.fontWeight || 400 }
            }} />}
        {!noYAxis && // if provided dont
          <YAxis
            tickSize={0}
            tickLabelAngle={-45} tickFormat={v => format(".2s")(v)} 
            style={{
              line: { strokeWidth: 0 },
              title: { fill: options.dark ? '#fff' : '#000' },
              text: { fill: options.dark ? '#fff' : '#000' } //, fontWeight: plotStyle && plotStyle.fontWeight || 400 }
            }} 
            position="start" title={title} />
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
          className={'test-class-name'}
        />}
      </XYPlot>
      <DiscreteColorLegend
        orientation="horizontal" width={W}
        items={legend} />
    </div>;
}
