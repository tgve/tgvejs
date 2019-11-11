import * as React from "react";

import DeckSidebar from "./DeckSidebar";
import HexPlot from './HexPlot';

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
  const [open, setOpen] = React.useState(!props.isMobile);
  // console.log(open);

  return (
    <div className="side-panel-container"
      style={{ marginLeft: open ? 0 : '-320px' }}>
      <DeckSidebar {...props} toggleOpen={() => {
        setOpen(!open)
      }} />
      <HexPlot open={open} isMobile={props.isMobile}
        data={props.data} />
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