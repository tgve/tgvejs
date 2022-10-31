import React, { useReducer } from 'react';

import { isArray } from '../../utils/JSUtils';
import createPlotlyComponent from "./factory";

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
    displayModeBar } = props; // Object.assign errs on undefined
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)
  const axes = { visible: true, color: dark && '#fff'}
  const sColor = {color: dark && '#fff'};

  if (!data || !isArray(data) || data.length === 0
    || !window.Plotly) return null
  // no need to import earlier
  const Plot = createPlotlyComponent(window.Plotly);
  return (
    <Plot
      data={data}
      layout={{
        width, height, title: {text: title, font: sColor},
        margin: { t: 30, r: 20, b: 50, l: 30 },
        paper_bgcolor: dark && '#0000', plot_bgcolor: dark && '#0000',
        xaxis: Object.assign(axes, xaxis),
        yaxis: Object.assign(sColor, yaxis),
        legend: {x: 0.35, y: -0.35, orientation: 'h',
        font: sColor}
      }}
      config={{displayModeBar: Boolean(displayModeBar)}}
      /**
       * If this expansion is moved to after the onClick
       * injection, it would overrite the expansion.
       */
      {...props}
      /** TODO/WATCH: the Plotly component does not seem to
       * do unzoom when double click happens. The issue is not
       * related to react-plotly. So for now
       * we can inject a React based reset here.
       * See: https://reactjs.org/docs/hooks-faq.html+
       * #is-there-something-like-forceupdate
       */
      onClick={(o) => {
        typeof props.onClick === 'function' &&
          /**
           * Let the calling function know this is potentially
           * a selected single value chart
           */
          props.onClick(o, data.length === 1 && data[0].x.length === 1)
        if(o.event && o.event.detail === 2) {
          forceUpdate()
        }
      }}
    />
  );
}
