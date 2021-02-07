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
import React from 'react';
import DeckGL from 'deck.gl';
import MapGL, { NavigationControl, FlyToInterpolator } from 'react-map-gl';
import centroid from '@turf/centroid';
import bbox from '@turf/bbox';
import _ from 'underscore';

import {
  fetchData, generateDeckLayer,
  getParamsFromSearch, getBbx,
  isMobile, colorScale, OSMTILES,
  colorRanges, generateDomain,
  convertRange, getMin, getMax, isURL, COLOR_RANGE
} from './utils';
import Constants, { LIGHT_SETTINGS } from './Constants';
import DeckSidebarContainer from
  './components/decksidebar/DeckSidebarContainer';
import history from './history';

import './App.css';
import Tooltip from './components/Tooltip';
import { sfType } from './geojsonutils';
import { isNumber } from './JSUtils';

const URL = (process.env.NODE_ENV === 'development' ? Constants.DEV_URL : Constants.PRD_URL);
const defualtURL = process.env.REACT_APP_DEFAULT_URL || (URL + "/api/stats19");

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const gradient = {
  height: '200px',
  // TODO: which browsers?
  backgroundColor: 'red', /* For browsers that do not support gradients */
  backgroundImage: 'linear-gradient(to top, red , yellow)' /* Standard syntax (must be last) */
}

export default class Welcome extends React.Component {
  constructor(props) {
    super(props)
    const init = Constants.DECKGL_INIT
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
      mapStyle: MAPBOX_ACCESS_TOKEN ? ("mapbox://styles/mapbox/" +
        (props.dark ? "dark" : "streets") + "-v9") : OSMTILES,
      initialViewState: init,
      subsetBoundsChange: false,
      lastViewPortChange: new Date(),
      colourName: 'default',
      iconLimit: 500,
      legend: false,
      width: window.innerWidth, height: window.innerHeight,
      tooltipColumns: {column1: "accident_severity" , column2: "date"}
    }
    this._generateLayer = this._generateLayer.bind(this)
    this._renderTooltip = this._renderTooltip.bind(this);
    this._fetchAndUpdateState = this._fetchAndUpdateState.bind(this);
    this._fitViewport = this._fitViewport.bind(this);
  }

  componentDidMount() {
    this._fetchAndUpdateState()
    window.addEventListener('resize', this._resize);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  /**
   * Main function to fetch data and update state.
   * 
   * @param {String} aURL to use if not default `/api/stats19` is used.
   * @param {Object} customError to use in case of urlCallback object/urls.
   */
  _fetchAndUpdateState(aURL, customError) {
    if (aURL && !isURL(aURL)) return;
    if (customError && typeof (customError) !== 'object') return;
    // TODO: more sanity checks?
    const fullURL = aURL ?
      // TODO: decide which is better.
      // URL + "/api/url?q=" + aURL : // get the server to parse it 
      aURL : // do not get the server to parse it 
      defualtURL;

    fetchData(fullURL, (data, error) => {
      if (!error) {
        // this._updateURL(viewport)
        this.setState({
          loading: false,
          data: data,
          alert: customError || null
        })
        this._fitViewport(data)
        this._generateLayer()
      } else {
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
   * @param {*} values includes
   * radius: specific to changing geoms
   * elevation: specific to changing geoms
   * filter: multivariate filter of properties
   * cn: short for colorName passed from callback
   * TODO: other
   */
  _generateLayer(values = {}) {
    const { radius, elevation, filter, cn } = values;

    if (filter && filter.what === 'mapstyle') {
      this.setState({
        mapStyle: !MAPBOX_ACCESS_TOKEN ? OSMTILES :
          filter && filter.what === 'mapstyle' ? "mapbox://styles/mapbox/" + filter.selected + "-v9" : this.state.mapStyle,
      })
      return;
    }
    let data = this.state.data && this.state.data.features
    const { colourName, iconLimit } = this.state;
    let column = (filter && filter.what === 'column' && filter.selected) ||
      this.state.column;

    if (!data) return;
    if (filter && filter.what === "%") {
      data = data.slice(0, filter.selected / 100 * data.length)
    }
    // to optimize the search keep state as the source of truth
    if (this.state.coords) {
      data = this.state.filtered;
    }
    const geomType = sfType(data[0]).toLowerCase();
    //if resetting a value
    if (filter && filter.selected !== "") {
      data = data.filter(
        d => {
          if (filter.what === 'multi') {
            // go through each selection
            const selected = filter.selected;
            // selected.var > Set()
            for (let each of Object.keys(selected)) {
              const nextValue = each === "date" ?
                d.properties[each].split("-")[0] : d.properties[each] + ""
              // each from selected must be in d.properties
              // *****************************
              // compare string to string
              // *****************************
              if (!selected[each].has(nextValue)) {
                return false
              }
            }
          }
          if (filter.what === 'coords') {
            // coords in 
            if (_.difference(filter.selected || this.state.coords,
              d.geometry.coordinates.flat()).length !== 0) {
              return false;
            }
          }
          return (true)
        }
      )
    }
    let layerStyle = (filter && filter.what ===
      'layerStyle' && filter.selected) || this.state.layerStyle || 'grid';
    if (geomType !== "point") layerStyle = "geojson"
    if (data.length < iconLimit && !column &&
      geomType === "point") layerStyle = 'icon';
    const options = {
      radius: radius ? radius : this.state.radius,
      cellSize: radius ? radius : this.state.radius,
      elevationScale: elevation ? elevation : this.state.elevation,
      lightSettings: LIGHT_SETTINGS,
      colorRange: colorRanges(cn || colourName)
    };
    // generate a domain
    const columnNameOrIndex =
      (filter && filter.what === 'column' && filter.selected) || column || 1;
    if (layerStyle === 'heatmap') {
      options.getPosition = d => d.geometry.coordinates
      // options.getWeight = d => d.properties[columnNameOrIndex]
    }
    if (geomType === 'linestring') {
      layerStyle = "line"
      // https://github.com/uber/deck.gl/blob/master/docs/layers/line-layer.md
      options.getColor = d => [235, 170, 20]
      options.getPath = d => d.geometry.coordinates
      options.onClick = (info) => {
        if (info && info.hasOwnProperty('coordinate')) {
          if (['path', 'arc', 'line'].includes(this.state.layerStyle) &&
            info.object.geometry.coordinates) {
            this._generateLayer({
              filter: {
                what: 'coords',
                selected: info.object.geometry.coordinates[0]
              }
            })
          }
        }
      }
      if (layerStyle === 'line') {
        // options.getSourceColor = d => [Math.sqrt(+(d.properties.base)) * 1000, 140, 0]
        // options.getTargetColor = d => [Math.sqrt(+(d.properties.hs2)) * 1e13, 140, 0]
        options.getSourcePosition = d => d.geometry.coordinates[0] // geojson
        options.getTargetPosition = d => d.geometry.coordinates[1] // geojson
      }
      if (isNumber(data[0] && data[0].properties &&
        data[0].properties[columnNameOrIndex])) {
        const colArray = data.map(f => f.properties[columnNameOrIndex])
        const max = getMax(colArray);
        const min = getMin(colArray)
        options.getWidth = d => {
          let newMax = 10, newMin = 0.1;
          if (data.length > 100000) {
            newMax = 0.5; newMin = 0.005
          }
          const r = convertRange(
            d.properties[columnNameOrIndex], {
            oldMin: min, oldMax: max, newMax: newMax, newMin: newMin
          })
          return r
        }; // avoid id
      }
    }
    const domain = generateDomain(data, columnNameOrIndex);
    if (geomType === "polygon" || geomType === "multipolygon" || layerStyle === 'geojson') {
      if(domain && domain.length > 50) {
        options.getFillColor = d => COLOR_RANGE(d.properties[
          isNumber(columnNameOrIndex) ? 
          Object.keys(d.properties)[columnNameOrIndex] : columnNameOrIndex
        ])
      } else{
        options.getFillColor = (d) => colorScale(d, columnNameOrIndex, domain)
      }
    }
    if (layerStyle === 'barvis') {
      options.getPosition = d => [d.geometry.coordinates[0],
      d.geometry.coordinates[1], 0]
      if (data[0].properties.result) options.getRotationAngle = d =>
        d.properties.result.includes("gain from") ? 45 : 1
      options.getScale = d => 200
    }
    const alayer = generateDeckLayer(
      layerStyle, data, this._renderTooltip, options
    )

    this.setState({
      loading: false,
      layerStyle, geomType,
      tooltip: "",
      filtered: data,
      layers: [alayer],
      radius: radius ? radius : this.state.radius,
      elevation: elevation ? elevation : this.state.elevation,
      road_type: filter && filter.what === 'road_type' ? filter.selected :
        this.state.road_type,
      colourName: cn || colourName,
      column, // all checked
      coords: filter && filter.what === 'coords' ? filter.selected :
        this.state.coords
    })
  }

  _fitViewport(newData, bboxLonLat) {
    const data = newData || this.state.data;
    if ((!data || data.length === 0) && !bboxLonLat) return;
    const bounds = bboxLonLat ?
      bboxLonLat.bbox : bbox(data)
    const center = bboxLonLat ? 
    [bboxLonLat.lon, bboxLonLat.lat] : centroid(data).geometry.coordinates;

    this.map.fitBounds(bounds, {padding:'100px'})

    const viewport = {
      ...this.state.viewport,
      longitude: center[0],
      latitude: center[1],
      transitionDuration: 500,
      transitionInterpolator: new FlyToInterpolator(),
      // transitionEasing: d3.easeCubic
    };
    this.setState({ viewport })
  }

  /**
   * Currently the tooltip focuses on aggregated layer (grid).
   * 
   * @param {Object} params passed from DeckGL layer. 
   */
  _renderTooltip(params) {
    const { x, y, object } = params;
    const hoveredObject = object;
    // return
    if (!hoveredObject) {
      this.setState({ tooltip: "" })
      return;
    }
    this.setState({
      tooltip:
        // react did not like x and y props.
        <Tooltip
          {...this.state.tooltipColumns}
          isMobile={isMobile()}
          topx={x} topy={y} hoveredObject={hoveredObject} />
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
      const { xmin, ymin, xmax, ymax } = box;
      fetchData(defualtURL + xmin + "/" +
        ymin + "/" + xmax + "/" + ymax,
        (data, error) => {
          if (!error) {
            this.setState({
              data: data.features,
            })
            this._generateLayer()
          } else {
            //network error?
          }
        })
    }

  }

  render() {
    const { tooltip, viewport, initialViewState,
      loading, mapStyle, alert, data, filtered,
      layerStyle, geomType, legend, coords } = this.state;

    return (
      <div id="html2pdf">
        {/* just a little catch to hide the loader 
        when no basemap is presetn */}
        <div className="loader" style={{
          zIndex: loading ? 999 : -1,
          visibility: typeof mapStyle === 'string' &&
            mapStyle.endsWith("No map-v9") ? 'hidden' : 'visible'
        }} />
        <MapGL
          ref={ref => {
            // save a reference to the mapboxgl.Map instance
            this.map = ref && ref.getMap();
          }}
          mapStyle={mapStyle}
          onViewportChange={(viewport) => {
            this._updateURL(viewport)
            this.setState({ viewport })
          }}
          height={this.state.height - 54 + 'px'}
          width={this.state.width + 'px'}
          //crucial bit below
          viewState={viewport ? viewport : initialViewState}
        // mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
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
            // see docs below, url split for readability
            // https://deck.gl/#/documentation/developer-guide/
            // adding-interactivity?
            // section=using-the-built-in-event-handling
            onClick={(e) => {
              if (!e.layer && coords) {
                this.setState({ coords: null })
                this._generateLayer()
              }
            }}
          >
            {tooltip}
          </DeckGL>
        </MapGL>
        <DeckSidebarContainer
          dark={this.props.dark}
          layerStyle={layerStyle}
          isMobile={isMobile()}
          key="decksidebar"
          alert={alert}
          unfilteredData={data && data.features}
          data={filtered}
          colourCallback={(colourName) =>
            this._generateLayer({ cn: colourName })
          }
          urlCallback={(url_returned, geojson_returned) => {
            this.setState({
              tooltip: "",
              road_type: "",
              radius: 100,
              elevation: 4,
              loading: true,
              coords: null
            })
            if (geojson_returned) {
              // confirm valid geojson
              try {
                this.setState({
                  data: geojson_returned
                })
                this._fitViewport(geojson_returned)
                this._generateLayer()
              } catch (error) {
                // load up default
                this._fetchAndUpdateState(undefined, { content: error.message });
              }
            } else {
              this._fetchAndUpdateState(url_returned);
            }
          }}
          column={this.state.column}
          onSelectCallback={(selected) => this._generateLayer({ filter: selected })}
          onChangeRadius={(value) => this._generateLayer({ radius: value })}
          onChangeElevation={(value) => this._generateLayer({ elevation: value })}
          toggleSubsetBoundsChange={(value) => {
            this.setState({
              loading: true,
              subsetBoundsChange: value
            })
            this._fetchAndUpdateState();
          }}
          onlocationChange={(bboxLonLat) => {
            this._fitViewport(undefined, bboxLonLat)
          }}
          showLegend={(legend) => this.setState({ legend })}
          datasetName={defualtURL}
        />
        {
          legend && (geomType === 'polygon' ||
            geomType === 'multipolygon') &&
          <div className="right-side-panel mapbox-legend">
            {legend}
          </div>
        }
      </div>
    );
  }
  _resize = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  };
}