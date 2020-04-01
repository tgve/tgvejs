import React, { useState, useEffect } from "react";
import { RadioGroup, Radio } from "baseui/radio";
import covidConstants from "../../../covid-constants";

export default (props) => {
  const [value, setValue] = useState("car");

  const {data} = props;
  
  useEffect(() => {
    typeof props.onSelectCallback && props.onSelectCallback("current_work", value);
  }, [data]);

  return (
    <RadioGroup
      value={value}
      onChange={e => { setValue(e.target.value); typeof props.onSelectCallback === "function" && props.onSelectCallback("current_work", e.target.value) }}
      name="number"
    >
      {
        covidConstants.work_current.responses.map( x => (
          <Radio value={x.id}>{x.label}</Radio>
        ))
      }
    </RadioGroup>
  );
}