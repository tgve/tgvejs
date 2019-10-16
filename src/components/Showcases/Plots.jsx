import React from 'react';
import {
  XYPlot, XAxis, YAxis, LineSeries, MarkSeries,
  HorizontalRectSeries
} from 'react-vis';
import { format } from 'd3-format';

import { propertyCountByProperty } from '../../geojsonutils';
import { shortenName } from '../../utils';

const W = 250;

/**
 * Generate a population pyramid using Rect-vis series objects.
 * Series objects are formatted as {left,right,bottom, top}
 * 
 * Currently semi hardcoded for sex_of_casualty and date from
 * STATS19 dataset
 * 
 * @param {Object} options 
 */
const popPyramid = (options) => {
  if (!options || !options.data || !options.data[0].properties.date ||
    !options.data[0].properties.sex_of_casualty) return;
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
  return (
    <XYPlot
      margin={{ left: options.margin || 60 }} // default is 40
      height={options.plotStyle && options.plotStyle.height || W}
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
  const limit = 10;
  if (!ReactSeries) return null;
  const data = options.type !== MarkSeries && !options.noLimit &&
    options.data.length > limit ? options.data.slice(0, limit)
    : options.data
  const { plotStyle, title, noXAxis, noYAxis, type,
    onValueClick } = options;
  return options.data && options.data.length > 1 &&
    <>
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
        width={plotStyle && plotStyle.width || W} >
        {!noXAxis && // if provided dont
          <XAxis 
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
            text: { fill: '#fff'} //, fontWeight: plotStyle && plotStyle.fontWeight || 400 }
          }} />}
        {!noYAxis && // if provided dont
          <YAxis tickLabelAngle={-45} tickFormat={v => format(".2s")(v)} style={{
            title: { fill: '#fff' },
            text: { fill: '#fff'} //, fontWeight: plotStyle && plotStyle.fontWeight || 400 }
          }} position="start" title={title} />
        }
        <ReactSeries
          onValueClick={onValueClick}
          onSeriesMouseOver={(event) => {
          }}
          style={{ fill: type === LineSeries ? 'none' : 'rgb(18, 147, 154)' }}
          data={data} />
      </XYPlot>
    </>;
}

export {
  seriesPlot,
  popPyramid
}