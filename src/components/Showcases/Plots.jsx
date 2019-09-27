import React from 'react';
import { XYPlot, XAxis, YAxis, LineSeries } from 'react-vis';
import { format } from 'd3-format';

const seriesPlot = (options) => {
    const ReactSeries = options.type;
  return options.data && options.data.length > 1 && 
  <XYPlot xType="ordinal"
    margin={{bottom: options.margin || 40}} // default is 40
    animation={{ duration: 1 }} height={250} width={250}>
    <XAxis position="right" tickLabelAngle={-45} style={{
      text: { fill: options.dark ? '#fff' : '#000', fontWeight: 400 }
    }} />
    <YAxis tickLabelAngle={-45} tickFormat={v => format(".2s")(v)} style={{
      title: { fill: options.dark ? '#fff' : '#000' },
      text: { fill: options.dark ? '#fff' : '#000', fontWeight: 400 }
    }} position="start" title={options.title} />
    <ReactSeries 
    onValueClick={options.onValueClick}
    onSeriesMouseOver={(event) => {
    }} 
    style={{ fill: options.type === LineSeries ? 'none' : 'rgb(18, 147, 154)'}} 
    data={options.data} />
  </XYPlot>;
}

export {
    seriesPlot
}