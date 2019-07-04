import React from 'react';
import DeckGL from 'deck.gl';
import MapGL, { NavigationControl } from 'react-map-gl';

import {
  fetchData, generateDeckLayer,
  getParamsFromSearch, getBbx
} from './utils';
import Constants from './Constants';
import DeckSidebar from './components/DeckSidebar/DeckSidebar';
import history from './history';

import './App.css';
import Tooltip from './components/Tooltip';

const URL = (process.env.NODE_ENV === 'development' ? Constants.DEV_URL : Constants.PRD_URL);

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

const gradient = {
  height: '200px',
  // TODO: which browsers?
  backgroundColor: 'red', /* For browsers that do not support gradients */
  backgroundImage: 'linear-gradient(to top, red , yellow)' /* Standard syntax (must be last) */
}

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
    super(props)
    const init = {
      longitude: -1.6362,
      latitude: 53.8321,
      zoom: 10,
      pitch: 55,
      bearing: 0
    }
    const param = getParamsFromSearch(props.location.search);
    if (param) {
      //lat=53.814&lng=-1.534&zoom=11.05&bea=0&pit=55&alt=1.5
      Object.keys(param).forEach(key => {
        Object.keys(init).forEach(iKey => {
          if (iKey.startsWith(key)) {
            init[key] = param[key]
          }
        })
      })
    }

    this.state = {
      loading: true,
      layers: [],
      backgroundImage: gradient.backgroundImage,
      radius: 100,
      elevation: 4,
      mapStyle: "mapbox://styles/mapbox/dark-v9",
      initialViewState: init,
      subsetBoundsChange: false,
      lastViewPortChange: new Date(),
    }
    this._recalculateLayers = this._recalculateLayers.bind(this)
    this._renderTooltip = this._renderTooltip.bind(this);
    this._fetchAndUpdateState = this._fetchAndUpdateState.bind(this)
  }

  componentDidMount() {
    this._fetchAndUpdateState()
  }

  _fetchAndUpdateState(aURL) {
    // TODO: more sanity checks?
    const fullURL = aURL ?
      // TODO: decide which is better.
      // URL + "/api/url?q=" + aURL : // get the server to parse it 
      aURL : // do not get the server to parse it 
      URL + "/api/stats19";

    fetchData(fullURL, (data, error) => {
      if (!error) {
        // console.log(data.features);
        this.setState({
          loading: false,
          data: data.features,
          alert: null
        })
        this._recalculateLayers()
      } else {
        console.log(error);

        this.setState({
          loading: false,
          alert: { content: 'Could not reach: ' + fullURL }
        })
        //network error?
      }
    })
  }

  /**
   * Welcome should hold own state in selected as:
   * {property: Set(val1, val2), ...}.
   * 
   * @param {*} radius specific to changing geoms
   * @param {*} elevation specific to changing geoms
   * @param {*} filter multivariate filter of properties
   */
  _recalculateLayers(radius, elevation, filter) {
    let { data } = this.state
    const { year, road_type, severity } = this.state;
    if (!data) return;
    //if resetting a value
    if (filter && filter.selected !== "") {
      data = data.filter(
        d => {
          if (filter.what === 'road_type') {
            return (d.properties.road_type === filter.selected + "")
          } else if (filter.what === 'severity') {
            return (d.properties.accident_severity === filter.selected)
          } else if (filter.what === 'year') {
            return (d.properties.date.split("/")[2] === filter.selected)
          } else if (filter.what === 'multi') {
            // go through each selection
            const selected = filter.selected;
            // selected.var > Set()
            let multiCheck = false;
            for (let each of Object.keys(selected)) {
              if (selected[each].has(d.properties[each] + "")) {
                multiCheck = true
              } else {
                multiCheck = false
              }
            }
            return multiCheck;
          }
          return (true)
        }
      )
    }
    // console.log(data.length);
    data = data.filter(
      d => {
        if (road_type && (!filter || filter.what !== 'road_type')) {
          return (d.properties.road_type === road_type + "")
        } else if (severity && (!filter || filter.what !== 'severity')) {
          return (d.properties.accident_severity === severity)
        } else if (year && (!filter || filter.what !== 'year')) {
          return (d.properties.date.split("/")[2] === year)
        }
        return (true)
      }
    )
    // console.log(data.length);
    let layer_style = 'grid';
    if (data.length < 100) layer_style = 'icon'
    const alayer = generateDeckLayer(
      layer_style, data, this._renderTooltip,
      {
        radius: radius ? radius : this.state.radius,
        cellSize: radius ? radius : this.state.radius,
        elevationScale: elevation ? elevation : this.state.elevation,
        lightSettings: LIGHT_SETTINGS
      }
    )

    this.setState({
      mapStyle: filter && filter.what === 'mapstyle' ? "mapbox://styles/mapbox/" + filter.selected + "-v9" : this.state.mapStyle,
      tooltip: "",
      filtered: data,
      layers: [alayer],
      viewport: alayer.context,
      radius: radius ? radius : this.state.radius,
      elevation: elevation ? elevation : this.state.elevation,
      road_type: filter && filter.what === 'road_type' ? filter.selected : this.state.road_type,
      year: filter && filter.what === 'year' ? filter.selected : this.state.year,
      severity: filter && filter.what === 'severity' ? filter.selected : this.state.severity,
    })
  }

  _renderTooltip({ x, y, object }) {
    const hoveredObject = object;
    // console.log(hoveredObject && hoveredObject.points[0].properties.speed_limit);
    // console.log(hoveredObject)
    // return
    if (!hoveredObject) {
      this.setState({ tooltip: "" })
      return;
    }
    this.setState({
      tooltip:
        // react did not like x and y props.
        <Tooltip topx={x} topy={y} hoveredObject={hoveredObject} />
    })
  }

  _updateURL(viewport) {
    const { latitude, longitude, zoom, bearing, pitch, altitude } = viewport;
    const { subsetBoundsChange, lastViewPortChange } = this.state;

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
      )
      this.setState({ lastViewPortChange: new Date() })
    }
    const bounds = this.map && this.map.getBounds()
    if (bounds && subsetBoundsChange) {
      const box = getBbx(bounds)
      // console.log("bounds", box);
      const { xmin, ymin, xmax, ymax } = box;
      fetchData(URL + "/api/stats19/" + xmin + "/" +
        ymin + "/" + xmax + "/" + ymax,
        (data, error) => {
          if (!error) {
            // console.log(data.features);
            this.setState({
              data: data.features,
            })
            this._recalculateLayers()
          } else {
            //network error?
          }
        })
    }

  }

  render() {
    const { tooltip, viewport, initialViewState,
      loading, mapStyle, alert } = this.state;
    // let {viewState} = this.props;
    return (
      <div>
        {/* just a little catch to hide the loader when no basemap is presetn */}
        <div className="loader" style={{
          zIndex: loading ? 999 : 0,
          visibility: mapStyle.endsWith("No map-v9") ? 'hidden' : 'visible'
        }} />
        <MapGL
          // key={height+width} //causes layer to disappear
          onLoad={this._onMapLoad}
          ref={ref => {
            // save a reference to the mapboxgl.Map instance
            this.map = ref && ref.getMap();
          }}
          mapStyle={mapStyle}
          onViewportChange={(viewport) => {
            this._updateURL(viewport)
            this.setState({ viewport })
          }}
          height={window.innerHeight - 54 + 'px'}
          width={window.innerWidth + 'px'}
          //crucial bit below
          viewState={viewport ? viewport : initialViewState}
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        >
          <div className='mapboxgl-ctrl-top-right' style={{
            zIndex: 9
          }}>
            <NavigationControl
              {...viewport}
              onViewportChange={viewport => this.setState({ viewport })}
            />
          </div>
          <DeckGL
            viewState={viewport ? viewport : initialViewState}
            initialViewState={initialViewState}
            layers={this.state.layers}
          >
            {tooltip}
          </DeckGL>
        </MapGL>
        <DeckSidebar
          key={1234}
          alert={alert}
          data={this.state.filtered}
          urlCallback={(url_returned) => {
            this.setState({
              loading: true,
            })
            this._fetchAndUpdateState(url_returned);
          }}
          onSelectCallback={(selected) => this._recalculateLayers(undefined, undefined, selected)}
          onChangeRadius={(value) => this._recalculateLayers(value)}
          onChangeElevation={(value) => this._recalculateLayers(undefined, value)}
          toggleSubsetBoundsChange={(value) => {
            this.setState({
              loading: true,
              subsetBoundsChange: value
            })
            this._fetchAndUpdateState();
          }}
        />
      </div>
    );
  }
}