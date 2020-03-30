import * as React from "react";
import { Tabs, Tab } from "baseui/tabs";
import { getPropertyValues } from "../../../geojsonutils.js"
import { RadioGroup, Radio, ALIGN } from "baseui/radio";


export default (props) => {
    const [activeKey, setActiveKey] = React.useState("0");
    const [value, setValue] = React.useState("1");

    console.log(getPropertyValues({ features: props.data }));

    return (
        <Tabs
            onChange={({ activeKey }) => {
                setActiveKey(activeKey);
            }}
            activeKey={activeKey}
        >

            <Tab title="Covid Status">Covid Status
            <RadioGroup
                    value={value}
                    onChange={e => { setValue(e.target.value); typeof props.onSelectCallback === "function" && props.onSelectCallback(e.target.value) }}
                    name="number"
                // align={ALIGN.vertical}
                >
                    <Radio value="symptoms">Symptoms</Radio>
                    <Radio
                        value="2"
                        description="This is a radio description"
                    >
                        Two
                    </Radio>
                    <Radio value="3">Three</Radio>
                </RadioGroup>
            </Tab>
            <Tab title="Social Distancing">Social  Distancing</Tab>
            <Tab title="Leaving Home">Leaving Home</Tab>
            <Tab title="Work Current">Work Current</Tab>
        </Tabs>
    );
}


