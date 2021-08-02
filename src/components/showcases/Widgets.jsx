import React, { useState } from 'react';
import { Slider } from 'baseui/slider';

import GenerateUI from '../UI';
import { DateTime } from "luxon";
import { getPropertyValues } from '../../geojsonutils';
import { getFirstDateColumnName } from '../../utils';
import { isArray } from '../../JSUtils';

const DateSlider = (props) => {
  const {data, multiVarSelect, onSelectCallback,
    callback} = props;
  const [value, setValue] = useState()

  if(!data || data.length === 0) return null;
  const s = Array.from(Array(data.length).keys()).slice(1,data.length-1)

  return (
    <>
    <Slider
      value={value || [s[0]]}
      min={parseInt(s[0])}
      max={parseInt(s[s.length - 1])}
      step={1}
      onChange={({ value }) => {
        setValue(value);
        // keep it the same in delete
        multiVarSelect['date'] = new Set([data[value-1] + ""]);
        typeof (callback) === 'function' &&
        callback({
          date: data[value-1] + "",
          multiVarSelect
        });
        typeof (onSelectCallback) === 'function' &&
          onSelectCallback({ selected: multiVarSelect, what: 'multi' });
      }}
    />
    {<h5>Dates(s): {value ? data[value-1] : data[0] + "-" + data[data.length - 1]}.
        {value &&
            <i style={{ fontSize: '2rem' }} className="fa fa-trash"
              onClick={() => {
                // remove
                setValue(null);
                delete multiVarSelect.date
                typeof (onSelectCallback) === 'function' &&
                  onSelectCallback(Object.keys(multiVarSelect).length === 0 ?
                    { what: '' } : { what: 'multi', selected: multiVarSelect });
                typeof (callback) === 'function' &&
                  callback({
                  date: "",
                  multiVarSelect
                });
              }} />}
        </h5>}
  </>)
}

/**
 * Function currently only accepts ISO standard date/datetime.
 * This function generates a "Year" slider with option to set
 * year value given int he `option` object.
 * 
 * @param {*} options in the form of { data, year, multiVarSelect, onSelectCallback,
    callback }
 */
const yearSlider = (options) => {
  const { data, year, multiVarSelect, onSelectCallback,
    callback } = options;

  if (!data || !data.length || !Object.keys(data[0].properties)) return null
  const yearColumn = getFirstDateColumnName(data[0].properties)
  // TODO: check every value before proceeding
  if(!DateTime.fromISO(data[0].properties[yearColumn]).isValid) return null

  const years = getPropertyValues({ features: data }, yearColumn)
    // returned 2009-01-02, convert to 2009
    .map(e => DateTime.fromISO(e).year).sort()
  
  if(!years || !isArray(years) || !years.length || years.length == 1) return null

  return <GenerateUI
    title={
      <h5>Year(s): {year ? year :
        (years[0] + " - " + years[years.length - 1])}
        {year &&
          <i style={{ fontSize: '2rem' }} className="fa fa-trash"
            onClick={() => {
              delete multiVarSelect[yearColumn];
              typeof (onSelectCallback) === 'function' &&
                onSelectCallback(Object.keys(multiVarSelect).length === 0 ?
                  { what: '' } : { what: 'multi', selected: multiVarSelect });
              callback({
                year: "",
                multiVarSelect
              });
            }} />}
      </h5>}
    sublist={[...new Set(years)]}
    suggested="slider"
    onChange={(value) => {
      // the kye is one of `date` or `YEAR`
      // keep it the same in delete
      multiVarSelect[yearColumn] = new Set([value + ""]);
      callback({
        year: value + "",
        multiVarSelect
      });
      typeof (onSelectCallback) === 'function' &&
        onSelectCallback({ selected: multiVarSelect, what: 'multi' });
    }} />;
}

export {
  yearSlider,
  DateSlider,
}