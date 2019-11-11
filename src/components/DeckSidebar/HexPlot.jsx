import React, { useState, useEffect } from 'react';
import HexbinSeries from '../Showcases/HexbinSeries';

import { coordsAsXY } from '../../geojsonutils';

export default (props) => {
  // const [value, setValue] = useState([]);
  const [open, setOpen] = useState(props.isMobile === false);
  useEffect(() => {
    // if props.open change to false is
    // the only time it should react to it
    if (props.open === true) return;
    setOpen(props.open);
  }, [props.open])

  const { data } = props;
  const notEmpty = data && data.length > 1;

  if (notEmpty && data[0].geometry.type.toUpperCase() === 'POINT') {
    return (
      <div
        style={{
          marginRight: !open ? -350 : 0
        }}
        className="right-panel-container">
        <div
          className="close-button"
          onClick={() => setOpen(!open)}
          style={{ color: 'white' }}>
          <i
            style={{
              //bottom and just outside the div
              marginLeft: -16,
              bottom: 0,
              position: 'absolute',
              backgroundColor: '#242730',
              fontSize: '2rem', color: 'white !important'
            }}
            className={open ? "fa fa-arrow-circle-right" :
              "fa fa-arrow-circle-left"} />
        </div>
        <div className="right-side-panel">
          {notEmpty &&
            <HexbinSeries
              data={coordsAsXY({ features: data })}
              options={{ noXAxis: true, noYAxis: true }} />}
        </div>
      </div>
    );
  } else {
    return null
  }

};