import React from "react";
import { Accordion, Panel } from "baseui/accordion";
import { getPropertyValues } from "../../../geojsonutils.js"
import CovidStatus from "./CovidStatus";
import SocialDistancing from "./SocialDistancing";
import LeavingHome from "./LeavingHome";
import WorkCurrent from "./WorkCurrent";

import covidConstants from "../../../covid-constants";

export default (props) => {

    const data = getPropertyValues({ features: props.data });

    return (
      <Accordion
        initialState={{expanded : ["0"]}}
        onChange={({ expanded }) => console.log(expanded)}
      >
        {/* Note `data` is passed in so we can listen for the data to be loaded in useEffect */}
        <Panel title={covidConstants.covid_status.sidebarHeading} style={{ padding : 5}}>
          <CovidStatus onSelectCallback={props.onSelectCallback} data={data}/>
        </Panel>
        <Panel title={covidConstants.amount_of_contact.sidebarHeading}>
          <SocialDistancing onSelectCallback={props.onSelectCallback}/>
        </Panel>
        <Panel title={covidConstants.leaving_home.sidebarHeading}>
          <LeavingHome onSelectCallback={props.onSelectCallback}/>
        </Panel>
        <Panel title={covidConstants.work_current.sidebarHeading}>
          <WorkCurrent onSelectCallback={props.onSelectCallback}/>
        </Panel>
      </Accordion>
    );
}


