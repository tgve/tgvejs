/**
 * App Home.
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
 *
 */
import React from 'react';
import DeckGL from 'deck.gl';
import MapGL, {
  NavigationControl,
  ScaleControl
} from 'react-map-gl';
import { throttle } from 'lodash';

import {
  fetchData, isMobile, getOSMTiles,
  isURL, theme, updateHistory,
} from '../utils/utils';
import { ICONLIMIT } from '../Constants';
import DeckSidebarContainer from
  '../components/decksidebar/DeckSidebarContainer';

import '../App.css';
import Tooltip from '../components/tooltip';
import { isArray, isObject } from '../utils/JSUtils';
import { generateLayer, initViewState,
  getViewPort } from './util';
import { jsonFromKeySetObject } from '../utils/api';

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const gradient = {
  height: '200px',
  // TODO: which browsers?
  backgroundColor: 'red', /* For browsers that do not support gradients */
  /* Standard syntax (must be last) */
  backgroundImage: 'linear-gradient(to top, red , yellow)'
}

export default class Home extends React.Component {
  constructor(props) {
    super(props)
    const init = initViewState(props);

    this.state = {
      loading: true,
      layers: [],
      backgroundImage: gradient.backgroundImage,
      mapStyle: MAPBOX_ACCESS_TOKEN ? ("mapbox://styles/mapbox/" +
        (props.dark ? "dark" : "streets") + "-v9") : getOSMTiles(),
      initialViewState: init,
      subsetBoundsChange: false,
      lastViewPortChange: new Date(),
      colorName: 'default',
      iconLimit: ICONLIMIT,
      legend: false,
      multiVarSelect: props.select || {},
      width: window.innerWidth, height: window.innerHeight,
      tooltipColumns: { column1: "accident_severity", column2: "date" },
      geographyURL: props.geographyURL,
      geographyColumn: props.geographyColumn,
      column: props.column,
      layerName: props.layerName,
      bottomPanel: false,
    }
    this._callGenerateLayer = this._callGenerateLayer.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
    this._fetchAndUpdateState = this._fetchAndUpdateState.bind(this);
    this._fitViewport = this._fitViewport.bind(this);
    this._initWithGeojson = this._initWithGeojson.bind(this);
    this._initDataState = this._initDataState.bind(this);
    this._updateStateAndLayers = this._updateStateAndLayers.bind(this);
    this._resize = this._resize.bind(this);
    this._updateHistory = this._updateHistory.bind(this);
    // TODO: expose interval
    this._throttleUR = throttle((v) => this._updateHistory(v), 300);
    this._urlCallback = this._urlCallback.bind(this);
  }

  componentDidUpdate(nextProps) {
    // props change
    const { data, defaultURL, geographyURL,
      geographyColumn } = nextProps;
    if(!isObject(data)) return
    const r = isArray(data.features)
      && Math.floor(Math.random() * data.features.length)
    /**
     * If user has added data using Add data button
     * ignore props updates
     */
    if (!this.state.reset &&
      ((isArray(this.props.data.features)
        && JSON.stringify(data.features[r]) !==
        JSON.stringify(this.props.data.features[r])) ||
        defaultURL !== this.props.defaultURL ||
        geographyURL !== this.props.geographyURL ||
        geographyColumn !== this.props.geographyColumn)) {
      this.map && this.map.stop()
      this._initDataState()
    }
  }

  componentDidMount() {
    this._initDataState();
    window.addEventListener('resize', this._resize)
  }

  /**
   * This sequence of checking source of data is
   * repeated three times:
   * 1. when the application first loads,
   * 2. when the source of data changes
   * 3. when the application is reset; that is back to (1)
   */
  _initDataState() {
    const { data, defaultURL } = this.props;
    if (isObject(data) && data.features && data.features.length) {
      // load the data given
      this.setState({
        loading: false,
        data: data,
      }, () => {
        this._fitViewport();
        this._callGenerateLayer()
      });

    } else {
      if (defaultURL) {
        this._fetchAndUpdateState(defaultURL);
      } else {
        this.setState({ loading: false });
      }
    }
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
      if (this.state.loading) {
        this.setState({ loading: false })
      }
      return
    };
    if (customError && typeof (customError) !== 'object') return;
    fetchData(aURL, (data, error) => {
      const { geographyURL } = this.props;
      if (isURL(geographyURL)) {
        // it will always show geojson empty as column is not set
        fetchData(geographyURL, (geojson, geoErr) => {
          this._updateStateAndLayers(geoErr, geojson, data, customError, geographyURL);
        })
      } else {
        if (geographyURL && !isURL(geographyURL)) {
          // only when set but !isURL
          this._initWithGeojson(error, data,
            customError || { content: 'Invalid URL: ' + geographyURL },
            aURL);
        } else {
          this._initWithGeojson(error, data, customError, aURL);
        }
      }
    })
  }

  /**
   * Purely functional reason for refactoring this.
   * The function is used:
   * 1. when state is first loaded and we have a
   * geographyURL
   * 2. when state is set having received geojson
   * data from url_returned from <InputData />
   * component. In the case of latter slightly
   * abnormal way of using it but keeps flow
   * consistent.
   *
   * @param {*} geoErr error from having tried a
   * geographyURL
   * @param {*} geojson returned from geographyURL attempt
   * @param {*} data data with or without geography (1) and (2)
   * @param {*} customError
   * @param {*} geographyURL
   */
  _updateStateAndLayers(geoErr,
    geojson, data, customError, geographyURL) {
    if (!geoErr) {
      this.setState({
        loading: false,
        geography: geojson,
        data: data,
        alert: customError || null
      }, () => {
        this._fitViewport(geojson);
        this._callGenerateLayer()
      });
    } else {
      this.setState({
        loading: false,
        alert: { content: 'Could not reach: ' + geographyURL }
      });
    }
  }

  /**
   * Helper function to simply set state with geojson `data` and
   * name the source with `fullURL`. The other params are error management.
   *
   * @param {*} error any error to avoid setting data param
   * @param {*} data geojson valid object to use throughout TGVE
   * @param {*} customError any custom error similar to `error` used by
   * `this.state.alert`
   * @param {*} fullURL here used as naming source of data and shown on header
   */
  _initWithGeojson(error, data, customError, fullURL) {
    if (!error) {
      this.setState({
        loading: false,
        data: data
      });
      this._fitViewport(data);
      this._callGenerateLayer({ customError: customError || null })
    } else {
      this.setState({
        loading: false,
        alert: { content: 'Could not reach: ' + fullURL }
      });
      //network error?
    }
  }

  _callGenerateLayer(values = {}) {
    const updateState = generateLayer(
      values, this.state, this._renderTooltip,
      this._callGenerateLayer
    )
    if(isObject(updateState)) {
      this.setState({ ...updateState })
      // TODO: send this to a factory
      const { multiVarSelect } = updateState;
      const { onStateChange } = this.props;
      typeof onStateChange === 'function'
        && onStateChange({select: jsonFromKeySetObject(multiVarSelect)})
    }
  }

  _fitViewport(newData, bboxLonLat) {
    this.setState({
      viewport: getViewPort(this.state, newData, bboxLonLat, this.map) })
  }

  /**
   * Currently the tooltip focuses on aggregated layer (grid).
   *
   * @param {Object} info passed from DeckGL layer.
   * @param {Object} event passed from DeckGL
   * @param {Boolean} click boolean to check if call is onClick
   */
  _renderTooltip(info, event, click) {
    const { x, y, object } = info;
    const hoveredObject = object;
    // return yes more verbose code
    // for efficiency
    if (!hoveredObject) {
      if (!click) {
        this.setState({ tooltip: null })
      } else {
        this.setState({ popup: null })
      }
      return;
    }
    const tooltip = <Tooltip
      popup={click === true}
      onCloseCallback={() => this.setState({ popup: null })}
      {...this.state.tooltipColumns}
      isMobile={isMobile()}
      topx={x} topy={y}
      selectedObject={hoveredObject} />
    if (!click) {
      this.setState({ tooltip })
    } else {
      this.setState({
        tooltip: null,
        popup: tooltip })
    }
  }

  _updateHistory(viewport) {
    const { subsetBoundsChange, lastViewPortChange } = this.state;
    const { onViewStateChange } = this.props;

    //if we do history.replace/push 100 times in less than 30 secs
    // browser will crash
    if (new Date() - lastViewPortChange > 1000) {
      updateHistory({
        ...viewport,
        ...{
          defaultURL: this.props.defaultURL,
          geographyURL: this.props.geographyURL,
          geographyColumn: this.props.geographyColumn
        }
      });
      this.setState({ lastViewPortChange: new Date() })
      // TODO: in future send this to factory of callbacks
      typeof onViewStateChange === 'function'
        && onViewStateChange({viewState: viewport})
    }

    if (subsetBoundsChange) {
      const bounds = this.map && this.map.getBounds()
      this.setState({loading: true})
      this._callGenerateLayer({
        filter: { what: 'boundsSubset', bounds }
      })
    }

  }

  render() {
    const { hideCharts, hideChartGenerator, dark, defaultURL,
      leftSidebarContent, hideSidebar } = this.props;
    const { tooltip, popup, viewport, initialViewState,
      loading, mapStyle, alert, data, filtered, bottomPanel,
      layerName, legend, coords } = this.state;
    const showLegend = legend
      && !new RegExp("grid|sgrid|text|heatmap|icon", "i").test(layerName)

    return (
      <div>
        <div className="loader" style={{
          zIndex: loading ? 999 : -1,
          visibility: typeof mapStyle === 'string' &&
            mapStyle.endsWith("No map-v9") ? 'hidden' : 'visible'
        }} />
        <MapGL
          preserveDrawingBuffer={true}
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
            ref={ref => this.deck = ref && ref.deck}
            viewState={viewport ? viewport : initialViewState}
            initialViewState={initialViewState}
            layers={this.state.layers}
            // see docs below, url split for readability
            // https://deck.gl/#/documentation/developer-guide/
            // adding-interactivity?
            // section=using-the-built-in-event-handling
            onClick={(o, e) => {
              if (!o.layer && coords) {
                this.setState({ coords: null })
                this._callGenerateLayer()
              }
              this._renderTooltip(o, e, true);
            }}
          >
          </DeckGL>
        </MapGL>
        {!hideSidebar && <DeckSidebarContainer
          key="decksidebar"
          /** data */
          unfilteredData={data && data.features}
          data={filtered}
          /** api */
          hideCharts={hideCharts}
          hideChartGenerator={hideChartGenerator}
          leftSidebarContent={leftSidebarContent}
          dark={dark}
          layerName={layerName}
          layerOptions={this.state.layerOptions}
          /** UI */
          subsetBoundsChange={this.state.subsetBoundsChange}
          // TODO: generalise datasetName
          datasetName={defaultURL}
          bottomPanel={bottomPanel}
          map={this.map} deck={this.deck}
          isMobile={isMobile()}
          alert={alert}
          // only during first load
          // DeckSidebar ignores this prop later
          multiVarSelect={this.state.multiVarSelect}
          /** callbacks */
          onlocationChange={(bboxLonLat) => {
            this._fitViewport(undefined, bboxLonLat)
          }}
          colourCallback={(colorName) => {
            this._callGenerateLayer({ cn: colorName })
          }}
          urlCallback={this._urlCallback}
          column={this.state.column}
          onSelectCallback={(selected) =>
            this._callGenerateLayer({ filter: selected })}
          onLayerOptionsCallback={(layerOptions) =>
            this._callGenerateLayer({ layerOptions })}
          toggleSubsetBoundsChange={() => {
            this.setState({
              subsetBoundsChange: !this.state.subsetBoundsChange
            })
            this._callGenerateLayer()
          }}
        />}
        {
          showLegend &&
          <div
            id="tgve-legend"
            style={{
              ...theme(this.props.dark)
            }}
            className="right-side-panel mapbox-legend">
            {legend}
          </div>
        }
        {tooltip}
        {popup}
      </div>
    );
  }

  /**
   * Function takes input from FileInput componet.
   * It can take url, geojson or data & geojson
   * just like reading from URL APIs.
   *
   * @param {*} url_returned a URL to fetch data from
   * @param {*} geojson_returned ready to consume geojson when
   * no `geography_returned` is returned
   * @param {*} geography_returned if this is returned then
   * `geojson_returned` must be valid geojson.
   * @param {String} geoColumn the matching column name
   * for `geojson_returned` and `geography_returned` params
   */
  _urlCallback(params = {}) {
    const {geojson_returned,
      geography_returned, geoColumn, reset} = params;
    this.setState({
      /**
       * This set state can take care of all
       * but one of the options forward:
       * 1. if a geojson has been returned, then
       * update state fully and let
       * `this._fitViewport(geojson_returned)` &&
       * `generateLayer` take care of it.
       *
       * 2. if we are resetting, that means start from
       * fresh: this._initDataState
       *
       * 3. if (1) is the case but geojson
       * is invalid or corrupt, then do not
       * update state's `data` or `geography`
       * and fail on the try below.
       */
      column: null,
      tooltip: "",
      loading: true,
      coords: null,
      multiVarSelect: {},
      geography: null,
      reset
    }, () => {
      if (geojson_returned) {
        // confirm valid geojson
        try {
          // do not move this setState up
          // as data returned could be
          // corrupt
          this.setState({
            data: geojson_returned,
            geography: geography_returned || null,
            geographyColumn: geoColumn,
          }, () => {
            // go with geography first fallback onto data source.
            this._fitViewport(geography_returned || geojson_returned);
            this._callGenerateLayer()
          })
        } catch (error) {
          // load up default
          this.setState({alert: { content: error.message }})
          this._initDataState();
        }
      } else {
        // empty, so might be resetting
        // current geography and defaulturl
        this._initDataState()
      }
    })
  }

  _resize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };
}
