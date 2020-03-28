import React from 'react';

import { LineSeries } from 'react-vis';

import SeriesPlot from '../Showcases/SeriesPlot';
import MultiLinePlot from '../Showcases/MultiLinePlot';

export default (props) => {
  const { data, dark } = props;  
  console.log(data);

  if(!data || data.length <= 2 ) return(null)
  
  return(
    <>
      <MultiLinePlot
        dark={dark}
        data={
          [data[0], data[2], data[3]]
        } legend={["Cases", "Death", "DailyDeaths"]}
        title={"Total"} noXAxis={true}
        plotStyle={{ height: 200, marginBottom: 10 }}
      />
      <SeriesPlot
        dark={dark}
        title="Daily cases"
        plotStyle={{ height: 200,marginBottom:60 }} noLimit={true}
        type={LineSeries}
        data={data[1]}
      /> 
    </>
  )
}