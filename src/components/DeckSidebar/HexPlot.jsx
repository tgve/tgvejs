import React, { useState, useEffect } from 'react';
import HexbinSeries from '../Showcases/HexbinSeries';
import MultiSelect from '../MultiSelect';

import { coordsAsXY } from '../../geojsonutils';

export default (props) => {
  // const [value, setValue] = useState([]);
  const [open, setOpen] = useState(props.open === true);
  useEffect(() => {
    setOpen(props.open);
  }, [props.open])

  const { notEmpty, data } = props;

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
          style={{ color: 'white', background: 'tansparent' }}>
          <div>
            <i
              style={{
                backgroundColor: '#242730',
                fontSize: '2rem', color: 'white !important'
              }}
              className={open ? "fa fa-arrow-circle-right" :
                "fa fa-arrow-circle-left"} />
          </div>
        </div>
        <div className="right-side-panel">
          <MultiSelect
            selectedCallback={(v) => {
              // console.log(v);

            }} />
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