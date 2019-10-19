import React, {useState} from 'react';
import {
  XYPlot, XAxis, YAxis, LineSeries, MarkSeries, 
  Hint} from 'react-vis';
import { format } from 'd3-format';

import { shortenName } from '../../utils';

const W = 250;

export default function SeriesPlot (options) {
  const [hint, setHint] = useState();

  const ReactSeries = options.type;
  const limit = 10;
  if (!ReactSeries) return null;
  const data = options.type !== MarkSeries && !options.noLimit &&
    options.data.length > limit ? options.data.slice(0, limit)
    : options.data
  const { plotStyle, title, noXAxis, noYAxis, type,
    onValueClick } = options;
  return options.data && options.data.length > 1 &&
    // https://github.com/uber/react-vis/issues/584#issuecomment-401693372
    <div style={{position: 'relative'}}>
      {options.type !== MarkSeries && !options.noLimit &&
        options.data && options.data.length > limit &&
        <h4>Plotting first {limit} values:</h4>}
      {noYAxis && title &&
        <h4>{title}</h4>
      }
      <XYPlot xType="ordinal"
        margin={{ bottom: plotStyle && plotStyle.marginBottom || 40 }} // default is 40
        animation={{ duration: 1 }}
        height={plotStyle && plotStyle.height || W}
        width={plotStyle && plotStyle.width || W} 
        onMouseLeave={() => {setHint(false)}}
        >
        {!noXAxis && // if provided dont
          <XAxis
            tickSize={0}
            tickFormat={ v => shortenName(v, 10)}
            tickValues={
              (data.length > limit)
                ? data
                  .filter((item, idx) => {
                    if ((idx % Math.floor(data.length / limit)) === 0) {
                      return item.x
                    }
                  }).map(item => (item.x))
                : data.map(item => (item.x))
            }
            position="right" tickLabelAngle={-65} style={{
              line: { strokeWidth: 0 },
              text: { fill: '#fff'} //, fontWeight: plotStyle && plotStyle.fontWeight || 400 }
            }} />}
        {!noYAxis && // if provided dont
          <YAxis 
            tickSize={0}
            tickLabelAngle={-45} tickFormat={v => format(".2s")(v)} style={{
              line: { strokeWidth: 0 },
              title: { fill: '#fff' },
              text: { fill: '#fff'} //, fontWeight: plotStyle && plotStyle.fontWeight || 400 }
            }} position="start" title={title} />
        }
        <ReactSeries
          onValueClick={onValueClick}
          onNearestX={(datapoint)=>{                   
            setHint(datapoint)            
          }}
          style={{ fill: type === LineSeries ? 'none' : 'rgb(18, 147, 154)' }}
          data={data} />
        {hint && <Hint value={hint} />}
      </XYPlot>
    </div>;
}