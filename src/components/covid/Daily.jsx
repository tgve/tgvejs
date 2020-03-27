import React, { useState } from 'react';

import { LineSeries } from 'react-vis';


import { fetchData } from "../../utils";
import { DEV_URL, PRD_URL } from '../../Constants';
import SeriesPlot from '../Showcases/SeriesPlot';
const URL = (process.env.NODE_ENV === 'development' ? DEV_URL : PRD_URL);

export default (props) => {
  const { data } = props;  

  if(!data || data.length !== 2 ) return(null)

  console.log("fiq");
  return(
    <>
      <SeriesPlot
        noYAxis={false}
        // dark={dark}
        title="Total cases" noYAxis={true}
        plotStyle={{ height: 200,marginBottom:60 }} noLimit={true}
        type={LineSeries}
        data={data[0]}
      /> 
      <SeriesPlot
        noYAxis={false}
        // dark={dark}
        title="Daily cases" noYAxis={true}
        plotStyle={{ height: 200,marginBottom:60 }} noLimit={true}
        type={LineSeries}
        data={data[1]}
      /> 
    </>
  )
}