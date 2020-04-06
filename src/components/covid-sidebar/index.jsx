import React, {useEffect, useState} from "react";
import styled from "styled-components";
import { Accordion, Panel } from "baseui/accordion";
import CovidStatus from "./CovidStatus";
import SocialDistancing from "./SocialDistancing";
import SelfIsolationSteps from "./SelfIsolationSteps";
import WorkCurrent from "./WorkCurrent";
import logoUrl from "../../img/logo.png";
import covidConstants from "../../covid-constants";

const Wrapper = styled.div`
  position : fixed;
  background : white;
  width : 300px;
  max-width: 85%;
  height : 80vh;
  overflow: auto;
  left : 10px;
  top: 10px;
  border : solid 1px rgba(0,0,0,0.3);
`;

const CloseCovidSidebarButton = styled.button`
  position : absolute;
  top : 10px;
  right : 10px;
  border : none;
  background : none;
`;

export default (props) => {
  const {filterSecondary} = props;
  const [filterIsInUse, setFilterIsInUse] = useState(false); 
  
  useEffect(() => {
    if(filterSecondary !== "symptoms") {
      setFilterIsInUse(true);
    }
  }, [filterSecondary])
  return (
    <Wrapper>
      <img alt="Let's beat covid logo" src={logoUrl} style={{ width: "100%" }} />
      <CloseCovidSidebarButton onClick={ () => props.onCloseSidebar() }>
        <i className="fa fa-close" style={{fontSize: 30, color : "white"}}/>
      </CloseCovidSidebarButton>
      <Accordion
        initialState={{expanded : ["0"]}}
        onChange={({ expanded }) => console.log(expanded)}
      >
        <Panel title={covidConstants.covid_status.sidebarHeading} style={{ padding : 5}}>
          <CovidStatus setFilters={props.setFilters} filterSecondary={props.filterSecondary} filterIsInUse={filterIsInUse}/>
        </Panel>
        <Panel title={covidConstants.amount_of_contact.sidebarHeading}>
          <SocialDistancing setFilters={props.setFilters} filterSecondary={props.filterSecondary}/>
        </Panel>
        <Panel title={covidConstants.self_isolation_steps.sidebarHeading}>
          <SelfIsolationSteps setFilters={props.setFilters} filterSecondary={props.filterSecondary}/>
        </Panel>
        <Panel title={covidConstants.current_work.sidebarHeading}>
          <WorkCurrent setFilters={props.setFilters} filterSecondary={props.filterSecondary}/>
        </Panel>
      </Accordion>

      <div style={{ padding: 20 }}>
        Developed by MedShr, NHS doctors and Leeds University Institute of Data Analytics, using <a href="https://github.com/layik/eAtlas">eAtlas</a>
      </div>
      <div style={{ padding: "0px 20px 20px" }}>
        <img alt="MedShr Logo" src={require("../../img/medshr-logo.svg")} style={{ margin: "0px 5px" }} />
        <img alt="Health Education England Logo" src={require("../../img/health-education-england.png")} style={{ margin: "0px 5px" }} />
        <img alt="NHS Logo" src={require("../../img/NHS.png")} style={{ margin: "0px 5px" }} />
      </div>
    </Wrapper>
  );
}
