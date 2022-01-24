import React from 'react';
import { Input, SIZE } from "baseui/input";

import GenerateUI from '../UI';
import { DateTime } from "luxon";
import { getPropertyValues } from '../../utils/geojsonutils';
import { getFirstDateColumnName } from '../../utils/utils';

import { Slider } from 'baseui/slider';

import { isArray } from '../../utils/JSUtils';
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

//https://codesandbox.io/s/329jy81rlm?file=/src/index.js:204-291
function useInterval(callback, delay) {
  const savedCallback = React.useRef();
  // Remember the latest function.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function CustomSlider(props) {
  const s = '50', max = 5000, min = 100;

  const [value, setValue] = React.useState([0]);
  const [dates, setDates] = React.useState([]);
  const [delay, setDelay] = React.useState(null);
  const [amount, setAmount] = React.useState('1000');

  React.useEffect(() => {
    setDates(props.dates);
    setValue(props.dates && [0]);
  }, [props])


  useInterval(() => {
    // Your custom logic here
    setValue(prev => [(prev[0] + 1) % dates.length]);
    typeof callback === 'function' &&
      callback(dates[value[0]]);
  }, delay);

  const { callback, data } = props;
  if (!data || !data.length) return null;

  if (!dates) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{maxWidth: 110}}>
      <Input
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Delay Input"
        type="number"
        size={SIZE.mini}
        clearable
        clearOnEscape
        min={min}
        max={max}
        step={s}
      />
      </div>
      <i
        style={{ maxHeight: 40, maxWidth: 40 }}
        onClick={() => {
          if (!delay) {
            setDelay(amount)
          } else {
            setDelay(null) //stop
          }
        }} >
        {
          !delay ?
            <i style={{ fontSize: '2em' }} className="fa fa-play"></i>
            : <i style={{ fontSize: '2em' }} className="fa fa-pause"></i>
        }
      </i>
      <div style={{ flexGrow: 1 }}>
        <Slider
          value={value}
          min={0}
          max={props.dates.length - 1}
          step={1}
          onChange={params => {
            if (params.value) {
              setValue(params.value);
            } else {
              setValue([]);
            }
            if (delay) setDelay(null)
            typeof callback === 'function' &&
              callback(dates[params.value]);
          }}
          overrides={{
            ThumbValue: ({ $value }) => (
              <div
                style={{
                  position: 'absolute',
                  top: -20,
                  // width: 80,
                  // top: `-${theme.sizing.scale800}`,
                  // ...theme.typography.font200,
                  backgroundColor: 'transparent',
                }}
              >
                {dates[$value]}
              </div>
            ),
            TickBar: ({ $min, $max }) => (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  // paddingRight: theme.sizing.scale600,
                  // paddingLeft: theme.sizing.scale600,
                  // paddingBottom: theme.sizing.scale400,
                }}
              >
                {[dates[$min], dates[Math.floor($max / 2)], dates[$max]]
                  .map(e =>
                    <div className="slider-label" key={e}>{e}</div>
                  )}
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}

export {
  yearSlider,
  CustomSlider
}