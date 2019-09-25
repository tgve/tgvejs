import React from 'react';
import {
  Tabs, Tab, FormGroup, InputGroup,
  FormControl, Glyphicon, Checkbox
} from 'react-bootstrap';
import { format } from 'd3-format';
import { Button, KIND, SIZE } from 'baseui/button';

import './DeckSidebar.css';
import DataInput from '../DataInput';
import MapboxBaseLayers from '../MapboxBaseLayers';
import { xyObjectByProperty, percentDiv } from '../../utils';
import { XYPlot, LineSeries, XAxis, YAxis,
  VerticalBarSeries} from 'react-vis';
import Variables from '../Variables';
import RBAlert from '../RBAlert';
import { propertyCount, getPropertyValues } from '../../geojsonutils';
import Constants from '../../Constants';
import ColorPicker from '../ColourPicker';
import Modal from '../Table/Modal';
import { timeSlider, dropdown } from '../Showcases/Widgets';

const URL = (process.env.NODE_ENV === 'development' ? Constants.DEV_URL : Constants.PRD_URL);

export default class DeckSidebar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      radius: 100,
      elevation: 4,
      open: true,
      // must match the order in plumber.R
      all_road_types: ["All", "Dual carriageway",
        "Single carriageway", "Roundabout", "Unknown",
        "Slip road", "One way street"],
      year: "",
      reset: false,
      multiVarSelect: {}
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { data, alert } = this.props;
    const { elevation, radius, reset, open } = this.state;
    if (open !== nextState.open ||
      reset !== nextState.reset ||
      elevation !== nextState.elevation ||
      radius !== nextState.radius ||
      alert !== nextProps.alert) return true;
    //TODO:  a more functional way is needed        
    if (data && nextProps && nextProps.data &&
      data.length === nextProps.data.length) {
      return false
    }
    return true;
  }

  /**
   * Render the sidebar empty if no data is loaded.
   * Partly because we like to load from a URL.
   */
  render() {
    const { open, elevation,
      radius, all_road_types, year,
      subsetBoundsChange, multiVarSelect } = this.state;
    const { onChangeRadius, onChangeElevation,
      onSelectCallback, data, colourCallback, layerStyle,
      toggleSubsetBoundsChange, urlCallback, alert } = this.props;
    let plot_data = [];
    const notEmpty = data && data.length > 1;
    if (notEmpty) {
      Object.keys(data[1].properties).forEach(each => {
        if (each.match(/date|datetime|datestamp|timestamp/g) &&
          typeof (data[1].properties[each]) === 'string' &&
          data[1].properties[each].split("/")[2]) { //date in 09/01/2019 HARDCODE
          plot_data = xyObjectByProperty(data, "date")
        }
      })
    }    
    const severity_data = propertyCount(data, "accident_severity",
      ['Slight', 'Serious', 'Fatal'])
    // console.log(severity_data);

    const data_properties = getPropertyValues({ features: data });    
    const curr_road_types = notEmpty && 
    Array.from(data_properties["road_type"])

    const seriesProps = {
      data: notEmpty ? xyObjectByProperty(data, "road_type") : [],
      opacity: 1,
      stroke: 'rgb(72, 87, 104)',
      fill: 'rgb(18, 147, 154)',
    }

    // console.log(seriesProps);
    
    return (
      <div className="side-panel-container"
        style={{ marginLeft: !open ? '-320px' : '0px' }}>
        <div
          className="side-panel">
          <RBAlert alert={alert} />
          <div className="side-pane-header">
            <h2>{data && data.length ?
              (data.length === 1 ? data.length + " crash." : data.length + " rows.")
              : "Nothing to show"}
            </h2>
          </div>
          <div onClick={() => this.setState({ open: false })}>
            <DataInput
              onClose={() => this.setState({ open: true })}
              urlCallback={(url, geojson) => {
                this.setState({ open: true, reset: true })
                typeof (urlCallback) === 'function'
                  && urlCallback(url, geojson)
              }
              } />
            <Modal data={data} />
            {
              this.state.reset &&
              <Button
                kind={KIND.secondary} size={SIZE.compact}
                onClick={() => {
                  this.setState({ reset: false })
                  typeof (urlCallback) === 'function'
                    && urlCallback(URL + "/api/stats19")
                }}>Reset</Button>
            }
          </div>
          <div className="side-panel-body">
            <div className="side-panel-body-content">
              {/* range of two values slider is not native html */
                timeSlider(data, year, multiVarSelect, 
                  onSelectCallback, (changes) => this.setState(changes))
              }
              {
                //only if there is such a property
                dropdown(data, multiVarSelect, curr_road_types, all_road_types,
                  onSelectCallback, (changes) => this.setState(changes))
              }
              <br />
              {/* TODO: generate this declaritively too */}
              {
                severity_data && severity_data.map(each =>
                  percentDiv(each.x, 100 * each.y / data.length, () => {
                    multiVarSelect['accident_severity'] &&
                      multiVarSelect['accident_severity'].has(each.x) ?
                      delete multiVarSelect['accident_severity'] :
                      multiVarSelect['accident_severity'] = new Set([each.x]);
                    this.setState({ multiVarSelect })
                    onSelectCallback &&
                      onSelectCallback(Object.keys(multiVarSelect).length === 0 ?
                        { what: '' } : { what: 'multi', selected: multiVarSelect })
                  }))
              }
              <hr style={{ clear: 'both' }} />
              <Tabs defaultActiveKey={"1"} id="main-tabs">
                <Tab eventKey="1" title={
                  <i style={{ fontSize: '2rem' }}
                    className="fa fa-info" />
                }>
                  {
                    data && data.length > 0 &&
                    <Variables
                      multiVarSelect={multiVarSelect}
                      onSelectCallback={(mvs) => {
                        typeof (onSelectCallback) === 'function' &&
                          onSelectCallback(
                            Object.keys(mvs).length === 0 ?
                              { what: '' } : { what: 'multi', selected: mvs })
                        this.setState({ multiVarSelect: mvs })
                      }}
                      data={data} />
                  }
                  {plot_data && plot_data.length > 1 && <XYPlot
                    xType="ordinal"
                    animation={{ duration: 1 }}
                    height={250} width={250}>
                    <XAxis
                      position="right"
                      tickLabelAngle={-45}
                      style={{
                        text: { fill: '#fff', fontWeight: 400 }
                      }} />
                    <YAxis
                      tickLabelAngle={-45}
                      tickFormat={v => format(".2s")(v)}
                      style={{
                        title: { fill: '#fff' },
                        text: { fill: '#fff', fontWeight: 400 }
                      }}
                      position="start"
                      title="Crashes" />
                    <LineSeries
                      onSeriesMouseOver={(event) => {

                      }}
                      style={{ fill: 'none' }}
                      data={plot_data} />
                  </XYPlot>}
                  <XYPlot
                    xType="ordinal"
                    margin={{bottom:150}}
                    animation={{ duration: 1 }}
                    height={350} width={250}>
                    <YAxis
                      tickLabelAngle={-45}
                      tickFormat={v => format(".2s")(v)}
                      style={{
                        title: { fill: '#fff' },
                        text: { fill: '#fff' }
                      }}/>
                    <XAxis
                      position="right"
                      tickLabelAngle={-75}
                      style={{
                        text: { fill: '#fff'}
                      }} />
                  {<VerticalBarSeries 
                  onValueClick={(datapoint, event)=>{
                    // console.log(datapoint);
                    // {x: "Single carriageway", y: 2419}
                  }}
                  {...seriesProps} />}
                  </XYPlot>
                </Tab>
                <Tab eventKey="2" title={
                  <i style={{ fontSize: '2rem' }}
                    className="fa fa-sliders" />
                }>
                  {notEmpty &&
                    <div>
                      {
                        layerStyle === "grid" &&
                        <ColorPicker colourCallback={(color) =>
                          typeof colourCallback === 'function' &&
                          colourCallback(color)} />
                      }
                      <input
                        type="range"
                        id="radius"
                        min={50}
                        max={500}
                        step={50}
                        value={radius}
                        onChange={(e) => {
                          this.setState({
                            radius: e.target.value,
                          })
                          typeof (onChangeRadius) === 'function' &&
                            onChangeRadius(e.target.value)
                        }}
                      />
                      <h5>Radius: {radius}.</h5>
                      <input
                        type="range"
                        id="elevation"
                        min={2}
                        max={8}
                        step={2}
                        value={elevation}
                        onChange={(e) => {
                          this.setState({
                            elevation: e.target.value
                          })
                          typeof (onChangeElevation) === 'function' &&
                            onChangeElevation(e.target.value)
                        }}
                      />
                      <h5>Elevation: {elevation}.</h5>
                    </div>}
                  Map Styles
                                    <br />
                  <MapboxBaseLayers
                    onSelectCallback={(selected) =>
                      onSelectCallback &&
                      onSelectCallback({
                        selected: selected,
                        what: 'mapstyle'
                      })
                    }
                  />
                  <Checkbox
                    onChange={() => {
                      this.setState({ subsetBoundsChange: !subsetBoundsChange })
                      if (toggleSubsetBoundsChange && typeof (toggleSubsetBoundsChange) === 'function') {
                        toggleSubsetBoundsChange(!subsetBoundsChange) //starts with false
                      }
                    }}
                  >Subset by map boundary</Checkbox>
                </Tab>
                <Tab eventKey="3" title={
                  <i style={{ fontSize: '2rem' }}
                    className="fa fa-tasks" />
                }>
                  Tab 3
                </Tab>
              </Tabs>
            </div>
            <form className="search-form">
              <FormGroup>
                <InputGroup>
                  <FormControl placeholder="fly to..." type="text" />
                  <InputGroup.Addon>
                    <Glyphicon glyph="search" />
                  </InputGroup.Addon>
                </InputGroup>
              </FormGroup>
            </form>
          </div>
        </div>
        <div
          className="close-button"
          onClick={() =>
            this.setState({
              open: !open
            })}
          style={{ color: 'white' }}>
          <div style={{ backgroundColor: '#242730' }}>
            <i
              style={{ fontSize: '2rem', color: 'white !important' }}
              className={open ? "fa fa-arrow-circle-left" :
                "fa fa-arrow-circle-right"} />
          </div>
        </div>
      </div>
    )
  }
}


