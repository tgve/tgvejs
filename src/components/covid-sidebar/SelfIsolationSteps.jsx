import React, { useEffect } from "react";
import { RadioGroup, Radio } from "baseui/radio";
import covidConstants from "../../covid-constants";

const FILTER_PRIMARY = "self_isolation_steps";

export default (props) => {
  useEffect(() => {
    props.setFilters(FILTER_PRIMARY, covidConstants.self_isolation_steps.responses[0].id);
  }, []);

  return (
    <RadioGroup
      value={props.filterSecondary}
      onChange={e => { 
        props.setFilters(FILTER_PRIMARY, e.target.value)
      }}
      name="number"
    >
      {
        covidConstants.self_isolation_steps.responses.map( x => (
          <Radio key={x.id} value={x.id}>{x.label}</Radio>
        ))
      }
    </RadioGroup>
  );
}