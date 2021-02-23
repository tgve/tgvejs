import React from 'react';
import {
  XYPlot, XAxis, YAxis, HorizontalRectSeries,
  DiscreteColorLegend
} from 'react-vis';
import { format } from 'd3-format';

import { isStringDate, propertyCountByProperty } from '../../geojsonutils';
import { isArray } from '../../JSUtils';
import { PLOT_W, TURQUOISE_RANGE } from '../../Constants';
import { xyObjectByProperty, humanize } from '../../utils';
import { scaleSequential } from 'd3-scale';

import GenericPlotly from './GenericPlotly';

const W = PLOT_W,
  COLOR_F = 'rgb(18, 147, 154)',
  COLOR_M = 'rgb(239, 93, 40)';


const plotByPropertyByDate = (data, property, dark) => {
  if (!data || !isArray(data) || !data.length || !property) return null;

  const plot_data_multi = arrayOfYearAndProperty(data, property);

  if(!plot_data_multi) return null;

  return (
    <GenericPlotly dark={dark}
      yaxis={{ showgrid: false }}
      xaxis={{ showgrid: false }}
      data={
        plot_data_multi.map((r, i) => ({
          mode: 'lines',
          showlegend: false,
          x: r.map(e => e.x)
            // TODO: more robust sorting of dates
            .sort((a, b) => new Date(a) - new Date(b)),
          y: r.map(e => e.y),
          name: ["Male", "Female", "Total"][i],
          marker: { color: scaleSequential(TURQUOISE_RANGE)(i / plot_data_multi.length) }
        }))} title="Sex of Casualty" />
  )
}
/**
 * 
 * @param {Object} data 
 * @param {String} property 
 * @param {Boolean} dark 
 */
const plotByProperty = (data, property, dark) => {
  if (!data || !isArray(data) || !data.length) return null;

  const data_by_prop = data[0].properties.hasOwnProperty(property) &&
    xyObjectByProperty(data, property)
  
  if(!data_by_prop) return null;

  console.log(data_by_prop);
  return (
    <GenericPlotly dark={dark}
      yaxis={{ showgrid: false }}
      xaxis={{ showgrid: false }}
      data={[{
        // showlegend: false,
        x: data_by_prop.map(e => +(e.x)),
        y: data_by_prop.map(e => +(e.y)),
        marker: { color: TURQUOISE_RANGE[0] }
      }]}
      title={humanize(property)} />
  )
}

/**
 * Generate a population pyramid using Rect-vis series objects.
 * Series objects are formatted as {left,right,bottom, top}
 * 
 * Currently semi hardcoded for sex_of_casualty and date from
 * STATS19 dataset
 * 
 * @param {Object} options 
 */
const popPyramidPlot = (options) => {
  if (!options || !options.data || !options.data[0] ||
    !options.data[0].properties.date ||
    !options.data[0].properties.sex_of_casualty) return;
  const mf = propertyCountByProperty(options.data, "sex_of_casualty", "date");
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
    <>
      <XYPlot
        margin={{ left: options.margin || 60 }} // default is 40
        height={options.plotStyle && options.plotStyle.height || W}
        width={options.plotStyle && options.plotStyle.width || W} >
        <HorizontalRectSeries
          color={COLOR_F}
          stroke='black'
          data={mf_array_female} />
        <HorizontalRectSeries
          color={COLOR_M}
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
      <DiscreteColorLegend
        orientation="horizontal" width={W}
        items={[
          { title: "Male", color: COLOR_M },
          { title: "Female", color: COLOR_F }
        ]}
      />
    </>
  )
}

/**
 * Function looks at date for two properties and generates a react-vis
 * ready two-dimensional array of the two propties. Currently it is semi-hard-coded.
 * 
 * A function like this is meant to make converting geojson data object given,
 * to charting library ready format to be consumed.
 * 
 * @param {Object} data 
 * @param {String} column 
 */
const arrayOfYearAndProperty = (data, column) => {
  const notEmpty = isArray(data) && data.length > 0 && column;
  const plot_data_multi = [[], [], []];

  if (notEmpty) {
    // return 0 for 1 item array or generate random
    const n = data.length === 1 ? 0 :
      Math.floor((Math.random() * (data.length - 1)) + 1);
    const timeCols = Object.keys(data[n].properties)
      .filter(each => isStringDate(data[n].properties[each]));
    if (timeCols.length > 0) {
      const mf = propertyCountByProperty(data, column, timeCols[0]);
      // mf === 2009: {Male: 3295, Female: 2294}
      mf && Object.keys(mf).length > 1 && // more than one years
        Object.keys(mf)
          .forEach(y => { // year
            if (y && mf[y].Male && mf[y].Female) {
              plot_data_multi[0]
                .push({
                  x: y,
                  y: mf[y].Male
                });
              plot_data_multi[1]
                .push({
                  x: y,
                  y: mf[y].Female
                });
              plot_data_multi[2]
                .push({
                  x: y,
                  y: mf[y].Male + mf[y].Female
                })
            }
          });
    }
  }
  return plot_data_multi;
}

export {
  arrayOfYearAndProperty,
  plotByPropertyByDate,
  plotByProperty,
  popPyramidPlot
}