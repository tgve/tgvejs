import React, { useEffect } from "react";
import { RadioGroup, Radio } from "baseui/radio";
import covidConstants from "../../covid-constants";

const FILTER_PRIMARY = "covid_status";

export default (props) => {
  useEffect(() => {
    props.setFilters(FILTER_PRIMARY, covidConstants.covid_status.responses[0].id);
  }, []);

  return (
    <RadioGroup
      value={props.filterSecondary}
      onChange={e => props.setFilters(FILTER_PRIMARY, e.target.value) }
      name="number"
    >
      { 
        covidConstants.covid_status.responses.map( x => (
          <Radio key={x.id} value={x.id}>{x.label}</Radio>
        ))
      }
    </RadioGroup>
  );
}