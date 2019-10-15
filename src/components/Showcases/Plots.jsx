import React from 'react';
import {
  XYPlot, XAxis, YAxis, LineSeries, MarkSeries,
  HorizontalRectSeries
} from 'react-vis';
import { format } from 'd3-format';

import { propertyCountByProperty } from '../../geojsonutils';

const popPyramid = (options) => {
  if (!options || !options.data) return;
  const mf = propertyCountByProperty(options.data, "sex_of_casualty",
    ["Male", "Female"], "date");
  const mf_array_male = [];
  const mf_array_female = [];
  if (Object.keys(mf).length === 1) return;

  mf && Object.keys(mf).forEach((y, i) => {
    mf_array_male.push({
      x: 0,
      x0: +(mf[y].Male),
      y: i === 0 ? 0 : i,
      y0: i + 1,
      color: "#428BCA"
    })
  })
  mf && Object.keys(mf).forEach((y, i) => {
    mf_array_female.push({
      x: 0,
      x0: -1 * (+(mf[y].Female)),
      y: i === 0 ? 0 : i,
      y0: i + 1
    })
  })
  // const d = [Array.apply(null, { length: 9 })
  //   .map(Number.call, Number).map(d => d + 2009)]
  //   .map((e, i) =>
  //     ({
  //       x: i % 2 ? 1 : -1,
  //       x0: (i % 2 ? 1 : -1) * (i + 5),
  //       y: e === 0 ? 2009 : e,
  //       y0: i % 2 ? (e - 1 + 5) : e + 5
  //     })
  //   )
  const W = 250;
  return (
    <XYPlot
      margin={{ left: options.margin || 60 }} // default is 40
      height={options.plotStyle && options.plotStyle.height || 250}
      width={options.plotStyle && options.plotStyle.width || W} >
      <HorizontalRectSeries
        color="red"
        stroke='black'
        data={mf_array_female} />
      <HorizontalRectSeries
        color="blue"
        stroke='black'
        data={mf_array_male} />

      <YAxis
        tickFormat={v => v === 0 ? 2009 : v - 2 + 2009}
        style={{ text: { fill: '#fff' } }}
      />
      {/* left={(W / 2) - 10} */}
      <XAxis
        tickFormat={v => format(".2s")(v < 0 ? -1 * v : v)}
        style={{ text: { fill: '#fff' } }}
      />
    </XYPlot>
  )
}

const seriesPlot = (options) => {
  const ReactSeries = options.type;
  if (!ReactSeries) return null;
  const data = options.type !== MarkSeries &&
    options.data.length > 10 ? options.data.slice(0, 10)
    : options.data
  return options.data && options.data.length > 1 &&
    <>
      {options.type !== MarkSeries &&
        options.data && options.data.length > 10 &&
        <h4>Plotting first 10 values:</h4>}
      <XYPlot xType="ordinal"
        margin={{ bottom: options.margin || 40 }} // default is 40
        animation={{ duration: 1 }}
        height={options.plotStyle && options.plotStyle.height || 250}
        width={options.plotStyle && options.plotStyle.width || 250} >
        {!options.noXAxis && // if provided dont
          <XAxis position="right" tickLabelAngle={-45} style={{
            text: { fill: '#fff', fontWeight: 400 }
          }} />}
        {!options.noYAxis && // if provided dont
          <YAxis tickLabelAngle={-45} tickFormat={v => format(".2s")(v)} style={{
            title: { fill: '#fff' },
            text: { fill: '#fff', fontWeight: 400 }
          }} position="start" title={options.title} />
        }
        <ReactSeries
          onValueClick={options.onValueClick}
          onSeriesMouseOver={(event) => {
          }}
          style={{ fill: options.type === LineSeries ? 'none' : 'rgb(18, 147, 154)' }}
          data={data} />
      </XYPlot>
    </>;
}

export {
  seriesPlot,
  popPyramid
}