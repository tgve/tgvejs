import React from 'react';

import { isArray } from '../../JSUtils';
import Plotly from "plotly.js";
import createPlotlyComponent from "./factory";

const Plot = createPlotlyComponent(Plotly);
/**
 * React Hook generic Plotly plot which takes data in the following format:
 * [
    {
      x: [1, 2, 3],
      y: [2, 6, 3],
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: 'red' },
      name: 'fiq',
    },
    { 
      x: [1, 2], 
      y: [2, 5],
      type: 'line', 
      name: 'lush'
    },
  ]
 * @param {Object} props 
 */
export default function(props) {
  const { data, width = 250, height = 200, title = "Plot",
    dark, xaxis = {}, yaxis = {},
    displayModeBar, onClickCallback } = props; // Object.assign errs on undefined
  
  const axes = { visible: true, color: dark && '#fff'}
  const sColor = {color: dark && '#fff'};

  if (!data || !isArray(data) || data.length === 0) return null
  return (
    <Plot
      data={data}
      layout={{
        width, height, title: {text: title, font: sColor},
        // margin: { t: 30, r: 20, b: 50, l: 30 },
        paper_bgcolor: dark && '#0000', plot_bgcolor: dark && '#0000',
        xaxis: Object.assign(axes, xaxis), 
        yaxis: Object.assign(sColor, yaxis),
        legend: {x: 0.35, y: -0.35, orientation: 'h',
        font: sColor}
      }}
      onClick={(e) => {
        typeof onClickCallback === 'function'
        && onClickCallback(e.points)
      }}
      config={{displayModeBar: !displayModeBar && false}}
    />
  );
}