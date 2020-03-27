import React from 'react';

import { LineSeries } from 'react-vis';

import SeriesPlot from '../Showcases/SeriesPlot';

export default (props) => {
  const { data, dark } = props;  

  if(!data || data.length !== 2 ) return(null)

  return(
    <>
      <SeriesPlot
        noYAxis={false}
        dark={dark}
        title="Total cases" 
        plotStyle={{ height: 200,marginBottom:60 }}
        type={LineSeries}
        data={data[0]}
      /> 
      <SeriesPlot
        noYAxis={false}
        dark={dark}
        title="Daily cases"
        plotStyle={{ height: 200,marginBottom:60 }} noLimit={true}
        type={LineSeries}
        data={data[1]}
      /> 
    </>
  )
}