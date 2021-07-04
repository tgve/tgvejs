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
import MapGL, { NavigationControl, FlyToInterpolator, ScaleControl } from 'react-map-gl';
import centroid from '@turf/centroid';
import bbox from '@turf/bbox';
import _ from 'underscore';

import {
  fetchData, generateDeckLayer, suggestDeckLayer,
  getParamsFromSearch, getBbx, isMobile, colorScale, OSMTILES,
  colorRanges, generateDomain, setGeojsonProps,
  convertRange, getMin, getMax, isURL, getFirstDateColumnName, 
  generateLegend, humanize, colorRangeNamesToInterpolate, getColorArray,
} from './utils';
import Constants, { LIGHT_SETTINGS } from './Constants';
import DeckSidebarContainer from
  './components/decksidebar/DeckSidebarContainer';
import history from './history';

import './App.css';
import Tooltip from './components/Tooltip';
import { sfType } from './geojsonutils';
import { DateTime } from 'luxon';
import { throttle } from 'lodash';
import { isObject } from './JSUtils';

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const gradient = {
  height: '200px',
  // TODO: which browsers?
  backgroundColor: 'red', /* For browsers that do not support gradients */
  /* Standard syntax (must be last) */
  backgroundImage: 'linear-gradient(to top, red , yellow)' 
}

export default class Welcome extends React.Component {
  constructor(props) {
    super(props)
    const init = Constants.DECKGL_INIT
    const param = getParamsFromSearch(props.location ? 
      props.location.search : window.location.search);
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
      mapStyle: MAPBOX_ACCESS_TOKEN ? ("mapbox://styles/mapbox/" +
        (props.dark ? "dark" : "streets") + "-v9") : OSMTILES,
      initialViewState: init,
      subsetBoundsChange: false,
      lastViewPortChange: new Date(),
      colorName: 'default',
      iconLimit: Constants.ICONLIMIT,
      legend: false,
      multiVarSelect: {},
      width: window.innerWidth, height: window.innerHeight,
      tooltipColumns: {column1: "accident_severity" , column2: "date"},
      geographyURL: props.geographyURL,
      geographyColumn: props.geographyColumn,
      column: props.column,
      layerStyle: props.layerStyle
    }
    
    this._generateLayer = this._generateLayer.bind(this)
    this._renderTooltip = this._renderTooltip.bind(this);
    this._fetchAndUpdateState = this._fetchAndUpdateState.bind(this);
    this._fitViewport = this._fitViewport.bind(this);
    this._initWithGeojson = this._initWithGeojson.bind(this);
    this._resize = this._resize.bind(this);
    this._updateURL = this._updateURL.bind(this);
    // TODO: can let user change the 300
    this._throttleUR = throttle((v) => this._updateURL(v), 300)
  }

  componentDidUpdate(nextProps) {
    // props change
    const { data, defaultURL, geographyURL, geographyColumn } = nextProps;
    // TODO: heavy handed
    if(JSON.stringify(data) !== JSON.stringify(this.props.data) ||
      defaultURL !== this.props.defaultURL ||
      geographyURL !== this.props.geographyURL ||
      geographyColumn !== geographyColumn ) {
      this._generateLayer()
    }
    //TODO: return false?
  }

  componentDidMount() {
    const {data, defaultURL} = this.props;
    if(isObject(data) && data.features && data.features.length) {
      // load the data given
      this.setState({
        loading: false,
        data: data,
      }, () => {
        this._fitViewport();
        this._generateLayer();
      });
      
    } else {
      if (defaultURL)  {
        this._fetchAndUpdateState(defaultURL);
      } else {
        // this._generateLayer();
        this.setState({loading: false}) 
      }
    }
    window.addEventListener('resize', this._resize)
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);  
  }

  /**
   * Main function to fetch data and update state.
   * 
   * @param {String} aURL to use if not state.defaultURL is used.
   * @param {Object} customError to use in case of urlCallback object/urls.
   */
  _fetchAndUpdateState(aURL, customError) {    
    if (aURL && !isURL(aURL)) {
      if(this.state.loading) {
        this.setState({loading: false})
      }
      return
    };
    if (customError && typeof (customError) !== 'object') return;
    fetchData(aURL, (data, error) => {
      const { geographyURL } = this.props;
      if(isURL(geographyURL)) {
        // it will always show geojson empty as column is not set
        fetchData(geographyURL, (geojson, geoErr) => {
          if(!geoErr) {
            this.setState({
              loading: false,
              geography: geojson,
              data: data,
              alert: customError || null
            }, () => {
              this._fitViewport(geojson);
              this._generateLayer();
            });
          } else {
            this.setState({
              loading: false,
              alert: { content: 'Could not reach: ' + geographyURL }
            });
          }
        })
      } else {
        this._initWithGeojson(error, data, customError, aURL);
      }
    })
  }

  /**
   * Helper function to simply set state with geojson `data` and 
   * name the source with `fullURL`. The other params are error management.
   * 
   * @param {*} error any error to avoid setting data param
   * @param {*} data geojson valid object to use throughout eAtlas
   * @param {*} customError any custom error similar to `error` used by 
   * `this.state.alert`
   * @param {*} fullURL here used as naming source of data and shown on header
   */
  _initWithGeojson(error, data, customError, fullURL) {
    if (!error) {
      // this._updateURL(viewport)
      this.setState({
        loading: false,
        data: data,
        alert: customError || null
      });
      this._fitViewport(data);
      this._generateLayer();
    } else {
      this.setState({
        loading: false,
        alert: { content: 'Could not reach: ' + fullURL }
      });
      //network error?
    }
  }

  /**
   * The main function generating DeckGL layer and customizing mapbox styles.
   * The reason why state is not updated down in <DeckSidebarContainer />
   * is to optimise the number of setState or equivalent React hooks.
   * 
   * @param {*} values includes
   * @param {Object} filter multivariate filter of properties
   * @param {String} cn short for colorName passed from callback
   * @param {Object} layerOptions
   */
  _generateLayer(values = {}) {
    const { layerOptions = {}, filter, cn } = values;

    if (filter && filter.what === 'mapstyle') {
      const newStyle = "mapbox://styles/mapbox/" + filter.selected + "-v9";
      this.setState({
        mapStyle: filter.what === 'mapstyle' ? filter.selected === "No map" ?
          Constants.BLANKSTYLE : !MAPBOX_ACCESS_TOKEN ? OSMTILES :
          newStyle : this.state.mapStyle,
      })
      return;
    }
    const { colorName, iconLimit, geography, geographyColumn,
      multiVarSelect } = this.state;

    let data = (this.props.data && this.props.data.features) 
    || (this.state.data && this.state.data.features)
    // data or geography and add column data
    if (!data) return;

    let column = (filter && filter.what === 'column' && filter.selected) ||
      this.state.column;
    // in case there is no or one column
    const columnNameOrIndex = column || 0;

    if (filter && filter.what === "%") {
      data = data.slice(0, filter.selected / 100 * data.length)
    }
    // to optimize the search keep state as the source of truth
    if (this.state.coords) {
      data = this.state.filtered;
    }

    //if resetting a value
    const filterValues = filter && filter.what === 'multi' ||
      Object.keys(multiVarSelect).length;
    const filterCoords = filter && filter.what === 'coords';
    const selected = filter && filter.selected || multiVarSelect;
    if (filterValues || filterCoords) {
      const yearColumn = getFirstDateColumnName(data[0].properties);
      data = data.filter(
        d => {
          if (filterValues) {
            // go through each selection
            // selected.var > Set()
            for (let each of Object.keys(selected)) {
              const nextValue = each === yearColumn ?
                DateTime.fromISO(d.properties[each]).year + "" : 
                d.properties[each] + ""
              // each from selected must be in d.properties
              // *****************************
              // compare string to string
              // *****************************
              if (!selected[each].has(nextValue)) {
                return false
              }
            }
          }
          if (filterCoords) {
            // coords in 
            if (_.difference(filter.selected || this.state.coords,
              d.geometry.coordinates.flat()).length !== 0) {
              return false;
            }
          }
          return (true)
        }
      )
      // critical check
      if (!data || !data.length) {
        this.setState({
          alert: { content: 'Filtering returns no results' }
        })
        return
      };
    }
    const geomType = sfType(
      geography ? geography.features[0] : data[0]
    ).toLowerCase();
    // needs to happen as soon as filtering is done
    // assemble geometry from this.state.geometry if so
    if (geomType === "polygon" || geomType === "multipolygon") {
      // is there a geometry provided?
      if (geography) {
        // is geometry equal to or bigger than data provided?
        if (data.length > geography.features.length) {
          // for now just be aware
          //TODO: alert or just stop it?
        }
        data = setGeojsonProps(geography, data, geographyColumn)
        // critical check
        if (!data || !data.features) {
          this.setState({
            alert: { content: 'Is there a matching geography column?' }
          })
          return
        };
        // it was data.features when this function started
        data = data.features || data;
      }
    }
    let layerStyle = (filter && filter.what ===
      'layerStyle' && filter.selected) || this.state.layerStyle || 
      suggestDeckLayer(geography ? geography.features : data);
    // TODO: incorporate this into suggestDeckLayer
    if (!new RegExp("point", "i").test(geomType)) layerStyle = "geojson"
    const switchToIcon = data.length < iconLimit && !layerStyle && 
    (!filter || filter.what !== 'layerStyle') && geomType === "point";
    if (switchToIcon) layerStyle = 'icon';

    const options = Object.assign({
      ...this.state.layerOptions,      
      lightSettings: LIGHT_SETTINGS,
      colorRange: colorRanges(cn || colorName),
      getColor: getColorArray(cn || colorName)
    }, layerOptions);
    
    // generate a domain
    const domain = generateDomain(data, columnNameOrIndex);
    const getValue = (d) => 
    // initialazied with 1 so +columnNameOrIndex is safe
    d.properties[+columnNameOrIndex ?
      Object.keys(d.properties)[columnNameOrIndex] : columnNameOrIndex]

    if (layerStyle === 'heatmap') {
      options.getPosition = d => d.geometry.coordinates
      // options.getWeight = d => d.properties[columnNameOrIndex]
      options.updateTriggers = {
        // even if nulls
        getWeight: typeof(options.getWeight) === 'function' &&
        data.map(d => options.getWeight(d))
      }
    }
    if (geomType === 'linestring') {
      layerStyle = "line"
      // https://github.com/uber/deck.gl/blob/master/docs/layers/line-layer.md
      options.getColor = [235, 170, 20]
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
        // options.getSourceColor = d => 
        // [Math.sqrt(+(d.properties.base)) * 1000, 140, 0]
        // options.getTargetColor = d => 
        // [Math.sqrt(+(d.properties.hs2)) * 1e13, 140, 0]
        options.getSourcePosition = d => d.geometry.coordinates[0] // geojson
        options.getTargetPosition = d => d.geometry.coordinates[1] // geojson
      }
      if (+(data[0] && data[0].properties &&
        data[0].properties[columnNameOrIndex])) {
        options.getWidth = d => {
          return this._newRange(data, d, columnNameOrIndex, 
            getMin(domain), getMax(domain));
        }; // avoid id
      }
    }
    // TODO 
    if (layerStyle === 'scatter') {
      if (+(data[0] && data[0].properties &&
        data[0].properties[columnNameOrIndex])) {
        options.getRadius = d => {
          return this._newRange(data, d, columnNameOrIndex,
            getMin(domain), getMax(domain));
        }
      }
    }
    let newLegend = this.state.legend;
    const fill =  (d) => colorScale(
      +getValue(d) ? +getValue(d) : getValue(d),
      domain, 180, cn || this.state.colorName
    )

    if (geomType === "polygon" || geomType === "multipolygon" ||
      layerStyle === 'geojson') {
      
      options.getFillColor = fill;

      options.updateTriggers = {
        getFillColor: data.map((d) => fill(d))
      }
      const isNumeric = +(data[0].properties[
        +columnNameOrIndex ?
        Object.keys(data[0].properties)[columnNameOrIndex] : columnNameOrIndex
      ])
      if(isNumeric) {
        newLegend = generateLegend(
          {
            domain,
            title: humanize(column),
            interpolate: colorRangeNamesToInterpolate(
              cn || this.state.colorName
            )
          }
        )
      }
    }
    if (layerStyle === 'barvis') {
      options.getPosition = d => [d.geometry.coordinates[0],
      d.geometry.coordinates[1], 0]
      // if (data[0].properties.result) options.getRotationAngle = d =>
      //   d.properties.result.includes("gain from") ? 45 : 1
      options.getScale = 20
      options.updateTriggers = {
        // TODO: get the functions & spread them
        getRotationAngle: typeof(options.getRotationAngle) === 'function' &&
          data.map(d => options.getRotationAngle(d)),
        getWidth: typeof(options.getWidth) === 'function' &&
          data.map(d => options.getWidth(d))
      }
    }

    if (layerStyle === 'pointcloud') {
      options.getColor = fill;
      options.updateTriggers = {
        getColor: data.map((d) => fill(d)),
        getPosition: [data.length]
      }
      newLegend = generateLegend(
        {
          domain,
          title: humanize(column),
          interpolate: colorRangeNamesToInterpolate(
            cn || this.state.colorName
          )
        }
      )
    }

    const alayer = generateDeckLayer(
      layerStyle, data, this._renderTooltip, options
    )

    this.setState({
      alert: switchToIcon ? { content: 'Switched to icon mode. ' } : null,
      loading: false,
      layerStyle,
      geomType,
      tooltip: "",
      filtered: data,
      layers: [alayer],
      layerOptions: options,
      // do not save if not given etc
      multiVarSelect: filter && filter.what === "multi" ?
        filter.selected : multiVarSelect,
      road_type: filter && filter.what === 'road_type' ? filter.selected :
        this.state.road_type,
      colorName: cn || colorName,
      column, // all checked
      coords: filter && filter.what === 'coords' ? filter.selected :
        this.state.coords,
      legend: newLegend
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
      fetchData(this.props.defaultURL + xmin + "/" +
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
    const showLegend = legend && (geomType === 'polygon'
      || geomType === 'multipolygon' || layerStyle === "pointcloud")

    return (
      <div>
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
            this._throttleUR(viewport)
            this.setState({ viewport })
          }}
          height={this.state.height + 'px'}
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
            <ScaleControl maxWidth={100} unit="metric" 
              style={{
                left: 20,
                bottom: 100
              }} />
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
          colourCallback={(colorName) =>
            this._generateLayer({ cn: colorName })
          }
          urlCallback={(url_returned, geojson_returned) => {
            this.setState({
              // TODO: full sync in future
              geography: null,
              column: null,
              tooltip: "",
              road_type: "",
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
          onSelectCallback={(selected) => 
            this._generateLayer({ filter: selected })}
          onLayerOptionsCallback={(layerOptions) => 
            this._generateLayer({ layerOptions })}
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
          datasetName={this.props.defaultURL}
        />
        {
          showLegend &&
          <div className="right-side-panel mapbox-legend">
            {legend}
          </div>
        }
      </div>
    );
  }
  _resize() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  };

  _newRange (data, d, columnNameOrIndex, min, max) {
    let newMax = 10, newMin = 0.1;
    if (data.length > 100000) {
      newMax = 0.5; newMin = 0.005;
    }
    const r = convertRange(
      d.properties[columnNameOrIndex], {
      oldMin: min, oldMax: max, newMax: newMax, newMin: newMin
    });
    return r;
  }
}