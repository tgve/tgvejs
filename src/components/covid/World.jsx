import React, { useState } from 'react';

import { breakdown } from './utils';
import { VerticalBarSeries } from 'react-vis';
import SeriesPlot from '../Showcases/SeriesPlot';

export default React.memo((props) => {
  const [open, setOpen] = useState(props.isMobile === false);
  const { data, dark } = props;
  const notEmpty = data && data.length > 1;
  if (notEmpty) {
    let world = breakdown(data);
    world = Object.keys(world)
    .filter(e => world[e] > 30000)
    .map(e => ({x:e, y: world[e]}));
    console.log(world);
    
    return (
      <div
        style={{
          marginRight: !open ? -340 : 0,
          background: dark ? '#242730' : 'white',
          color: dark ? 'white' : 'black'
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
              fontSize: '2rem', color: 'white !important'
            }}
            className={open ? "fa fa-arrow-circle-right" :
              "fa fa-arrow-circle-left"} />
        </div>
        <div>
          <SeriesPlot
            dark={dark}
            title="World(>30k)"
            plotStyle={{ height: 200, width: 350 }}
            type={VerticalBarSeries}
            // sorts the results if x is a number
            // TODO: do we want to do this?
            // also think about sorting according to y
            data={world}
          />
        </div>
      </div>
    );
  } else {
    return null
  }
});