import React, { useState, useEffect } from "react";
import { RadioGroup, Radio } from "baseui/radio";
import covidConstants from "../../../covid-constants";


export default (props) => {
  const [value, setValue] = useState("symptoms");
  const {data} = props;

  // Listen for the data to be loaded, before applying the filter
  useEffect(() => {
    typeof props.onSelectCallback && props.onSelectCallback("covid_status", value);
  }, [data]);

  return (
    <RadioGroup
      value={value}
      onChange={e => { setValue(e.target.value); typeof props.onSelectCallback === "function" && props.onSelectCallback("covid_status", e.target.value) }}
      name="number"
    >
      { 
        covidConstants.covid_status.responses.map( x => (
          <Radio value={x.id}>{x.label}</Radio>
        ))
      }
    </RadioGroup>
  );
}