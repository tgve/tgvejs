import React, { useState, useEffect } from 'react';
import { Button, KIND, SIZE } from 'baseui/button';
import {VerticalBarSeries, HorizontalBarSeries, LineSeries} from 'react-vis';

import MultiSelect from './MultiSelect';
import TreeMap from './TreeMap';
import { humanize } from '../utils';
import { isString, isNumber } from '../JSUtils';
import { xyObjectByProperty } from '../utils';
import SeriesPlot from './Showcases/SeriesPlot';

const VIS = ['Vertical Bar', 'Horizontal Bar',
  'Line', 'Pop. Pyramid', 'Treemap'];

/**
 * Generate approprate series/marks for a React-vis
 * type from data and column name.
 * 
 * @param {Object} data 
 * @param {String} column 
 * @param {String} vis 
 */
function generateVIS(data, column, vis) {
  if (!data || data.length === 0 || !isString(column) || !isString(vis)) {
    return;
  }
  let counts = xyObjectByProperty(data, column)

  if (vis === 'Treemap') {
    return (
      <TreeMap
        data={{
          title: column + " " + vis,
          color: 1,
          children: counts.map((e, i) => ({
            name: e.x,
            size: +(e.y)/data.length,
            color: isNumber(e.x) || i,
            style: {
              border: 'thin solid red'
            }
          }))
        }}
      />
    )
  }
  if (vis.startsWith('Vertical') ||
      vis.startsWith("Horizontal") ||
      vis.startsWith("Line") ) {
    return (
      <SeriesPlot
        data={counts} 
        type={
          vis.startsWith("Vertical") ?
          VerticalBarSeries : 
          vis.startsWith("Horizontal") ?
          HorizontalBarSeries :
          LineSeries
        }
        title={humanize(column)} noYAxis={true}
      />
    )
  }
}
export default function AddVIS(props) {
  const [column, setColumn] = useState(false)
  const [vis, setVis] = useState(false)
  const [list, setList] = useState([]);
  // useEffect(() => {
  //   // if props.data changes only then it should react to it
  //   setList([]);
  //   setColumn([])
  // }, [props.data])

  const { data, onSelectCallback, value } = props;

  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0].properties);

  return (
    <div>
      <MultiSelect
        single={true}
        title="Choose column"
        values={columns.map(e => ({ id: humanize(e), value: e }))}
        onSelectCallback={(selected) => {
          setColumn(selected);
          typeof onSelectCallback === 'function' && 
          onSelectCallback(selected)
        }}
        // sync state
        value={column}
      />
      {column.length > 0 && <MultiSelect
        single={true}
        title="Choose vis"
        values={VIS.map(e => ({ id: e, value: e }))}
        onSelectCallback={(selected) => {
          setVis(selected)
        }}
        // sync state
        value={vis}
      />}
      <Button
        kind={KIND.secondary} size={SIZE.compact}
        onClick={() => {
          if(column.length === 0 || vis.length === 0) return;
          setList([
            ...list,
            generateVIS(data, column[0].value, vis[0].value)
          ])
          // console.log(column[0].value, vis[0].value);
        }}>Add</Button>
      {
        list.map((tm, i) =>
          <div style={{
            borderr: '1px solid black'
          }}>
            <Button
              kind={KIND.secondary} size={SIZE.compact}
              onClick={() => {
                setList(
                  list.filter((e, j) => i !== j)
                )
              }}>X</Button>
            {tm}
          </div>
        )
      }
    </div>
  )
}