import React from 'react';
import { Table } from 'baseui/table';
import { humanize } from '../utils';
import { getPropertyValues, propertyCountByProperty } from '../geojsonutils';
import Plot from './showcases/GenericPlotly';
import { scaleSequential } from 'd3-scale';
import { TURQUOISE_RANGE } from '../Constants';

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

  _handleWindowSizeChange () {
    this.forceUpdate()
  };

  /**
   * hoverdObject can be of two types so far:
   * 1. collections of points with `.points` property
   * 2. properties of `.type === 'Feature'`.
   */
  render() {
    const { topx, topy, hoveredObject,
      column1 = "accident_severity", column2 = "date" } = this.props;
    const { isMobile } = this.state;
    // console.log(topx, topy);
    // console.log(hoveredObject)

    if (!hoveredObject) return null;

    const type_feature = hoveredObject.type &&
      hoveredObject.type === 'Feature';
    const cluster = hoveredObject && hoveredObject.cluster
    // {cluster: true, cluster_id: 8, point_count: 54, 
    // point_count_abbreviated: 54}

    let severity_data_separate = [];
    if (!type_feature && !cluster) {
      // separate the severity into [[],[]] arrays
      const severity_keys = column1 && getPropertyValues(
        { features: hoveredObject.points }, column1);
      const severity_by_year = column1 && column2 &&
        propertyCountByProperty(hoveredObject.points, column1, column2);
      //{2009: {Slight: 1}, 2010: {Slight: 3}, 2012: {Slight: 4}, 
      // 2013: {Slight: 3}, 2014: {Serious: 1}, 2015: {Slight: 6}, 
      // 2016: {Serious: 1, Slight: 2}, 2017: {Slight: 1}}
      // now turn it into [{},{}]
      severity_keys && severity_keys.forEach((name, i) => {
        Object.keys(severity_by_year).forEach(y => {
          if (y && severity_by_year[y][name]) {
            if (!severity_data_separate[i]) {
              severity_data_separate[i] = {
                x: [], y: [], name: name,
                marker: { color: scaleSequential(TURQUOISE_RANGE)(i / severity_keys.length) }
              };
            }
            // 2016: {Serious: 1, Slight: 2}
            severity_data_separate[i].x.push(y);
            severity_data_separate[i].y.push(severity_by_year[y][name]);
          }
        })
      })
      severity_data_separate.map(e => {
        if (e.x.length > 1) {
          e.mode = 'lines'
        }
      })
    }
    // console.log(crashes_data);

    const w = window.innerWidth;
    const y = window.innerHeight;
    const n_topy = isMobile ? 10 :
      topy + (WIDTH + BAR_HEIGHT) > y ? topy - WIDTH : topy;
    const n_left = isMobile ? 10 :
      topx + WIDTH > w ? topx - WIDTH : topx;
    const tooltip =
      <div
        className="xyz" style={{
          top: topy + (WIDTH + BAR_HEIGHT) > y ? n_topy : topy,
          left: topx + WIDTH > w ? n_left : topx
        }}>
        <div>
          <b>Total: {cluster ? hoveredObject.point_count :
            type_feature ? 1 : hoveredObject.points.length}</b>
        </div>
        <div>
          {
            // Simple logic, if points and less two points or less,
            // or not poingts, hard to expect React-vis generating plot.
            // so list the values of the non-point or list both points.
            !cluster && (type_feature || hoveredObject.points.length <= 2) ?
            this._listPropsAndValues(hoveredObject) :
            <Plot
              title={`${humanize(column1)} by ${humanize(column2)}`}
              width={WIDTH}
              data={severity_data_separate}
              dark={true}
              xaxis={{ tickformat: 'd', showgrid: false }}
              yaxis={{ showgrid: false }} />
          }
        </div>
      </div >
    return (tooltip)
  }

  _listPropsAndValues(hoveredObject, all = false, n = 6) {
    let DATA = []
    const props = hoveredObject.properties;
    if (props) {
      const keys = Object.keys(props)
      DATA = keys
        .slice(1, all ? keys.length : n)
        .map(p => {
          return ([humanize(p), props[p]])
        })
    } else { // two points passed go through first one
      const keys = Object.keys(hoveredObject.points[0].properties);
      DATA = keys
        .slice(1, all ? keys.length : n) // miss accident_index
        .map(p => {
          let points = [
            humanize(p),
            hoveredObject.points[0].properties[p],
          ]
          if (hoveredObject.points[1]) {
            points.push(hoveredObject.points[1].properties[p])
          }
          return (points)
        })
    }
    return <Table style={{ maxWidth: '320px' }}
      columns={
        hoveredObject.points &&
          hoveredObject.points.length === 2 ?
          ['Property', 'Value p1', 'Value p2'] : ['Property', 'Value']
      } data={DATA} />

  }
}