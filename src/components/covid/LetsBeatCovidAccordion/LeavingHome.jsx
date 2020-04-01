import React, { useState, useEffect } from "react";
import { RadioGroup, Radio } from "baseui/radio";
import covidConstants from "../../../covid-constants";

export default (props) => {
  const [value, setValue] = useState("not_leaving_house");
  const {data} = props;
  
  useEffect(() => {
    typeof props.onSelectCallback && props.onSelectCallback("self_isolation_steps", value);
  }, [data]);

  return (
    <RadioGroup
      value={value}
      onChange={e => { 
        setValue(e.target.value); 
        typeof props.onSelectCallback === "function" && 
          props.onSelectCallback("self_isolation_steps", e.target.value) 
      }}
      name="number"
    >
      {
        covidConstants.leaving_home.responses.map( x => (
          <Radio value={x.id}>{x.label}</Radio>
        ))
      }
    </RadioGroup>
  );
}