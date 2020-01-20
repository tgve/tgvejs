import React, {useState} from 'react';
import {
  makeWidthFlexible, 
  XYPlot, XAxis, YAxis, LineSeries, MarkSeries, 
  Hint} from 'react-vis';
import { format } from 'd3-format';

import { shortenName } from '../../utils';

const W = 250;
const FlexibleXYPlot = makeWidthFlexible(XYPlot); 

export default function SeriesPlot (options) {
  const [hint, setHint] = useState();
  const [x, setX] = useState(null);
  const [y, setY] = useState(null);
  const [x1, setX1] = useState(null);
  const [y1, setY1] = useState(null);
  const [rect, setRect] = useState(null);

  const ReactSeries = options.type;
  const limit = 10;
  if (!ReactSeries) return null;
  const data = options.type !== MarkSeries && !options.noLimit &&
    options.data.length > limit ? options.data.slice(0, limit)
    : options.data
  const { plotStyle, title, noXAxis, noYAxis, type,
    onValueClick } = options;
  console.log(x, y, x1, y1);
  return data && data.length > 1 &&
    // https://github.com/uber/react-vis/issues/584#issuecomment-401693372
    <div className="unselectable" 
      style={{position: 'relative'}}
      onMouseDown={(e) => {
        if(!x && !y) {
          setX(e.clientX); setY(e.clientY)
        }
      }}
      onMouseMove={(e) => {
        if(x && y) {
          const newX = e.clientX; const newY = e.clientY;
          setX1(newX); setY1(newY);
          setRect(
            <div style={{
              position: 'fixed',
              left: x > newX ? newX : x, top: y, 
              width: Math.abs(newX - x), height: Math.abs(newY-y),
              backgroundColor: 'gray', opacity: 0.2}}/>
          )
        }
      }}
      onMouseUp={(e) => {
        setX(null); setY(null); setX1(null); setY1(null);
        setRect(null);
        }}
      >
      {options.type !== MarkSeries && !options.noLimit &&
        options.data && options.data.length > limit &&
        <h4>Plotting first {limit} values:</h4>}
      {noYAxis && title &&
        <h4>{title}</h4>
      }
      <FlexibleXYPlot xType="ordinal"
        margin={{ bottom: (plotStyle && plotStyle.marginBottom) || 40 }} // default is 40
        animation={{ duration: 1 }}
        height={(plotStyle && plotStyle.height) || W}
        width={(plotStyle && plotStyle.width) || W} 
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
          onNearestX={(datapoint, {event})=>{  
            console.log(event.clientX)                 
            setHint(datapoint)            
          }}
          style={{ fill: type === LineSeries ? 'none' : 'rgb(18, 147, 154)' }}
          data={data} />
        {hint && <Hint value={hint} />}
      </FlexibleXYPlot>
      {x && x1 && rect}
    </div>;
}