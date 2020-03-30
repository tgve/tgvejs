import React, { useState } from "react";
import { RadioGroup, Radio } from "baseui/radio";


export default (props) => {
  const [value, setValue] = useState("symptoms");
  return (
    <RadioGroup
      value={value}
      onChange={e => { setValue(e.target.value); typeof props.onSelectCallback === "function" && props.onSelectCallback("current_work", e.target.value) }}
      name="number"
    // align={ALIGN.vertical}
    >
      <Radio value="car">Symptoms</Radio>
      <Radio value="wfh">Symptoms</Radio>
      <Radio value="bike_or_walk">Symptoms</Radio>
      <Radio value="retired">Symptoms</Radio>
      <Radio value="public_transport">Symptoms</Radio>
      <Radio value="train">Symptoms</Radio>

    </RadioGroup>
  );
}