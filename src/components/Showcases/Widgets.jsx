import React, { useState } from 'react';
import { Slider } from 'baseui/slider';

import GenerateUI from '../UI';
import { DateTime } from "luxon";

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
        console.log(data[value-1], data);
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

const yearSlider = (options) => {
  const {data, year, multiVarSelect, onSelectCallback,
    callback} = options;  
  return data && data.length > 1 &&
    (data[0].properties.date || data[0].properties['YEAR']) &&
    (DateTime.fromFormat(data[0].properties.date + '', 'dd/MM/yyyy').isValid ||
      DateTime.fromFormat(data[0].properties['YEAR'] + '', 'yyyy').isValid) &&
    <GenerateUI
      title={
        // TODO: change min max labels dynamically
        // so should all the values generated
        <h5>Year(s): {year ? year : "2009 - 2017"}.
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
      sublist={data[0].properties.date ?
        Array.apply(null, { length: 9 }).map(Number.call, Number).map(d => d + 2009) :
        Array.apply(null, { length: 31 }).map(Number.call, Number).map(d => d + 2020)}
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