import React, { useState } from "react";

import DeckSidebar from "./DeckSidebar";
import HexPlot from './HexPlot';
import World from "../covid/World";

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

  // console.log(hex);

  return (
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
          data={props.data} />}
      {props.world && <World isMobile={props.isMobile} 
        data={props.world} dark={props.dark}/>}
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
  );
}