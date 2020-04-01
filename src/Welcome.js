/**
 * Main entry to the application.
 * 
 * The crucial bits are:
 * 
     this.state = {
      data,            <= main data holding param   
      layers: [],      <= mapgl layers object
      initialViewState:<= deckgl/mapgl initial state object
      legend: false    <= map legend to avoid rerender.
    }
 * and
 * DeckSidebarContainer which holds DeckSidebar object itself.
 * 
 * Main funcitons:
 * _generateLayer which is the main/factory of filtering state
 * of the map area of the application.
 * 
 */
import React from "react";
import DeckGL from "deck.gl";
import MapGL, {NavigationControl, FlyToInterpolator} from "react-map-gl";
import centroid from "@turf/centroid";
import bbox from "@turf/bbox";
import _ from "underscore";

import {
  fetchData,
  generateDeckLayer,
  getParamsFromSearch,
  getBbx,
  isMobile,
  colorScale,
  colorRanges,
  convertRange,
  getMin,
  getMax,
  isURL
} from "./utils";
import Constants from "./Constants";
import DeckSidebarContainer from "./components/DeckSidebar/DeckSidebarContainer";
import history from "./history";

import "./App.css";
import Tooltip from "./components/Tooltip";
import {sfType} from "./geojsonutils";
import {isNumber, isArray} from "./JSUtils";

const csv2geojson = require("csv2geojson");

const osmtiles = {
  version: 8,
  sources: {
    "simple-tiles": {
      type: "raster",
      tiles: [
        // "http://tile.openstreetmap.org/{z}/{x}/{y}.png",
        // "http://b.tile.openstreetmap.org/{z}/{x}/{y}.png"
        // "http://tile.stamen.com/toner/{z}/{x}/{y}.png"
        "https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg"
      ],
      tileSize: 256
    }
  },
  layers: [
    {
      id: "simple-tiles",
      type: "raster",
      source: "simple-tiles"
    }
  ]
};

// ===== When using Rscript run.R =====
// const URL = process.env.NODE_ENV === "development" ? Constants.DEV_URL : Constants.PRD_URL;
// const defaultURL = "/api/lbc";

// ==== When building for production ====
const URL = "";
const defaultURL = "/api/geo";

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const gradient = {
  height: "200px",
  // TODO: which browsers?
  backgroundColor: "red" /* For browsers that do not support gradients */,
  backgroundImage: "linear-gradient(to top, red , yellow)" /* Standard syntax (must be last) */
};

const LIGHT_SETTINGS = {
  lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

export default class Welcome extends React.Component {
  constructor(props) {
    super(props);
    const init = {
      longitude: -1.614,
      latitude: 52.075,
      zoom: 2.77,
      alt: 1.5,
      bearing: 0.0,
      pitch: 46.809
    };

    let param = {};

    if (typeof window !== "undefined") {
      param = getParamsFromSearch(window.location.search);
    }

    if (param) {
      //lat=53.814&lng=-1.534&zoom=11.05&bea=0&pit=55&alt=1.5
      Object.keys(param).forEach(key => {
        Object.keys(init).forEach(iKey => {
          if (iKey.startsWith(key)) {
            init[key] = param[key];
          }
        });
      });
    }

    this.state = {
      layerStyle: "hex",
      column: "TotalCases",
      loading: true,
      layers: [],
      backgroundImage: gradient.backgroundImage,
      radius: 1000,
      elevation: 6,
      mapStyle: MAPBOX_ACCESS_TOKEN ? "mapbox://styles/mapbox/" + (props.dark ? "dark" : "basic") + "-v9" : osmtiles,
      initialViewState: init,
      subsetBoundsChange: false,
      lastViewPortChange: new Date(),
      colourName: "inverseDefault",
      iconLimit: 500,
      legend: false,
      // letsbeatcovid
      currentlySelected: ""
    };
    this._generateLayer = this._generateLayer.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
    this._fetchAndUpdateState = this._fetchAndUpdateState.bind(this);
    this._fitViewport = this._fitViewport.bind(this);
    this._handleOnWindowResize = this._handleOnWindowResize.bind(this);
  }

  componentDidMount() {
    this._fetchAndUpdateState();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", this._handleOnWindowResize);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this._handleOnWindowResize);
  }

  _handleOnWindowResize = () => {
    _.debounce(
      this.setState(
        {
          viewport: Object.assign({}, this.state.viewport, {
            width: window.innerWidth,
            height: window.innerHeight
          })
        },
        () => console.log(123)
      ),
      100
    );
  };

  /**
   * Main function to fetch data and update state.
   *
   * @param {String} aURL to use if not default `/api/covid19` is used.
   * @param {Object} customError to use in case of urlCallback object/urls.
   */
  _fetchAndUpdateState(aURL, customError) {
    if (aURL && !isURL(aURL)) return;
    if (customError && typeof customError !== "object") return;
    // TODO: more sanity checks?

    console.log(URL);
    const fullURL = aURL
      ? // TODO: decide which is better.
        // URL + "/api/url?q=" + aURL : // get the server to parse it
        aURL // do not get the server to parse it
      : URL + defaultURL;

    fetchData(fullURL, (data, error) => {
      console.log(data);
      fetch(fullURL)
        .then(response => response.text())
        .then(response => {
          csv2geojson.csv2geojson(response, (err, data) => {
            console.log(data);
            this.setState({
              loading: false,
              data: data,
              alert: customError || null
            });
            this._fitViewport(data);
            this._generateLayer();
            if (!err) {
              //there is an error from csv2geojson
              //about lon/lat validity
              console.log(data);
            }
          });
        });
    });
  }

  /**
   * Welcome should hold own state in selected as:
   * {property: Set(val1, val2), ...}.
   *
   * @param {*} values includes
   * radius: specific to changing geoms
   * elevation: specific to changing geoms
   * filter: multivariate filter of properties
   * cn: short for colorName passed from callback
   * TODO: other
   */
  _generateLayer(values = {}) {
    const {radius, elevation, filter, cn} = values;

    if (filter && filter.what === "mapstyle") {
      this.setState({
        mapStyle: !MAPBOX_ACCESS_TOKEN
          ? osmtiles
          : filter && filter.what === "mapstyle"
          ? "mapbox://styles/mapbox/" + filter.selected + "-v9"
          : this.state.mapStyle
      });
      return;
    }
    let data = this.state.data && this.state.data.features;
    const {colourName, iconLimit} = this.state;
    let column = (filter && filter.what === "column" && filter.selected) || this.state.column;

    if (!data) return;
    if (filter && filter.what === "%") {
      data = data.slice(0, (filter.selected / 100) * data.length);
    }
    // to optimize the search keep state as the source of truth
    if (this.state.coords) {
      data = this.state.filtered;
    }
    const geomType = sfType(data[0]).toLowerCase();
    //if resetting a value
    if (filter && filter.selected !== "") {
      data = data.filter(d => {
        if (filter.what === "multi") {
          // go through each selection
          const selected = filter.selected;
          // selected.var > Set()
          for (let each of Object.keys(selected)) {
            const nextValue = each === "date" ? d.properties[each].split("/")[2] : d.properties[each] + "";
            // each from selected must be in d.properties
            if (!selected[each].has(nextValue)) {
              return false;
            }
          }
        }
        if (filter.what === "coords") {
          // coords in
          if (_.difference(filter.selected || this.state.coords, d.geometry.coordinates.flat()).length !== 0) {
            return false;
          }
        }
        return true;
      });
    }

    let layerStyle = "icon";
    // console.log(data.length);
    // let layerStyle = (filter && filter.what ===
    //   'layerStyle' && filter.selected) || this.state.layerStyle || 'grid';
    if (geomType !== "point") layerStyle = "geojson";
    if (data.length < iconLimit && !column && geomType === "point") layerStyle = "icon";
    const options = {
      radius: radius ? radius : this.state.radius,
      cellSize: radius ? radius : this.state.radius,
      elevationScale: elevation ? elevation : this.state.elevation,
      lightSettings: LIGHT_SETTINGS,
      colorRange: colorRanges(cn || colourName)
    };
    if (layerStyle === "geojson") {
      options.getFillColor = d => colorScale(d, data); //first prop
    }
    let columnNameOrIndex = (filter && filter.what === "column" && filter.selected) || column || 1;
    if (layerStyle === "heatmap") {
      options.getPosition = d => d.geometry.coordinates;
      // options.getWeight = d => d.properties[columnNameOrIndex]
    }
    if (geomType === "linestring") {
      layerStyle = "line";
      // https://github.com/uber/deck.gl/blob/master/docs/layers/line-layer.md
      options.getColor = d => [235, 170, 20];
      options.getPath = d => d.geometry.coordinates;
      options.onClick = info => {
        // console.log(info);
        if (info && info.hasOwnProperty("coordinate")) {
          if (["path", "arc", "line"].includes(this.state.layerStyle) && info.object.geometry.coordinates) {
            this._generateLayer({
              filter: {
                what: "coords",
                selected: info.object.geometry.coordinates[0]
              }
            });
          }
        }
      };
      if (layerStyle === "line") {
        // options.getSourceColor = d => [Math.sqrt(+(d.properties.base)) * 1000, 140, 0]
        // options.getTargetColor = d => [Math.sqrt(+(d.properties.hs2)) * 1e13, 140, 0]
        options.getSourcePosition = d => d.geometry.coordinates[0]; // geojson
        options.getTargetPosition = d => d.geometry.coordinates[1]; // geojson
      }
      if (isNumber(data[0] && data[0].properties && data[0].properties[columnNameOrIndex])) {
        const colArray = data.map(f => f.properties[columnNameOrIndex]);
        const max = getMax(colArray);
        const min = getMin(colArray);
        options.getWidth = d => {
          let newMax = 10,
            newMin = 0.1;
          if (data.length > 100000) {
            newMax = 0.5;
            newMin = 0.005;
          }
          const r = convertRange(d.properties[columnNameOrIndex], {
            oldMin: min,
            oldMax: max,
            newMax: newMax,
            newMin: newMin
          });
          return r;
        }; // avoid id
      }
    }
    const cols = Object.keys((data && data[0] && data[0].properties) || {});
    if (geomType === "polygon" || geomType === "multipolygon") {
      // TODO: remove SPENSER
      const SPENSER = isArray(cols) && cols.length > 0 && cols[1] === "GEOGRAPHY_CODE";
      if (SPENSER) {
        options.getElevation = d =>
          (isNumber(d.properties[column]) && column !== "YEAR" && d.properties[column]) || null;
      }
      // TODO: allow user to specify column.
      options.getFillColor = d => colorScale(d, data, column ? column : SPENSER ? 1 : 0);
    }
    if (geomType === "point" && cols.includes("TotalCases")) {
      options.getPosition = d => d.geometry.coordinates;
      options.getFillColor = d => colorScale(d, data, 1); //2nd prop
      options.getRadius = d => +Object.values(d.properties)[2] * 30;
      options.getElevationValue = p => +p[0].properties.TotalCases;
    }
    const alayer = generateDeckLayer(layerStyle, data, this._renderTooltip, options);

    this.setState({
      loading: false,
      layerStyle,
      geomType,
      tooltip: "",
      filtered: data,
      layers: [alayer],
      radius: radius ? radius : this.state.radius,
      elevation: elevation ? elevation : this.state.elevation,
      road_type: filter && filter.what === "road_type" ? filter.selected : this.state.road_type,
      colourName: cn || colourName,
      column, // all checked
      coords: filter && filter.what === "coords" ? filter.selected : this.state.coords
    });
  }

  _fitViewport(newData, bboxLonLat) {
    const data = newData || this.state.data;
    if (!data || data.length === 0) return;
    const center = centroid(data).geometry.coordinates;
    const bounds = bboxLonLat ? bboxLonLat.bbox : bbox(data);
    // console.log(center, bounds);

    this.map.fitBounds(bounds);
    const viewport = {
      ...this.state.viewport,
      longitude: bboxLonLat ? bboxLonLat.lon : center[0],
      latitude: bboxLonLat ? bboxLonLat.lat : center[1],
      transitionDuration: 500,
      transitionInterpolator: new FlyToInterpolator()
      // transitionEasing: d3.easeCubic
    };
    this.setState({viewport});
  }

  _renderTooltip({x, y, object}) {
    const hoveredObject = object;
    // console.log(hoveredObject && hoveredObject.points[0].properties.speed_limit);
    // console.log(hoveredObject)
    // return
    if (!hoveredObject) {
      this.setState({tooltip: ""});
      return;
    }
    this.setState({
      tooltip: (
        // react did not like x and y props.
        <Tooltip isMobile={isMobile()} topx={x} topy={y} hoveredObject={hoveredObject} />
      )
    });
  }

  _updateURL(viewport) {
    const {latitude, longitude, zoom, bearing, pitch, altitude} = viewport;
    const {subsetBoundsChange, lastViewPortChange} = this.state;

    //if we do history.replace/push 100 times in less than 30 secs
    // browser will crash
    if (new Date() - lastViewPortChange > 1000) {
      history.push(
        `/?lat=${latitude.toFixed(3)}` +
          `&lng=${longitude.toFixed(3)}` +
          `&zoom=${zoom.toFixed(2)}` +
          `&bea=${bearing}` +
          `&pit=${pitch}` +
          `&alt=${altitude}`
      );
      this.setState({lastViewPortChange: new Date()});
      // if(zoom < 6) {
      //   this._fetchAndUpdateState('http://eatlas.geoplumber.com/api/covid19r');
      // } else {
      //   this._fetchAndUpdateState();
      // }
    }
    const bounds = this.map && this.map.getBounds();
    if (bounds && subsetBoundsChange) {
      const box = getBbx(bounds);
      // console.log("bounds", box);
      const {xmin, ymin, xmax, ymax} = box;
      fetchData(URL + defaultURL + xmin + "/" + ymin + "/" + xmax + "/" + ymax, (data, error) => {
        if (!error) {
          console.log("DATA ON FETCH", data);
          // console.log(data.features);
          this.setState({
            data: data.features
          });
          this._generateLayer();
        } else {
          //network error?
        }
      });
    }
  }

  render() {
    const {
      tooltip,
      viewport,
      initialViewState,
      loading,
      mapStyle,
      alert,
      layerStyle,
      geomType,
      legend,
      coords
    } = this.state;
    // console.log(geomType, legend);

    return (
      <div id="html2pdf">
        {/* just a little catch to hide the loader 
        when no basemap is presetn */}
        <div
          className="loader"
          style={{
            zIndex: loading ? 999 : -1,
            visibility: typeof mapStyle === "string" && mapStyle.endsWith("No map-v9") ? "hidden" : "visible"
          }}
        />
        <MapGL
          ref={ref => {
            // save a reference to the mapboxgl.Map instance
            this.map = ref && ref.getMap();
          }}
          mapStyle={mapStyle}
          onViewportChange={viewport => {
            this._updateURL(viewport);
            this.setState({viewport});
          }}
          height={((_.has(this.state.viewport, "height") && this.state.viewport.height) || window.innerHeight) + "px"}
          width={((_.has(this.state.viewport, "width") && this.state.viewport.width) || window.innerWidth) + "px"}
          //crucial bit below
          viewState={viewport ? viewport : initialViewState}
          // mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        >
          <div
            className="mapboxgl-ctrl-top-right"
            style={{
              zIndex: 9
            }}>
            <NavigationControl {...viewport} onViewportChange={viewport => this.setState({viewport})} />
          </div>
          <DeckGL
            viewState={viewport ? viewport : initialViewState}
            initialViewState={initialViewState}
            layers={this.state.layers}
            // see docs below, url split for readability
            // https://deck.gl/#/documentation/developer-guide/
            // adding-interactivity?
            // section=using-the-built-in-event-handling
            onClick={e => {
              if (!e.layer && coords) {
                this.setState({coords: null});
                this._generateLayer();
              }
            }}>
            {tooltip}
          </DeckGL>
        </MapGL>
        <DeckSidebarContainer
          world={this.state.world}
          tests={this.state.tests}
          daily={this.state.daily}
          dark={this.props.dark}
          layerStyle={layerStyle}
          isMobile={isMobile()}
          key="decksidebar"
          alert={alert}
          data={this.state.filtered}
          colourCallback={colourName => this._generateLayer({cn: colourName})}
          urlCallback={(url_returned, geojson_returned) => {
            this.setState({
              tooltip: "",
              road_type: "",
              radius: 1000,
              elevation: 16,
              loading: true,
              coords: null,
              layerStyle: url_returned && url_returned.endsWith("covid19w") ? "heatmap" : this.state.layerStyle
            });
            if (geojson_returned) {
              // confirm valid geojson
              try {
                this.setState({
                  data: geojson_returned
                });
                this._fitViewport(geojson_returned);
                this._generateLayer();
              } catch (error) {
                // load up default
                this._fetchAndUpdateState(undefined, {content: error.message});
              }
            } else {
              this._fetchAndUpdateState(url_returned);
            }
          }}
          column={this.state.column}
          onSelectCallback={selected => {
            this._generateLayer({filter: selected});
            this.setState({currentlySelected: selected});
          }}
          currentlySelected={this.state.currentlySelected}
          onChangeRadius={value => this._generateLayer({radius: value})}
          onChangeElevation={value => this._generateLayer({elevation: value})}
          toggleSubsetBoundsChange={value => {
            this.setState({
              loading: true,
              subsetBoundsChange: value
            });
            this._fetchAndUpdateState();
          }}
          onlocationChange={bboxLonLat => {
            this._fitViewport(bboxLonLat);
          }}
          showLegend={legend => this.setState({legend})}
          datasetName={defaultURL}
        />
        {legend && (geomType === "polygon" || geomType === "multipolygon") && (
          <div className="right-side-panel mapbox-legend">{legend}</div>
        )}
      </div>
    );
  }
}
