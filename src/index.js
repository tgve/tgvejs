/**
 * geoplumber R package code.
 */
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

// keep leaflet for now in case.

// *** Do NOT remove, it seems the location for icon is missing or something
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

ReactDOM.render(<App />, document.getElementById("root"));
