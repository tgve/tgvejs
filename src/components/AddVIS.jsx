import React, { useState, useEffect } from 'react';
import { Button, KIND, SIZE } from 'baseui/button';
import { Accordion, Panel } from 'baseui/accordion';
import { VerticalBarSeries, HorizontalBarSeries, LineSeries } from 'react-vis';

import MultiSelect from './MultiSelect';
import TreeMap from './TreeMap';
import { humanize } from '../utils';
import { isString, isNumber } from '../JSUtils';
import { xyObjectFromKeyValue } from '../utils';
import SeriesPlot from './Showcases/SeriesPlot';

const VIS = ['Vertical Bar', 'Horizontal Bar',
  'Line', 'Pop. Pyramid', 'Treemap'];

/**
 * Generate approprate series/marks for a React-vis
 * type from data and column name.
 * 
 * @param {Object} data geojson features to generate counts from
 * @param {String} column name of column in feature to generate counts from
 * @param {String} vis type of visualization (react-vis type)
 * @param {Object} plotStyle styling of the plot (css)
 * @param {Boolean} noLimit boolean to crop chart
 */
function generateVIS(data, column, vis, plotStyle, noLimit, dark) {
  if (!data || data.length === 0 || !isString(column) || !isString(vis)) {
    return;
  }
  let counts = xyObjectFromKeyValue(data, column)
  console.log(xyObjectFromKeyValue(data, column));
  
  if (vis === 'Treemap') {
    return (
      <TreeMap
        plotStyle={plotStyle}
        data={{
          title: column + " " + vis,
          color: 1,
          children: counts.map((e, i) => ({
            name: e.x,
            size: +(e.y) / data.length,
            color: isNumber(e.x) || i,
            style: {
              border: 'thin solid red'
            }
          }))
        }}
        title={humanize(column)}
      />
    )
  }
  if (vis.startsWith('Vertical') ||
    vis.startsWith("Horizontal") ||
    vis.startsWith("Line")) {
    return (
      <SeriesPlot
        dark={dark}
        noLimit={noLimit}
        plotStyle={plotStyle}
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
  // if props.data changes only then it should react to it
  // setVis(false);
  // setColumn([])
  // }, [props.data])


  const { data, onSelectCallback, dark,
    noAccordion, plotStyle, noLimit } = props;

  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0].properties);

  return (
    <div>
      <h6>Generate graphs from columns</h6>
      <div className="searchField">
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
        {column.length > 0 &&
          <MultiSelect
            single={true}
            title="Choose vis"
            values={VIS.map(e => ({ id: e, value: e }))}
            onSelectCallback={(selected) => {
              setVis(selected)
            }}
            // sync state
            value={vis}
          />}
      </div>
      <Button
        kind={KIND.secondary} size={SIZE.compact}
        onClick={() => {
          if (column.length === 0 || vis.length === 0 || !column[0]) return;
          setList([
            ...list,
            generateVIS(data, column[0].value, vis[0].value, plotStyle, noLimit, dark)
          ])
          // console.log(column[0].value, vis[0].value);
        }}>Add</Button>
      <div className="visArea">
        {!noAccordion ?
          <Accordion
            expanded={true}
            onChange={({ expanded }) => console.log(expanded)}
          >
            {
              list.map((plot, i) =>
                <Panel key={'panel-' + i}>
                  <Button
                    kind={KIND.secondary} size={SIZE.compact}
                    onClick={() => {
                      setList(
                        list.filter((e, j) => i !== j)
                      )
                    }}>X</Button>
                  {plot}
                </Panel>
              )
            }
          </Accordion> :
          <center>
            {list.map((plot, i) =>
              plot && 
              <div>
                <Button
                  kind={KIND.secondary} size={SIZE.compact}
                  onClick={() => {
                    setList(
                      list.filter((e, j) => i !== j)
                    )
                  }}>X</Button>
                {plot}
              </div>)
            }
          </center>
        }
      </div>
    </div >
  )
}