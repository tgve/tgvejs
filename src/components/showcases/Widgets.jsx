import React, { useState } from 'react';
import { Slider } from 'baseui/slider';

import GenerateUI from '../UI';
import { DateTime } from "luxon";
import { getPropertyValues } from '../../geojsonutils';
import { getFirstDateColumnName, xyObjectByProperty } from '../../utils';
import { isString } from '../../JSUtils';
import GenericPlotly from './GenericPlotly';


const timeSlider = (props = {}) => {
  const { data, property, dark, title  } = props;
  // feature array
  if (!isString(property) || !data || !data.length) return null;
  const dateColumn = getFirstDateColumnName(data[0].properties);
  if(!dateColumn) return null;
  const x = getPropertyValues({features: data}, dateColumn).map(e => new Date(e));
  const y = getPropertyValues({features: data}, property);

  return (
    <GenericPlotly dark={dark}
      title={title || "Time v " + property}
      yaxis={{ showgrid: false }}
      xaxis={{ showgrid: false }}
      data={[{
        // showlegend: false,
        x, y,
        mode: 'graph',
        // marker: { color: TURQUOISE_RANGE[0] }
      }]} />
  )
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
  if (!DateTime.fromISO(data[0].properties[yearColumn]).isValid) return null

  const years = [... new Set(getPropertyValues({ features: data }, yearColumn)
    // returned 2009-01-02, convert to 2009
    .map(e => DateTime.fromISO(e).year).sort())];

  if (years.length < 2) return null

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
    sublist={years}
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
  timeSlider,
  yearSlider,
}