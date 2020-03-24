import React, { useState } from 'react';

import { LineSeries } from 'react-vis';


import { fetchData } from "../../utils";
import { DEV_URL, PRD_URL } from '../../Constants';
import SeriesPlot from '../Showcases/SeriesPlot';
const URL = (process.env.NODE_ENV === 'development' ? DEV_URL : PRD_URL);

export default (props) => {
  const [daily, setDaily] = useState(null)

  fetchData(URL + "/api/covid19d",
  (data, error) => {
    if(!error) {
      setDaily(
        [
          data.map(e => ({
            x: e.DateVal,
            y:e.CumCases
          })),
          data.map(e => ({
            x: e.DateVal,
            y:e.CMODateCount
          }))
        ]
      );
    }
  })

  if(!daily) return(null)
  
  return(
    <>
      <SeriesPlot
        noYAxis={false}
        // dark={dark}
        title="Total cases" noYAxis={true}
        plotStyle={{ height: 200,marginBottom:60 }} noLimit={true}
        type={LineSeries}
        data={daily[0]}
      /> 
      <SeriesPlot
        noYAxis={false}
        // dark={dark}
        title="Daily cases" noYAxis={true}
        plotStyle={{ height: 200,marginBottom:60 }} noLimit={true}
        type={LineSeries}
        data={daily[1]}
      /> 
    </>
  )
}