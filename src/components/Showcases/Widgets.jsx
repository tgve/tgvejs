import React from 'react';

import GenerateUI from '../UI';
import { DateTime } from "luxon";
import RBDropDown from '../RBDropdownComponent';
import { humanize } from '../../utils';

const timeSlider = (data, year, multiVarSelect, onSelectCallback, callback) => {
  return data && data.length > 1 &&
    (data[0].properties.date || data[0].properties['YEAR']) &&
    (DateTime.fromFormat(data[0].properties.date + '', 'dd/MM/yyyy').isValid ||
      DateTime.fromFormat(data[0].properties['YEAR'] + '', 'yyyy').isValid) &&
    <GenerateUI title={<h5>Year(s): {year ? year : "2009 - 2017"}.
        {year &&
        <i style={{ fontSize: '2rem' }} className="fa fa-trash" onClick={() => {
          delete multiVarSelect.date;
          typeof (onSelectCallback) === 'function' &&
            onSelectCallback(Object.keys(multiVarSelect).length === 0 ?
              { what: '' } : { what: 'multi', selected: multiVarSelect });
          callback({
            year: "",
            multiVarSelect
          });
        }} />}
    </h5>} sublist={data[0].properties.date ?
      Array.apply(null, { length: 9 }).map(Number.call, Number).map(d => d + 2009) :
      Array.apply(null, { length: 31 }).map(Number.call, Number).map(d => d + 2020)} 
      suggested="slider" 
      onChange={(value) => {
        multiVarSelect[data[0].properties.date ?
          'date' : 'YEAR'] = new Set([value + ""]);
        callback({
          year: value,
          multiVarSelect
        });
        typeof (onSelectCallback) === 'function' &&
          onSelectCallback({ selected: multiVarSelect, what: 'multi' });
      }} />;
}

const drawDropdown = (options) => {
  const { multiVarSelect, curr_list, full_list,
    onSelectCallback, callback, filter } = options;

  return (
    // TODO: filter full_list accoridng to the data 
    <RBDropDown
      title={multiVarSelect && multiVarSelect[filter] ?
        multiVarSelect[filter] : humanize(filter) + " All"}
      menuitems={curr_list ? ["All", ...curr_list]
        : full_list}
      onSelectCallback={(selected) => {
        selected === "All" ? delete multiVarSelect[filter] :
          multiVarSelect[filter] = new Set([selected]);
        typeof callback === 'function' &&
          callback({ multiVarSelect });
        onSelectCallback &&
          onSelectCallback(Object.keys(multiVarSelect).length === 0 ?
            { what: '' } : { what: 'multi', selected: multiVarSelect });
      }} />
  )
}

export {
  timeSlider,
  drawDropdown
}