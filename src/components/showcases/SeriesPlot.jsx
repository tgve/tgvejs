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
  const [selected, setSelected] = useState([]);

  const ReactSeries = options.type;
  if (!ReactSeries) return null;
  const limit = 10;

  const data = options.type !== MarkSeries && !options.noLimit &&
    options.data && options.data.length > limit ? options.data.slice(0, limit)
    : options.data;

  const { plotStyle, title, noXAxis, noYAxis,
    onValueClick, onDragSelected } = options;

  if (!data || !data.length) return null

  return (
    // https://github.com/uber/react-vis/issues/584#issuecomment-401693372
    <div className="unselectable"
      style={{ position: 'relative' }}
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
          onNearestX={(datapoint) => {
            setHint({ x: datapoint.x, y: datapoint.y });
          }}
          // colorDomain={[0, 1]}
          // colorRange={['rgb(239, 93, 40)', 'rgb(18, 147, 154)']}
          // style={{ fill: type === LineSeries ? 'none' : 'rgb(18, 147, 154)' }}
          data={data} />
        {hint && <Hint value={hint} />}
      </FlexibleXYPlot>
    </div>);
}
