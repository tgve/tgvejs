import React from "react";
import { Accordion, Panel } from "baseui/accordion";
import { getPropertyValues } from "../../../geojsonutils.js"
import CovidStatus from "./CovidStatus";
import SocialDistancing from "./SocialDistancing";
import LeavingHome from "./LeavingHome";
import WorkCurrent from "./WorkCurrent";

export default (props) => {

    console.log(getPropertyValues({ features: props.data }));

    return (
      <Accordion
        onChange={({ expanded }) => console.log(expanded)}
      >
        <Panel title="Covid Status" style={{ padding : 5}}>
          <CovidStatus onSelectCallback={props.onSelectCallback}/>
        </Panel>
        <Panel title="Social Distancing">
          <SocialDistancing onSelectCallback={props.onSelectCallback}/>
        </Panel>
        <Panel title="Leaving Home">
          <LeavingHome onSelectCallback={props.onSelectCallback}/>
        </Panel>
        <Panel title="Work Current">
          <WorkCurrent onSelectCallback={props.onSelectCallback}/>
        </Panel>
      </Accordion>
    );
}


