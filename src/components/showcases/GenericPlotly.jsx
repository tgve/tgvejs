import React from 'react';
import Plot from 'react-plotly.js';
import { isArray } from '../../JSUtils';

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
export default function Plotly(props) {
  const { data, width = 250, height = 200, title = "Plot",
    dark, xaxis = {}, yaxis = {}} = props; // Object.assign errs on undefined
  
  const axes = { visible: true, color: dark && '#fff',
  tickformat: ',d' }
  if (!data || !isArray(data) || data.length === 0) return null

  return (
    <Plot
      data={data}
      layout={{
        width, height, title: {text: title, font: {color: dark && '#fff'}},
        margin: { t: 30, r: 20, b: 50, l: 20 },
        paper_bgcolor: dark && '#000', plot_bgcolor: dark && '#000',
        xaxis: Object.assign(axes, xaxis), 
        yaxis: Object.assign(axes, yaxis),
        legend: {x: 0.35, y: -0.35, orientation: 'h'}
      }}
    />
  );
}