import React from 'react';
import {
  Tabs, Tab, FormGroup, InputGroup,
  FormControl, Glyphicon, Checkbox
} from 'react-bootstrap';
import { Button, KIND, SIZE } from 'baseui/button';

import './DeckSidebar.css';
import DataInput from '../DataInput';
import MapboxBaseLayers from '../MapboxBaseLayers';
import {
  xyObjectByProperty, percentDiv,
  searchNominatom,
  humanize
} from '../../utils';
import { LineSeries, VerticalBarSeries } from 'react-vis';
import Variables from '../Variables';
import RBAlert from '../RBAlert';
import { propertyCount } from '../../geojsonutils';
import Constants from '../../Constants';
import ColorPicker from '../ColourPicker';
import Modal from '../Table/Modal';
import { timeSlider } from '../Showcases/Widgets';
import { seriesPlot } from '../Showcases/Plots';
import { isEmptyOrSpaces } from '../../JSUtils';
import HexPlot from './HexPlot';
import MultiSelect from '../MultiSelect';
// import GenerateUI from '../UI';

const URL = (process.env.NODE_ENV === 'development' ? Constants.DEV_URL : Constants.PRD_URL);

export default class DeckSidebar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      radius: 100,
      elevation: 4,
      open: !props.isMobile,
      // must match the order in plumber.R
      all_road_types: ["Dual carriageway",
        "Single carriageway", "Roundabout", "Unknown",
        "Slip road", "One way street"],
      year: "",
      reset: false,
      multiVarSelect: {},
      barChartVariable: "road_type"
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { data, alert, loading } = this.props;
    const { elevation, radius, reset, open,
      barChartVariable } = this.state;
    if (open !== nextState.open ||
      reset !== nextState.reset ||
      elevation !== nextState.elevation ||
      radius !== nextState.radius ||
      alert !== nextProps.alert ||
      loading !== nextProps.loading ||
      barChartVariable !== nextState.barChartVariable) return true;
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
      subsetBoundsChange, multiVarSelect, barChartVariable } = this.state;
    const { onChangeRadius, onChangeElevation, isMobile,
      onSelectCallback, data, colourCallback, layerStyle,
      toggleSubsetBoundsChange, urlCallback, alert,
      onlocationChange, column } = this.props;
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

    // const data_properties = getPropertyValues({ features: data });
    // const curr_road_types = notEmpty && data_properties['road_type'] &&
    //   Array.from(data_properties['road_type'])

    const columnPlot = {
      data: notEmpty ? xyObjectByProperty(data, column || barChartVariable) : [],
      opacity: 1,
      stroke: 'rgb(72, 87, 104)',
      fill: 'rgb(18, 147, 154)',
    }

    return (
      <div className="side-panel-container"
        style={{ marginLeft: !open ? '-320px' : '0px' }}>
        <div
          className="side-panel">
          <RBAlert alert={alert} />
          <div className="side-pane-header">
            <h2>{data && data.length ?
              data.length + " row" + (data.length > 1 ? "s" : "") + "."
              : "Nothing to show"}
            </h2>
          </div>
          <div>
            <DataInput
              toggleOpen={() => this.setState({ open: !open })}
              urlCallback={(url, geojson) => {
                this.setState({ open: true, reset: true })
                typeof (urlCallback) === 'function'
                  && urlCallback(url, geojson)
              }
              } />
            <Modal
              toggleOpen={() => this.setState({ open: !open })}
              data={data} />
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
                data && data.length > 1 && data[0].properties['road_type'] &&
                <MultiSelect
                  title={humanize('road_type')}
                  filter='road_type' // showcase/hardcode section
                  multiVarSelect={multiVarSelect}
                  // showcase/hardcode section all_road_types
                  values={all_road_types.map(e => ({ id: e, value: e }))}
                  onSelectCallback={(filter) => {
                    onSelectCallback && onSelectCallback(filter);
                    this.setState({
                      multiVarSelect: filter.selected
                    })
                  }}
                  // sync state
                  value={multiVarSelect && multiVarSelect['road_type'] &&
                    Array.from(multiVarSelect['road_type'])
                      .map(e => ({ id: e, value: e }))}
                />
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
              <HexPlot open={open} isMobile={isMobile}
                notEmpty={notEmpty} data={data} />
              <Tabs defaultActiveKey={"1"} id="main-tabs">
                <Tab eventKey="1" title={
                  <i style={{ fontSize: '2rem' }}
                    className="fa fa-info" />
                }>
                  {seriesPlot({
                    data: plot_data, type: LineSeries,
                    title: "Crashes"
                  })}
                  {/* pick a column */}
                  {
                    notEmpty &&
                    Object.keys(data[0].properties)
                      .filter(p => !isEmptyOrSpaces(p)).length > 0 &&
                    <MultiSelect 
                      title="Choose Column"
                      single={true}
                      values={
                        Object.keys(data[0].properties).map(e => 
                          ({id:humanize(e), value:e}))
                      }
                      onSelectCallback={(selected) => {
                        // array of seingle {id: , value: } object
                        this.setState({
                          barChartVariable: selected[0].value
                        });
                        typeof onSelectCallback === 'function' &&
                          onSelectCallback({ 
                            what: 'column', selected: selected[0].value 
                          });
                      }}
                      />
                  }
                  {seriesPlot({
                    data: columnPlot.data,
                    type: VerticalBarSeries,
                    onValueClick: (datapoint) => {
                      console.log(datapoint);
                      
                      multiVarSelect[column] = new Set([datapoint.x]);
                      console.log(datapoint);
                      this.setState({ multiVarSelect })
                      onSelectCallback &&
                        onSelectCallback({ what: 'multi', selected: multiVarSelect })
                      // {x: "Single carriageway", y: 2419}
                    }, margin: 100
                  })}
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
                {/* <Tab eventKey="3" title={
                  <i style={{ fontSize: '2rem' }}
                    className="fa fa-tasks" />
                }>
                  Tab 3
                </Tab> */}
                <Tab eventKey="3" title={
                  <i style={{ fontSize: '2rem' }}
                    className="fa fa-filter" />
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
                </Tab>
              </Tabs>
            </div>
            <div className="space"></div>
            <form className="search-form" onSubmit={(e) => {
              e.preventDefault();
              // console.log(this.state.search);
              searchNominatom(this.state.search, (json) => {
                // console.log(json && json.length > 0 && json[0].boundingbox);
                let bbox = json && json.length > 0 && json[0].boundingbox;
                bbox = bbox && bbox.map(num => +(num))
                typeof onlocationChange === 'function' && bbox &&
                  onlocationChange({
                    bbox: bbox,
                    lon: +(json[0].lon), lat: +(json[0].lat)
                  })
              })
            }}>
              <FormGroup>
                <InputGroup>
                  <FormControl
                    onChange={(e) => this.setState({ search: e.target.value })}
                    placeholder="fly to..." type="text" />
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

