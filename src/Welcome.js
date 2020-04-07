// TEMP comment: https://github.com/uber/deck.gl/tree/8.1-release/examples/website/icon
import React from "react";
import DeckGL from "@deck.gl/react";
import IconClusterLayer from "./icon-cluster-layer";
import {StaticMap} from "react-map-gl";

import Constants from "./Constants";
import ICON_MAPPING from "./location-icon-mapping.json";
import SPRITES_IMG_URL from "./img/lets-beat-covid-sprites.png";
import CovidSidebar from "./components/covid-sidebar";
import covidConstants from "./covid-constants";
import _ from "underscore";
import styled from "styled-components";

const csv2geojson = require("csv2geojson");

const OpenCovidSidebarButton = styled.button`
  position: fixed;
  left: 0px;
  top: 10px;
  max-width: 95%;
  display: flex;
  align-items: center;
  background: black;
  color: white;
  text-align: left;
  padding: 10px;
`;

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiZW15dW5nbWVkc2hyIiwiYSI6ImNrOGs4NmphcjAycmYzZm51aTM3Z281aDUifQ.-Enbhu8pF2CIra4iFGFs8A";
// Initial viewport settings

// ===== When using Rscript run.R =====
const URL = process.env.NODE_ENV === "development" ? Constants.DEV_URL : Constants.PRD_URL;
const defaultURL = "/api/lbc";

// ==== When building for production ====
// const URL = "";
// const defaultURL = "/api/geo";

const initialViewState = {
  longitude: 0.1278,
  latitude: 51.5074,
  zoom: 3,
  minZoom: 3,
  pitch: 0,
  bearing: 0
};

class Welcome extends React.Component {
  constructor() {
    super();
    this.state = {
      data: [],
      filterPrimary: "covid_status",
      filterSecondary: "symptoms",
      showSidebar: true
    };

    this.setFilters = this.setFilters.bind(this);
  }
  componentDidMount() {
    this.fetchData();
  }
  fetchData() {
    fetch(URL + defaultURL)
      .then(response => response.text())
      .then(response => {
        csv2geojson.csv2geojson(response, (err, data) => {
          this.setState({data});
        });
      });
  }
  setFilters(filterPrimary, filterSecondary) {
    this.setState({
      filterPrimary,
      filterSecondary
    });
  }

  render() {
    const layerProps = {
      data: this.state.data.features,
      pickable: true,
      getPosition: d => d.geometry.coordinates,
      iconAtlas: SPRITES_IMG_URL,
      iconMapping: ICON_MAPPING,
      filterPrimary: this.state.filterPrimary,
      filterSecondary: this.state.filterSecondary
    };

    const iconClusterLayer = new IconClusterLayer({...layerProps, id: "icon-cluster", sizeScale: 70});
    const layers = [iconClusterLayer];

    return (
      <div>
        <DeckGL initialViewState={initialViewState} controller={true} layers={layers}>
          <StaticMap
            mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
            mapStyle={"mapbox://styles/emyungmedshr/ck8pno2eh0zio1jo17iw7mmdt"}
          />
        </DeckGL>

        <div style={{display: this.state.showSidebar ? "block" : "none"}}>
          <CovidSidebar
            setFilters={this.setFilters}
            filterSecondary={this.state.filterSecondary}
            onCloseSidebar={() => this.setState({showSidebar: false})}
          />
        </div>

        {!this.state.showSidebar && (
          <OpenCovidSidebarButton onClick={() => this.setState({showSidebar: true})}>
            <div>
              <b>Viewing: </b>
              {covidConstants[this.state.filterPrimary].sidebarHeading}
              <br />

              {
                _.find(covidConstants[this.state.filterPrimary].responses, x => x.id === this.state.filterSecondary)
                  .label
              }
            </div>
            <i style={{color: "white !important", marginLeft: 10}} className="fa fa-chevron-right" />
          </OpenCovidSidebarButton>
        )}
      </div>
    );
  }
}

export default Welcome;
