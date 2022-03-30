import React from 'react';

import { VerticalBarSeries } from 'react-vis';
import { propertyCount, arrayPlotProps } from '../../utils/geojsonutils';
import {
  percentDiv
} from '../../utils/utils';
import {
  popPyramidPlot, plotByPropertyByDate,
  plotByProperty
} from '../showcases/plots';
import Boxplot from '../boxplot/Boxplot';
import SeriesPlot from '../showcases/SeriesPlot';

export default class Charts extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      multiVarSelect: props.multiVarSelect
    }
  }
  shouldComponentUpdate(nextProps) {
    const { data } = this.props;
  //  //TODO: a bit better now but more is needed.
  //   // this solves a lag in large datasets
  //   // a more functional way is needed
  //   // e.g JSON.stringify like in Welcome.js etc
  //   // consider change in unfilteredData too
    if (!data && !nextProps.data) return false
    const r = Math.floor(Math.random() * data.length)
    if (data.length !== nextProps.data.length) return true
    if (JSON.stringify(data[r]) === JSON.stringify(nextProps.data[r])) {
      return false
    }
    return true
  }
  render() {
    const { data, column, hideCharts, dark,
      onSelectCallback } = this.props;
    const { multiVarSelect } = this.state;
    if (!data || !data.length) return null;
    const notEmpty = data && data.length > 1;
    const columnPlot = !hideCharts && notEmpty ?
      arrayPlotProps(data,
        //prop
        column
      ) : [];
    const severity_data = propertyCount(data, "accident_severity");
    let columnDomain = [];

    return (
      <>
        {columnDomain.length > 1 &&
          <Boxplot data={columnDomain} />}
        {/* TODO: generate this declaritively too */}
        {
          severity_data && severity_data.map(each =>
            percentDiv(each.x, 100 * each.y / data.length, () => {
              if (multiVarSelect && multiVarSelect['accident_severity'] &&
                multiVarSelect['accident_severity'].has(each.x)) {
                delete multiVarSelect['accident_severity'];
              } else {
                multiVarSelect['accident_severity'] = new Set([each.x]);
                this.setState({ multiVarSelect })
              }
              onSelectCallback &&
                onSelectCallback(Object.keys(multiVarSelect).length === 0 ?
                  { what: '' } : { what: 'multi', selected: multiVarSelect })
            }, dark))
        }
        {/* distribution example */}
        {notEmpty && plotByProperty(
          data.filter(d => Boolean(d.properties["age_of_casualty"])),
          "age_of_casualty", dark, undefined, true)}
        {plotByPropertyByDate(data, "sex_of_casualty", dark)}

        {!hideCharts && <SeriesPlot
          dark={dark}
          data={columnPlot.data}
          type={VerticalBarSeries}
          onValueClick={(datapoint) => {
            // convert back to string
            multiVarSelect[column ||
              barChartVariable] = new Set([datapoint.x + ""]);
            this.setState({ multiVarSelect })
            onSelectCallback &&
              onSelectCallback({ what: 'multi', selected: multiVarSelect })
          }}
          onDragSelected={(datapoints) => {
            multiVarSelect[column ||
              barChartVariable] = new Set(datapoints.map(e => e + ""));
            this.setState({ multiVarSelect })
            onSelectCallback &&
              onSelectCallback({ what: 'multi', selected: multiVarSelect })
          }}
          plotStyle={{ marginBottom: 100 }} noYAxis={true}

        />}
        {!hideCharts
          && popPyramidPlot({ data, dark: dark })}

      </>
    )
  }
}
