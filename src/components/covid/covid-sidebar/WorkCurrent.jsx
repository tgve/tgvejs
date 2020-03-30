import React, { useState } from "react";
import { RadioGroup, Radio } from "baseui/radio";


export default (props) => {
  const [value, setValue] = useState("symptoms");
  return (
    <RadioGroup
      value={value}
      onChange={e => { setValue(e.target.value); typeof props.onSelectCallback === "function" && props.onSelectCallback("current_work", e.target.value) }}
      name="number"
    >
      <Radio value="car">Commute by car</Radio>
      <Radio value="wfh">Working or Studying from home</Radio>
      <Radio value="bike_or_walk">Commute by bike or walking</Radio>
      <Radio value="retired">Retired or not working</Radio>
      <Radio value="public_transport">Commute by Bus, Train or Tube</Radio>
    </RadioGroup>
  );
}