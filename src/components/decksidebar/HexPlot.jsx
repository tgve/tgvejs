import React, { useState, useEffect } from 'react';
import { useStyletron } from 'baseui';

import HexbinSeries from '../showcases/HexbinSeries';
import { coordsAsXY } from '../../utils/geojsonutils';

export default (props) => {
  const [open, setOpen] = useState(props.isMobile === false);
  const [css, theme] = useStyletron();
  useEffect(() => {
    // if props.open change to false is
    // the only time it should react to it
    if (props.open === true) return;
    setOpen(props.open);
  }, [props.open])

  const { data } = props;
  const notEmpty = data && data.length > 1;
  console.log(theme);
  if (notEmpty && data[0].geometry.type.toUpperCase() === 'POINT') {
    return (
      <div
        style={{
          marginRight: !open ? -350 : 0,
          backgroundColor: theme.colors.backgroundTertiary
        }}
        className="right-panel-container">
        <div
          className="close-button"
          onClick={() => setOpen(!open)}
          style={{ color: theme.colors.contentPrimary }}>
          <i
            style={{
              //bottom and just outside the div
              marginLeft: -16,
              bottom: 0,
              position: 'absolute',
              backgroundColor: theme.colors.backgroundTertiary,
              fontSize: '2rem', color: 'white !important'
            }}
            className={open ? "fa fa-arrow-circle-right" :
              "fa fa-arrow-circle-left"} />
        </div>
        <div>
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
