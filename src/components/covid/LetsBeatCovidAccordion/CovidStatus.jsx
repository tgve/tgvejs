import React, { useState, useEffect } from "react";
import { RadioGroup, Radio } from "baseui/radio";


export default (props) => {
  const [value, setValue] = useState("symptoms");
  const {data} = props;

  useEffect(() => {
    typeof props.onSelectCallback && props.onSelectCallback("covid_status", "symptoms");
  }, [data]);
  return (
    <RadioGroup
      value={value}
      onChange={e => { setValue(e.target.value); typeof props.onSelectCallback === "function" && props.onSelectCallback("covid_status", e.target.value) }}
      name="number"
    // align={ALIGN.vertical}
    >
      <Radio value="no_symptoms">I am well and have not been exposed to COVID-19</Radio>
      <Radio value="symptoms">I am unwell and think I have COVID-19</Radio>
      <Radio value="self_isolation_after_exposure">I feel well but isolating after COVID-19 exposure</Radio>
      <Radio value="test_positive">I am unwell and tested positive for COVID-19</Radio>
      <Radio value="symptoms_not_covid">I am unwell but don't think it's COVID-19</Radio>
      <Radio value="test_positive_recovered">I feel better now but tested positive for COVID-19</Radio>
      <Radio value="symptoms_recovered">I feel better now but think I had COVID-19</Radio>
    </RadioGroup>
  );
}