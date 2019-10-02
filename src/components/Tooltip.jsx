import React from 'react';
import { LineSeries, VerticalBarSeries } from 'react-vis';
import { Table } from 'baseui/table';
import { humanize } from '../utils';
import { seriesPlot } from './Showcases/Plots';

const WIDTH = 220;
const BAR_HEIGHT = 80;

export default class Tooltip extends React.Component {
  constructor(props) {
    super();
    this.state = {
      isMobile: props.isMobile,
    };
    this._listPropsAndValues = this._listPropsAndValues.bind(this);
  }

  componentWillMount() {
    window.addEventListener('resize', this._handleWindowSizeChange.bind(this));
  }

  // make sure to remove the listener
  // when the component is not mounted anymore
  componentWillUnmount() {
    window.removeEventListener('resize', this._handleWindowSizeChange.bind(this));
  }

  _handleWindowSizeChange = () => {
    this.forceUpdate()
  };

  /**
   * hoverdObject can be of two types so far:
   * 1. collections of points with `.points` property
   * 2. properties of `.type === 'Feature'`.
   */
  render() {
    const { topx, topy, hoveredObject } = this.props;
    const { isMobile } = this.state;
    // console.log(x,y);

    if (!hoveredObject) return null;

    const type_feature = hoveredObject.type && 
    hoveredObject.type === 'Feature';
    let list;
    let crashes_data = [];
    let severity_data = [];

    if (!type_feature) {
      list = hoveredObject.points.map(feature => {
        const aKey = {}
        if (feature.properties.hasOwnProperty('accident_severity')) {
          aKey.severity = feature.properties.accident_severity;
        }
        if (feature.properties.hasOwnProperty('date')) {
          aKey.year = feature.properties.date.split("/")[2];
        }
        return (aKey)
      });
      const map = new Map()
      //aggregate severity and years
      list.forEach(element => {
        if (element.hasOwnProperty('severity')) {
          if (map.get(element.severity)) {
            map.set(element.severity, map.get(element.severity) + 1)
          } else {
            map.set(element.severity, 1)
          }
        }
        if (element.hasOwnProperty('year')) {
          if (map.get(element.year)) {
            map.set(element.year, map.get(element.year) + 1)
          } else {
            map.set(element.year, 1)
          }
        }
      });
      // list severity and year counts
      Array.from(map.keys()).forEach(key => {
        // console.log(key, [ ...map.keys() ]);
        if (parseInt(key)) { // TODO: replace with moment check - is it year?
          crashes_data.push({ x: key, y: map.get(key) })
        } else {
          severity_data.push({ x: key, y: map.get(key) })
        }
      })
    }
    const w = window.innerWidth;
    const y = window.innerHeight;
    const n_topy = isMobile ? 10 :
      topy + (WIDTH + BAR_HEIGHT) > y ? topy - WIDTH : topy;
    const n_left = isMobile ? 10 :
      topx + WIDTH > w ? topx - WIDTH : topx;    
    const tooltip =
      <div
        className="xyz" style={{
          top: crashes_data.length > 1 ? n_topy : topy,
          left: crashes_data.length > 1 ? n_left : topx
        }}>
        <div>
          <b>Total:{type_feature ? 1 : hoveredObject.points.length}</b>
        </div>
        <div>
          {
            // Simple logic, if points and less two points or less,
            // or not poingts, hard to expect React-vis generating plot.
            // so list the values of the non-point or list both points.
            type_feature || hoveredObject.points.length <= 2 &&
            this._listPropsAndValues(hoveredObject)
          }
          {
            // react-vis cannot generate plot for single value
            crashes_data.length > 1 &&
            seriesPlot({ data: crashes_data, type: LineSeries })
          }
          {
            // react-vis cannot generate plot for single value
            severity_data.length > 1 &&
            seriesPlot({
              data: severity_data,
              type: VerticalBarSeries,
              plotStyle: { height: BAR_HEIGHT, width: WIDTH },
              noYAxis: true
            })
          }
        </div>
      </div >
    return (tooltip)
  }

  _listPropsAndValues(hoveredObject) {
    let DATA = []
    const props = hoveredObject.properties;
    if(props) {
      DATA = Object.keys(props)
      .map(p => {
        return([humanize(p), props[p]])
      })
    } else { // two points passed go through first one
      DATA = Object.keys(hoveredObject.points[0].properties)
      .map(p => {
        let points = [
          humanize(p), 
          hoveredObject.points[0].properties[p],
        ]
        if(hoveredObject.points[1]) {
          points.push(hoveredObject.points[1].properties[p])
        }
        return(points)
      })
    }
    return <Table style={{maxWidth: '320px'}} 
    columns={
      hoveredObject.points.length === 2 ? 
      ['Property', 'Value p1', 'Value p2'] : ['Property', 'Value'] 
    } data={DATA} />

  }
}