import React from 'react';
import { scaleSequential } from 'd3-scale';
import { Table } from 'baseui/table';

import { getPropertyValues, propertyCountByProperty } from '../../utils/geojsonutils';
import { TURQUOISE_RANGE } from '../../Constants';
import { isObject } from '../../utils/JSUtils';
import Plot from '../showcases/GenericPlotly';


const generateTooltip =(props) => {
  const WIDTH = 220;
  const BAR_HEIGHT = 80;
  const { topx, topy, selectedObject,
    column1 = "accident_severity", column2 = "date" } = props;
  const isMobile = isObject(props) && props.isMobile;
  //const isMobile = false;
  if (!selectedObject) return null;

  const type_feature = selectedObject.type &&
    selectedObject.type === 'Feature';
  const cluster = selectedObject && selectedObject.cluster
  // {cluster: true, cluster_id: 8, point_count: 54,
  // point_count_abbreviated: 54}

  let severity_data_separate = [];
  if (!type_feature && !cluster) {
    // separate the severity into [[],[]] arrays
    const severity_keys = column1 && getPropertyValues(
      { features: selectedObject.points.map(e => e.source) },
      column1);
    const severity_by_year = column1 && column2 &&
      propertyCountByProperty(
        selectedObject.points.map(e => e.source),
        column1, column2);
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
        <b>Total: {cluster ? selectedObject.point_count :
          type_feature ? 1 : selectedObject.points.length}</b>
      </div>
      <div>
        {
          // Simple logic, if points and less two points or less,
          // or not poingts, hard to expect React-vis generating plot.
          // so list the values of the non-point or list both points.
          !cluster && (type_feature || selectedObject.points.length <= 2) ?
          listPropsAndValues(selectedObject) :
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
    return tooltip;
}


  /**
   * selectedObject (either hoveredObject from Tooltip, or clickedObject
   * from Popup) can be of two types so far:
   * 1. collections of points with `.points` property
   * 2. properties of `.type === 'Feature'`.
   */
   const listPropsAndValues = (selectedObject, all = false, n = 6) => {
    if(!selectedObject.properties ||
      (selectedObject.points && (!selectedObject.points ||
       !selectedObject.points[0].properties))) return null

    let DATA = []
    const props = selectedObject.properties;
    if (props) {
      const keys = Object.keys(props)
      DATA = keys
        .slice(0, all ? keys.length : n)
        .map(p => {
          return ([humanize(p), props[p]])
        })
    } else { // two points passed go through first one
      const keys = Object.keys(selectedObject.points[0].properties);
      DATA = keys
        .slice(0, all ? keys.length : n) // miss accident_index
        .map(p => {
          let points = [
            humanize(p),
            selectedObject.points[0].properties[p],
          ]
          if (selectedObject.points[1]) {
            points.push(selectedObject.points[1].properties[p])
          }
          return (points)
        })
    }
    return <Table style={{ maxWidth: '320px' }}
      columns={
        selectedObject.points &&
          selectedObject.points.length === 2 ?
          ['Property', 'Value p1', 'Value p2'] : ['Property', 'Value']
      } data={DATA} />
  }


export default generateTooltip;
