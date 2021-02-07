import React, { useState } from 'react';
import { Slider } from 'baseui/slider';

import GenerateUI from '../UI';
import { DateTime } from "luxon";
import { getPropertyValues } from '../../geojsonutils';

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
 * Currently this function works with one/two format three-piece-date
 * like yyyy-mm-dd to generate a slider returing the year as the value.
 * 
 * TODO: needs better (can be strict) form of 
 * handling date. Explicitly state year/number (could be months)
 * 
 * @param {*} options 
 */
const yearSlider = (options) => {
  const { data, year, multiVarSelect, onSelectCallback,
    callback } = options;

  if (!(data && data.length > 1 &&
    (data[0].properties.date || data[0].properties['YEAR']) &&
    (DateTime.fromFormat(data[0].properties.date + '', 'yyyy-mm-dd').isValid ||
      DateTime.fromFormat(data[0].properties['YEAR'] + '', 'yyyy').isValid))) {
    return null
  }
  const years = getPropertyValues({ features: data }, "date")
    // returned 2009-01-02, convert to 2009
    .map(e => +(e.split("-")[0])).sort()
  return <GenerateUI
    title={
      <h5>Year(s): {year ? year :
        (years[0] + " - " + years[years.length - 1])}
        {year &&
          <i style={{ fontSize: '2rem' }} className="fa fa-trash"
            onClick={() => {
              multiVarSelect.date ?
                delete multiVarSelect.date : delete multiVarSelect.YEAR;
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
      multiVarSelect[data[0].properties.date ?
        'date' : 'YEAR'] = new Set([value + ""]);
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