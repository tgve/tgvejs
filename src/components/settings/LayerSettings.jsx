import React from 'react';
import MultiSelect from '../MultiSelect';
import { getLayerProps } from './settingsUtils';
import {
  humanize
} from '../../utils/utils';
import {
  isStringNumeric
} from '../../utils/JSUtils';

import { Slider } from 'baseui/slider';
import { Checkbox } from "baseui/checkbox";
import { isString } from '../../utils/JSUtils';
import { Accordion, Panel } from 'baseui/accordion';


/**
 * One idea is to do the same done in Variables. When a set of
 * properties need to be assigned different types of primitive
 * values, one drop down could lead to each property shown
 * along with suitable UI to assign value to.
 *
 * Current version shows all properties with their suitable UI
 * (using baseui) so that each value can be set.
 *
 * @param {*} props
 * @returns
 */
export default function LayerSettings(props) {
  const { layerName, columnNames, onLayerOptionsCallback } = props;
  const [options, setOptions] = React.useState(getLayerProps(layerName));
  const [values, setValues] = React.useState({});

  React.useEffect(() => {
    if (!props.layerName) return
    const lp = getLayerProps(props.layerName);
    if (!lp) return
    setOptions(lp)
    setValues({}) //reset
  }, [props.layerName])

  if(!options || !Object.keys(options)) return null

  return (
    <Accordion>
      <Panel
        title={"Settings: " + layerName}>
          {/* The div below is a solution as currently,
          overriding panel seems to be not working
          using Block in baseweb will be the same.
          At least when sidebar needs to resize, we
          could change the 220 below.
          See DeckSidebar.css for the calcs  */}
          <div style={{minWidth:220}}>
          {
            Object.keys(options).map(key => {
              const v = options[key].type;
              return isString(v) && getUIForKey(v, key);
            })
          }
          </div>
      </Panel>
    </Accordion>
  )

  function getUIForKey(v, key) {
    if (key === 'class') return null
    switch (v) {
      case 'number':
        return <React.Fragment key={key}>
          {key}
          <Slider
            // raw number is kept in values
            value={(values[key] && [values[key]]) || [options[key].default]}
            min={options[key].min}
            max={options[key].max}
            step={options[key].step}
            onChange={({ value }) => {
              const newValues = { ...values, [key]: value[0] };
              setValues(newValues)
              typeof onLayerOptionsCallback === 'function' &&
                onLayerOptionsCallback(newValues)
            }} />
        </React.Fragment>;
      case 'boolean':
        return <Checkbox
          key={key}
          checked={values.hasOwnProperty(key) ?
            values[key] : options[key].value}
          onChange={() => {
            const newValues = { ...values, [key]: !values[key] }
            setValues(newValues)
            typeof onLayerOptionsCallback === 'function' &&
              onLayerOptionsCallback(newValues)
          }}
        >{humanize(key)}</Checkbox>;
      default:
        return <React.Fragment key={key}>
          {key}
          <MultiSelect
            title={humanize(key)}
            single={true}
            values={columnNames && columnNames
              .map(e => ({ id: humanize(e), value: e }))}
            onSelectCallback={(selected) => {
              const newValues = {
                ...values,
              }
              const f = (d) => {
                const numeric = options[key].value === 'number'
                let r = d && d.properties
                  && d.properties[selected[0].value]
                if(isStringNumeric(r) && numeric) r = +r
                return r
              }
              //is it resetting a key?
              newValues[key] = options[key].default
              if(selected.length) {
                newValues[key] = f
              }
              setValues(newValues)
              typeof onLayerOptionsCallback === 'function' &&
                onLayerOptionsCallback(newValues)

            }} />
        </React.Fragment>;
    }
  }
}
