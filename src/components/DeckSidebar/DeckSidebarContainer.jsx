import React, { useState } from "react";

import DeckSidebar from "./DeckSidebar";
import HexPlot from './HexPlot';
import World from "../covid/World";
import covidConstants from "../../covid-constants";
import _ from "underscore";

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

  const getSelectedCategoryString = (currentlySelectedObj) => {
    const selectedCategoryId = Object.keys(currentlySelectedObj.selected)[0];
    return covidConstants[selectedCategoryId].sidebarHeading;
  }

  const getSelectedSubCategoryString = (currentlySelectedObj) => {
    const selectedCategoryId = Object.keys(currentlySelectedObj.selected)[0];
    const subCategory = Array.from(currentlySelectedObj.selected[selectedCategoryId])[0];

    return _.find(covidConstants[selectedCategoryId].responses, x => x.id === subCategory).label;
  }


  const closeMenuBody = <i style={{ fontSize: '2rem', color: 'white !important' }} className="fa fa-chevron-left" />;
  const openMenuBody = (
    <div style={{display : "flex", alignItems : "center"}}>
      <div>
        <b>
          Viewing:&nbsp;
          {props.currentlySelected && `${getSelectedCategoryString(props.currentlySelected)}`}
        </b>
        <br/>
        {props.currentlySelected && `${getSelectedSubCategoryString(props.currentlySelected)}`} 
      </div>
      <i style={{ fontSize: '2rem', color: 'white !important', marginLeft : 10 }} className="fa fa-chevron-right" />
    </div>
  )
  
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
        <div style={{ backgroundColor: 'rgb(1, 22, 43)', padding : 10, cursor : "pointer" }}>
          {
            open ? closeMenuBody
            : openMenuBody
          }
          
        </div>
      </div>
    </div>
  );
}