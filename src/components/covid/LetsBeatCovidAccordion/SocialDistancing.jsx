import React, { useState, useEffect } from "react";
import { RadioGroup, Radio } from "baseui/radio";
import covidConstants from "../../../covid-constants";

export default (props) => {
  const [value, setValue] = useState("no_large_groups");

  const {data} = props;
  
  useEffect(() => {
    typeof props.onSelectCallback && props.onSelectCallback("amount_of_contact", value);
  }, [data]);

  return (
    <RadioGroup
      value={value}
      onChange={e => { setValue(e.target.value); typeof props.onSelectCallback === "function" && props.onSelectCallback("amount_of_contact", e.target.value) }}
      name="number"
    >
      {
        covidConstants.amount_of_contact.responses.map( x => (
          <Radio value={x.id}>{x.label}</Radio>
        ))
      }
    </RadioGroup>
  );
}