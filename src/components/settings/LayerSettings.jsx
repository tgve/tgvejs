import React from 'react';
import MultiSelect from '../MultiSelect';
import { getLayerProps } from './settingsUtils';
import {
  humanize
} from '../../utils';
import { Slider } from 'baseui/slider';
import { Checkbox } from "baseui/checkbox";
import { isArray } from '../../JSUtils';
import {Accordion, Panel} from 'baseui/accordion';


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
  }, [props.layerName])

  return (
    <Accordion>
      <Panel 
        title={"Settings: " + layerName}>
        {
          Object.keys(options).map(key => {
            const v = isArray(options[key]) ? options[key][0] : options[key];
            return getUIForKey(v, key);
          })
        }
      </Panel>
    </Accordion>
  )

  function getUIForKey(v, key) {
    switch (v) {
      case 'number':
        return <>
          {key}
          <Slider
            // raw number is kept in values 
            value={(values[key] && [values[key]]) || [options[key][3]]}
            min={options[key][1]}
            max={options[key][2]}
            step={options[key][4]}
            onChange={({ value }) => {
              const newValues = { ...values, [key]: value[0] };
              setValues(newValues)
              typeof onLayerOptionsCallback === 'function' &&
                onLayerOptionsCallback(newValues)
            }} />
        </>;
      case 'boolean':
        return <Checkbox
          checked={values.hasOwnProperty(key) ?
            values[key] : options[key][1]}
          onChange={() => {
            const newValues = { ...values, [key]: !values[key] }
            setValues(newValues)
            typeof onLayerOptionsCallback === 'function' &&
              onLayerOptionsCallback(newValues)
          }}
        >{humanize(key)}</Checkbox>;
      default:
        return <MultiSelect
          title={humanize(key)}
          single={true}
          values={columnNames.map(e => ({ id: humanize(e), value: e }))}
          onLayerOptionsCallback={(selected) => {
            //TODO
          }} />;
    }
  }
}