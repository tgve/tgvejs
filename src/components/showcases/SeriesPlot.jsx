import React, { useState } from 'react';
import {
  makeWidthFlexible,
  XYPlot, XAxis, YAxis, MarkSeries,
  Hint
} from 'react-vis';
import { format } from 'd3-format';

import { shortenName } from '../../utils';
import { PLOT_W } from '../../Constants';

const W = PLOT_W;
const FlexibleXYPlot = makeWidthFlexible(XYPlot);

export default function SeriesPlot(options) {
  const [hint, setHint] = useState();
  const [x, setX] = useState(null);
  const [y, setY] = useState(null);
  const [x1, setX1] = useState(null);
  const [y1, setY1] = useState(null);
  const [rect, setRect] = useState(null);
  const [selected, setSelected] = useState([]);

  const ReactSeries = options.type;
  if (!ReactSeries) return null;
  const limit = 10;

  const data = options.type !== MarkSeries && !options.noLimit &&
    options.data.length > limit ? options.data.slice(0, limit)
    : options.data;
  const dataWithColor = data.map((d, i) => ({
    ...d,
    // if selected return 0 which is:
    // ['rgb(239, 93, 40)', 'rgb(18, 147, 154)']
    color: data.length === selected.length ? 0 : Number(!selected.includes(i))
  }));

  const { plotStyle, title, noXAxis, noYAxis,
    onValueClick, onDragSelected } = options;
      
  return data && data.length > 1 &&
    // https://github.com/uber/react-vis/issues/584#issuecomment-401693372
    <div className="unselectable"
      style={{ position: 'relative' }}
      onMouseDown={(e) => {
        if (!x && !y) {
          setX(e.clientX); setY(e.clientY)
        }
      }}
      onMouseMove={(e) => {
        if (x && y) {
          const newX = e.clientX; const newY = e.clientY;
          setX1(newX); setY1(newY);
          setRect(
            <div style={{
              position: 'fixed',
              left: x > newX ? newX : x, top: y > y1 ? newY : y,
              width: Math.abs(newX - x), height: Math.abs(newY - y),
              backgroundColor: 'gray', opacity: 0.2
            }} />
          )
        }
      }}
      onMouseUp={(e) => {
        setX(null); setY(null); setX1(null); setY1(null);
        setRect(null);
        if(rect) {
          typeof(onDragSelected) === 'function' && 
          onDragSelected(selected.map(e => 
            dataWithColor[e] && dataWithColor[e].x))
        }
        setSelected([])
      }}
      onMouseOut={() => {
        if(!rect) {
          setSelected([])
        }
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
        onMouseLeave={() => { setHint(false) }}
      >
        {!noXAxis && // if provided dont
          <XAxis
            tickSize={0}
            tickFormat={v => shortenName(v, 10)}
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
              text: { fill: options.dark ? '#fff' : '#000' } //, fontWeight: plotStyle && plotStyle.fontWeight || 400 }
            }} />}
        {!noYAxis && // if provided dont
          <YAxis
            tickSize={0}
            tickLabelAngle={-45} tickFormat={v => format(".2s")(v)} style={{
              line: { strokeWidth: 0 },
              title: { fill: options.dark ? '#fff' : '#000' },
              text: { fill: options.dark ? '#fff' : '#000' } //, fontWeight: plotStyle && plotStyle.fontWeight || 400 }
            }} position="start" title={title} />
        }
        <ReactSeries
          onValueClick={onValueClick}
          // see abstract-series.js
          /*
          onNearestX(value, {
            innerX: xScaleFn(value),
            index: valueIndex,
            event: event.nativeEvent
          });
          */
          onNearestX={(datapoint, { index, innerX }) => {
            setHint({ x: datapoint.x, y: datapoint.y });
            if (rect && isWithinRect({ x, x1, value: innerX })) {
              if (!selected.includes(index)) { // prevent rerender
                setSelected([...selected, index]);
              }
              // TODO see how one can detect "leaving"
              // outside the box but rect is dragging              // setSelected(selected.filter(e => e !== index));
            } else {
              if (!rect) {              
                setSelected([index]); // single hover
              }
            }
          }}
          colorDomain={[0, 1]}
          colorRange={['rgb(239, 93, 40)', 'rgb(18, 147, 154)']}
          // style={{ fill: type === LineSeries ? 'none' : 'rgb(18, 147, 154)' }}
          data={dataWithColor} />
        {hint && <Hint value={hint} />}
      </FlexibleXYPlot>
      {x && x1 && rect}
    </div>;
}

function isWithinRect(options) {
  const { x, x1, value } = options;
  if (x1 > x) {
    if (value > x && value < x1) {
      return true
    }
    return false
  } else {
    if (value < x && value < x1) {
      return true
    }
    return false
  }
}