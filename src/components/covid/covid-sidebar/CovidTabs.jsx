import * as React from "react";
import { Tabs, Tab } from "baseui/tabs";
import { getPropertyValues } from "../../../geojsonutils.js"
import CovidStatus from "./CovidStatus";
import SocialDistancing from "./SocialDistancing";
import LeavingHome from "./LeavingHome";
import WorkCurrent from "./WorkCurrent";

export default (props) => {
    const [activeKey, setActiveKey] = React.useState("0");

    console.log(getPropertyValues({ features: props.data }));

    return (
        <Tabs
            onChange={({ activeKey }) => {
                setActiveKey(activeKey);
            }}
            activeKey={activeKey}
        >

            <Tab title="Covid Status">
              <CovidStatus onSelectCallback={props.onSelectCallback}/>
            </Tab>
            <Tab title="Social Distancing">
              <SocialDistancing onSelectCallback={props.onSelectCallback}/>
            </Tab>
            <Tab title="Leaving Home">
              <LeavingHome onSelectCallback={props.onSelectCallback}/>
            </Tab>
            <Tab title="Work Current">
              <WorkCurrent onSelectCallback={props.onSelectCallback}/>
            </Tab>
        </Tabs>
    );
}


