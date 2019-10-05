import * as React from 'react';
import { Select, TYPE } from 'baseui/select';

export default (props) => {
  const [value, setValue] = React.useState([]);
  const { selectedCallback, values } = props;
  if (!values || !values.length) return null
  return (
    <Select
      options={values}
      labelKey="id"
      valueKey="color"
      placeholder="Choose a color"
      maxDropdownHeight="300px"
      type={TYPE.search}
      multi
      onChange={({ value }) => {
        setValue(value);
        typeof selectedCallback === 'function' && selectedCallback(value);
      }}
      value={value}
    />
  );
};