import React from 'react';
import {
  XYPlot, XAxis, YAxis, HorizontalRectSeries
} from 'react-vis';
import { format } from 'd3-format';

import { propertyCountByProperty } from '../../geojsonutils';
import { xyObjectByProperty } from '../../utils';

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
  if (!options || !options.data || !options.data[0] ||
    !options.data[0].properties.date ||
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
  return (
    <XYPlot
      margin={{ left: options.margin || 60 }} // default is 40
      height={options.plotStyle && options.plotStyle.height || W}
      width={options.plotStyle && options.plotStyle.width || W} >
      <HorizontalRectSeries
        color='rgb(18, 147, 154)'
        stroke='black'
        data={mf_array_female} />
      <HorizontalRectSeries
        color='rgb(239, 93, 40)'
        stroke='black'
        data={mf_array_male} />

      <YAxis
        tickSize={0}
        tickFormat={v => v === 0 ? 2009 : v - 2 + 2009}
        style={{
          line: { strokeWidth: 0 },
          text: { fill: options.dark ? '#fff' : '#000', fontWeight: 400 }
        }}
      />
      {/* left={(W / 2) - 10} */}
      <XAxis
        tickSize={0}
        tickFormat={v => format(".2s")(v < 0 ? -1 * v : v)}
        style={{
          line: { strokeWidth: 0 },
          text: { fill: options.dark ? '#fff' : '#000', fontWeight: 400 }
        }}
      />
    </XYPlot>
  )
}

function crashes_plot_data(notEmpty, data, plot_data, plot_data_multi) {
  if (notEmpty) {
    Object.keys(data[1].properties).forEach(each => {
      if (each.match(/date|datetime|datestamp|timestamp/g) &&
        typeof (data[1].properties[each]) === 'string' &&
        data[1].properties[each].split("/")[2]) { //date in 09/01/2019 HARDCODE
        plot_data = xyObjectByProperty(data, "date");
        const mf = propertyCountByProperty(data, "sex_of_casualty", plot_data.map(e => e.x), "date");
        plot_data.length > 1 && // more than one years
          Object.keys(mf)
            //2009: {Male: 3295, Female: 2294}
            .forEach(k => {
              plot_data_multi[0]
                .push({
                  x: k,
                  y: mf[k].Male
                });
              plot_data_multi[1]
                .push({
                  x: k,
                  y: mf[k].Female
                });
            });
      }
    });
  }
  return plot_data;
}

export {
  crashes_plot_data,
  popPyramid
}