/**
 * eAtlas code
 *  
 * React component which takes a GeoJSON object. Loops through its
 * properties and show the list to start with. Each property 
 * can show all avialable values. Each value can be selected/deselected.
 *
 * Current code can deal with only one GeoJSON property's keys.
 * 
 * Next is handling multiple GeoJSON key value pairs.
 * Next will be replacing current "hard" code in the parent code,
 * so that all key values can be dynamically filtered.
 * 
 * This should be generalizeable to any GeoJSON file, or that is the
 * aim.
 */
import React, { useState } from 'react';

import './style.css';
import { humanize } from '../utils';
import { isEmptyOrSpaces } from '../JSUtils';
import { describeFeatureVariables } from '../geojsonutils';
import { Select, TYPE } from 'baseui/select';
import MultiSelect from './MultiSelect';

export default function Variables(props) {
  const { onSelectCallback, multiVarSelect,
    unfilteredData } = props;
  const [columns, setColumns] = useState(Object.keys(multiVarSelect))

  if (!unfilteredData || !unfilteredData[0]) return null;

  if (unfilteredData && Object.keys(unfilteredData[0].properties)
    .filter(p => !isEmptyOrSpaces(p)).length === 0) {
    return (
      <h3>There are no columns to inspect or filter.</h3>
    )
  }
  // describe first feature
  const description = describeFeatureVariables(unfilteredData[0]);
  const dataCols = Object.keys(unfilteredData[0].properties)
    .filter(e => e !== "date") // hardcode
    .map(e => ({
      // Format: Column Name [String]
      id: humanize(e) + " [" + description[e].name + "]",
      value: e
    }))

  // unique set of keys
  let syncColumns = Array.from(new Set(columns.map(e => e.value).concat(
    Object.keys(multiVarSelect).filter(e => e !== "date") // hardcode
  )));
  // populate baseweb objects using description
  syncColumns = syncColumns.map(e => ({
    // Format: Column Name [String]
    id: humanize(e) + " [" + description[e].name + "]",
    value: e
  }))
  // console.log(columns);
  // console.log(syncColumns);
  // use synced column names
  return (
    <div style={props.style}>
      Column to filter:
      <Select
        labelKey="id"
        valueKey="value"
        placeholder={"Chose column " + "(" + dataCols.length + ")"}
        maxDropdownHeight="300px"
        type={TYPE.search}
        multi={true}
        onChange={({ value }) => {
          // sync with multiVarSelect 
          // here we remove any key in multiVarSelect that is not 
          // in the values here
          const columnsArray = value.map(e => e.value)
          Object.keys(multiVarSelect).map(key => {
            //delete any that is not in value
            if (!columnsArray.includes(key)) {
              delete multiVarSelect[key]
            }
          })
          typeof (onSelectCallback) === 'function' &&
            onSelectCallback(multiVarSelect)
          setColumns(value)
        }}
        value={syncColumns}
        options={dataCols}
      />
      {
        syncColumns && syncColumns.map(e => e.value)
          .map(key => {
            const columnValues = [];
            unfilteredData.forEach(feature =>
              Object.keys(feature.properties).forEach(property =>
                property === key && feature.properties[key] &&
                !columnValues.includes(feature.properties[key]) &&
                columnValues.push(
                  feature.properties[key]
                )
              )
            )
            return <>
              {humanize(key)}
              <MultiSelect
                title={"Available (" + columnValues.length + ")"}
                filter={key}
                multiVarSelect={multiVarSelect}
                // all string from here
                values={columnValues.map(e => ({ id: e + "", value: e + "" }))}
                onSelectCallback={(filter) => {
                  typeof (onSelectCallback) === 'function' &&
                    onSelectCallback(filter.selected || {});
                }}
                value={multiVarSelect[key] &&
                  Array.from(multiVarSelect[key])
                    .map(e => ({ id: e + "", value: e + "" }))
                }
              />
            </>
          })
      }
    </div>
  )
}