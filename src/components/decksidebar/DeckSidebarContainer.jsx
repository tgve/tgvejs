import React, { useEffect, useState } from "react";

import DeckSidebar from "./DeckSidebar";
import HexPlot from './HexPlot';
import {
  BOTTOM_PANEL_MARGIN_LEFT, BOTTOM_PANEL_MARGIN_RIGHT,
  BOTTOM_PANEL_MARGIN_BOTTOM
} from '../../Constants';

import { theme, isMobile } from '../../utils';
/**
 * The idea of this component is to avoid 
 * rerender in the main component, everytime
 * open/close is executed. 
 * 
 * It could add further states to save main component rerendering 
 * if need be.
 * 
 */
export default (props) => {
  const [open, setOpen] = useState(!props.isMobile);
  const [hex, setHex] = useState(false);

  useEffect(() => {

  }, props.bottomPanel)
  return (
    <>
      <div className="side-panel-container"
        style={{ marginLeft: open ? 0 : '-320px' }}>
        <DeckSidebar {...props}
          // Note: 
          // *****************************
          // Hooks is strange see this
          // https://stackoverflow.com/a/54069332/2332101
          // *****************************
          toggleOpen={() => setOpen(o => !o)}   // o is current open
          toggleHexPlot={() => setHex(h => !h)} // h is current hex
        />
        {hex &&
          <HexPlot open={open} isMobile={props.isMobile}
            data={props.data} />
        }
        <div
          className="close-button"
          onClick={() => setOpen(!open)}
          style={{ color: 'white' }}>
          <div style={{ backgroundColor: '#242730' }}>
            <i
              style={{ fontSize: '2rem', color: 'white !important' }}
              className={open ? "fa fa-arrow-circle-left" :
                "fa fa-arrow-circle-right"} />
          </div>
        </div>
      </div>
      {/* {console.log(!isMobile() && props.bottomPanel)} */}
      {!isMobile() && props.bottomPanel &&
        <div
          style={{
            visibility: open ? 'visible' : 'hidden',
            ...theme(props.dark),
            marginLeft: BOTTOM_PANEL_MARGIN_LEFT,
            marginBottom: BOTTOM_PANEL_MARGIN_BOTTOM,
            marginRight: BOTTOM_PANEL_MARGIN_RIGHT,
            paddingLeft: 30, paddingRight: 30,
            opacity: 0.8
          }}
          className="mapboxgl-ctrl-bottom-left mapbox-legend bottom-panel">
          {props.bottomPanel}
        </div>
      }
    </>
  );
}