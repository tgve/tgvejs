import React, { useState } from 'react';
import { Select, TYPE } from 'baseui/select';

export default (props) => {
  const [value, setValue] = useState([]);
  const { onSelectCallback, values, filter, multiVarSelect,
    title, single } = props;  
  return (
    <Select
      options={values}
      labelKey="id"
      valueKey="value"
      placeholder={title || "Choose"}
      maxDropdownHeight="300px"
      type={TYPE.search}
      multi={!single}
      onChange={({ value }) => {
        setValue(value);
        if (multiVarSelect) {
          Object.keys(value).length === 0 ? delete multiVarSelect[filter] :
            // everytime it gives back the chosen list of objects
            multiVarSelect[filter] = new Set(value.map(e => e.value));
          typeof onSelectCallback === 'function' &&
            onSelectCallback(Object.keys(multiVarSelect).length === 0 ?
              { what: '' } : { what: 'multi', selected: multiVarSelect });
        } else {
          typeof onSelectCallback === 'function' &&
          onSelectCallback(value)
        }
      }}
      value={props.value || value}
    />
  );
};