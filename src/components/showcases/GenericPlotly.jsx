import React, { useState, useReducer } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
} from 'baseui/modal';
import { Checkbox } from 'baseui/checkbox';

import { isArray } from '../../utils/JSUtils';
import createPlotlyComponent from "./factory";
import { iWithFaName } from '../../utils/utils';
import { useStyletron } from 'baseui';

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
export default function (props) {
  const { data, width, height = 300, title = "Plot",
    xaxis = {}, yaxis = {}, displayModeBar
  } = props; // Object.assign errs on undefined
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)
  const [modeBar, setModeBar] = useState(Boolean(displayModeBar))
  const [isOpen, setOpen] = useState(false);
  const [_, theme] = useStyletron();

  const axes = { visible: true, color: theme.colors.contentPrimary }
  const sColor = { color: theme.colors.contentPrimary };

  if (!data || !isArray(data) || data.length === 0
    || !window.Plotly) return null
  // no need to import earlier
  const Plot = createPlotlyComponent(window.Plotly);
  const plot = <Plot
    useResizeHandler={true}
    style={{ minWidth: 280, width: width || '100%', height }}
    layout={{
      autosize: true,
      title: { text: title, font: sColor, xAnchor: 'center' },
      margin: { t: 30, r: 20, b: 50, l: 30 },
      paper_bgcolor: theme.colors.backgroundPrimary,
      plot_bgcolor: theme.colors.backgroundPrimary,
      xaxis: Object.assign(axes, xaxis),
      yaxis: Object.assign(sColor, yaxis),
      legend: {
        // x: 0.35, y: -0.35, orientation: 'h',
        font: sColor
      }
    }}
    config={{ displayModeBar: modeBar, responsive: true }}
    data={data}

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
        props.onClick(o)
      if (o.event && o.event.detail === 2) {
        forceUpdate()
      }
    }}
  />
  return (
    <>
      {iWithFaName('fa fa-expand', () => {
        setOpen(true);
      }, { position: 'absolute', zIndex: 999, right: 0 })}
      {plot}
      <Modal
        onClose={() => {
          setModeBar(false)
          setOpen(false);
        }}
        isOpen={isOpen}>
        <ModalHeader>
        </ModalHeader>
        <ModalBody>
          {plot}
          <Checkbox
            checked={modeBar}
            onChange={() => setModeBar(!modeBar)}
          >
            Show plotly toolbar
          </Checkbox>
        </ModalBody>
        <ModalFooter>
          <ModalButton onClick={() => {
            setOpen(false);
            setModeBar(false)
          }}>Close</ModalButton>
        </ModalFooter>
      </Modal>
    </>
  );
}
