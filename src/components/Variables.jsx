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
import React, { Component } from 'react';

import './style.css';
import { humanize } from '../utils';
import { isEmptyOrSpaces } from '../JSUtils';
import { describeFeatureVariables } from '../geojsonutils';
import { Select, TYPE } from 'baseui/select';
import MultiSelect from './MultiSelect';

export default class Variables extends Component {

  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    const { columns } = this.state;
    const { onSelectCallback, multiVarSelect,
      unfilteredData } = this.props;

    if (unfilteredData && Object.keys(unfilteredData[0].properties)
      .filter(p => !isEmptyOrSpaces(p)).length === 0) {
      return (
        <h3>There are no columns to inspect or filter.</h3>
      )
    }
    // describe first feature
    const description = describeFeatureVariables(unfilteredData[0]);

    return (
      <div style={this.props.style}>
        {/* Current solution goes back to when application was 
            developed without component libraries in mind (like baseweb).
            This revamp will be using baseweb.
            
            Minimalist approach: 
            using search + multi-select for both 
            column names and their chosen values.  */
        }
          Column to filter:
        <Select
          labelKey="id"
          valueKey="value"
          placeholder={"Chose column"}
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
            this.setState({
              columns: value
            })
          }}
          value={columns}
          options={Object.keys(unfilteredData[0].properties)
            .filter(e => e !== "date") // hardcode
            .map(e => ({
              // Format: Column Name [String]
              id: humanize(e) + " [" + description[e].name + "]",
              value: e
            }))
          }
        />
        {
          columns && columns.map(e => e.value)
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
                  values={columnValues.map(e => ({ id: e + "", value: e + ""}))}
                  onSelectCallback={(filter) => {
                    typeof (onSelectCallback) === 'function' &&
                      onSelectCallback(filter.selected || {});
                  }}
                />
              </>
            })
        }
      </div>
    )
  }
}
