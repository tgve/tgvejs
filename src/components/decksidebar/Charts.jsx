import React from 'react';

import { propertyCount, areEqualFeatureArrays } from '../../utils/geojsonutils';
import {
  percentDiv
} from '../../utils/utils';
import {
  popPyramidPlot, plotByPropertyByDate,
  plotByProperty
} from '../showcases/plots';
import Boxplot from '../boxplot/Boxplot';

export default class Charts extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      multiVarSelect: props.multiVarSelect
    }
  }
  shouldComponentUpdate(nextProps) {
    const { data } = this.props;
    if (!data && !nextProps.data) return false
    if (data.length !== nextProps.data.length) return true
    if (areEqualFeatureArrays(data, nextProps.data)) return false
    return true
  }

  render() {
    const { data, column, dark,
      onSelectCallback } = this.props;
    const { multiVarSelect } = this.state;
    if (!data || !data.length) return null;
    const notEmpty = data && data.length > 1;
    const severity_data = propertyCount(data, "accident_severity");
    let columnDomain = [];
    // TODO: against React state?
    let timer;

    const filterOrReset = ({ points, event }, singleColumn) => {
      if (event.detail === 1) {
        // if double click ignore
        timer = setTimeout(() => {
          const x = points && points[0] && points[0].x
          if (!x) return
          /**
           * There is no harm if this is happening to
           * real datasets with single column values as
           * we check the multiVarSelect object before
           * acting on it.
           */
          if (singleColumn &&
            multiVarSelect.hasOwnProperty(column)) {
            delete multiVarSelect[column];
            typeof onSelectCallback === 'function' &&
              onSelectCallback(multiVarSelect)
          } else {
            /**
             * This selection works on replacing value for
             * current column selection in multiVarSelect
             */
            // convert back to string
            multiVarSelect[column] = new Set([points[0].x + ""]);
            this.setState({ multiVarSelect })
            onSelectCallback &&
              onSelectCallback({ what: 'multi', selected: multiVarSelect })
          }
        }, 200)
      } else if (event.detail === 2) {
        clearTimeout(timer)
      }
    }

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
        {notEmpty &&
          plotByProperty({
            data: data.filter(d => Boolean(d.properties["age_of_casualty"])),
            property: "age_of_casualty", dark, noLimit: true
          })}
        {plotByPropertyByDate(data, "sex_of_casualty", dark)}
        {notEmpty &&
          plotByProperty({
            data: data.filter(d => Boolean(d.properties[column])),
            property: column, dark, type: "bar", noLimit: true
          },
            {
              onClick: filterOrReset
            })
        }
        {popPyramidPlot({ data, dark: dark })}

      </>
    )
  }
}
