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
  searchNominatom, firstLastNCharacters,
  humanize, getMainMessage
} from '../../utils';
import { VerticalBarSeries } from 'react-vis';
import Variables from '../Variables';
import RBAlert from '../RBAlert';
import { propertyCount } from '../../geojsonutils';
import { LAYERSTYLES } from '../../Constants';
import ColorPicker from '../ColourPicker';
import Modal from '../Modal';
import DataTable from '../Table';

import { yearSlider } from '../showcases/Widgets';
import {
  popPyramidPlot, plotByPropertyByDate,
  plotByProperty
} from '../showcases/plots';
import SeriesPlot from '../showcases/SeriesPlot';
import { isEmptyOrSpaces } from '../../JSUtils';
import MultiSelect from '../MultiSelect';
import AddVIS from '../AddVIS';
import Boxplot from '../boxplot/Boxplot';
import { Slider } from 'baseui/slider';

export default class DeckSidebar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      radius: 100,
      elevation: 4,
      year: "", // required to reset state
      reset: false,
      multiVarSelect: {},
      barChartVariable: "road_type",
      datasetName: props.datasetName
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { data, alert, loading, layerStyle, column } = this.props;
    const { elevation, radius, reset, year,
      barChartVariable } = this.state;
    // avoid rerender as directly operating on document.get* 
    // does not look neat. Keeping it React way.
    if (reset !== nextState.reset ||
      year !== nextState.year ||
      elevation !== nextState.elevation ||
      radius !== nextState.radius ||
      column !== nextProps.column ||
      alert !== nextProps.alert ||
      loading !== nextProps.loading ||
      layerStyle !== nextProps.layerStyle ||
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
    const { elevation, radius, year, subsetBoundsChange,
      multiVarSelect, barChartVariable, datasetName } = this.state;
    const { onChangeRadius, onChangeElevation,
      onSelectCallback, data, colourCallback, unfilteredData,
      toggleSubsetBoundsChange, urlCallback, alert, layerStyle,
      onlocationChange, column, dark, toggleOpen, toggleHexPlot } = this.props;

    const notEmpty = data && data.length > 1;

    // TODO: more comprehensive method needed
    // last reg is "" string which is undefined
    const withRadius = !layerStyle || 
    new RegExp("grid|sgrid|hex|scatter", "i").test(layerStyle);

    const severity_data = propertyCount(data, "accident_severity");
    let columnDomain = [];
    let columnData = notEmpty ?
      xyObjectByProperty(data, column || barChartVariable) : [];    

    const columnPlot = {
      data: columnData,
      opacity: 1,
      stroke: 'rgb(72, 87, 104)',
      fill: 'rgb(18, 147, 154)',
    }

    const resetState = (urlOrName, button) => {
      this.setState({
        reset: !button,
        year: "",
        multiVarSelect: {},
        barChartVariable: "road_type",
        datasetName: urlOrName || datasetName
      })
    }

    return (
      <>
        <div
          style={{
            color: dark ? "white" : "black",
            background: dark ? "#242730" : "white"
          }}
          className="side-panel">
          <RBAlert alert={alert} />
          {this._headerComponent(dark,
            <><h2>{getMainMessage(data, unfilteredData)}</h2>
              {notEmpty &&
                <h6 className="truncate">
                  dataset: {firstLastNCharacters(datasetName, 15)}
                </h6>
            }</>)
          }
          <div>
            <DataInput
              toggleOpen={() => typeof toggleOpen === 'function' && toggleOpen()}
              urlCallback={(url, geojson, name) => {
                resetState(url || name);
                typeof (urlCallback) === 'function'
                  && urlCallback(url, geojson);
                typeof (toggleOpen) === 'function' && toggleOpen()
              }
              } />
            {notEmpty &&
              <Modal
                toggleOpen={() => typeof toggleOpen === 'function' && toggleOpen()}
                component={<DataTable data={data} />} />}
            {
              this.state.reset &&
              <Button
                kind={KIND.secondary} size={SIZE.compact}
                onClick={() => {
                  resetState(undefined, true);
                  // datasetName === defaultURL
                  typeof (urlCallback) === 'function'
                    && urlCallback(this.props.datasetName);
                  typeof (this.props.showLegend) === 'function' &&
                    this.props.showLegend(false);
                }}>Reset</Button>
            }
          </div>
          <div className="side-panel-body">
            <div className="side-panel-body-content">
              {/* range of two values slider is not native html */
                yearSlider({
                  data: unfilteredData, year, multiVarSelect,
                  // for callback we get { year: "",multiVarSelect }
                  onSelectCallback, callback: (changes) => this.setState(changes)
                })
              }
              <br />
              {/* TODO: generate this declaritively too */}
              {
                severity_data && severity_data.map(each =>
                  percentDiv(each.x, 100 * each.y / data.length, () => {
                    if (multiVarSelect && multiVarSelect['accident_severity'] &&
                      multiVarSelect['accident_severity'].has(each.x)) {
                      delete multiVarSelect['accident_severity'];
                    } else {
                      multiVarSelect['accident_severity'] = new Set([each.x]);
                      this.setState({ multiVarSelect })
                    }
                    onSelectCallback &&
                      onSelectCallback(Object.keys(multiVarSelect).length === 0 ?
                        { what: '' } : { what: 'multi', selected: multiVarSelect })
                  }, dark))
              }
              <hr style={{ clear: 'both' }} />
              {columnDomain.length > 1 &&
                <Boxplot data={columnDomain} />}

              <Tabs defaultActiveKey={"1"} id="main-tabs">
                <Tab eventKey="1" title={
                  <i style={{ fontSize: '2rem' }}
                    className="fa fa-info" />
                }>
                  {/* pick a column and vis type */}
                  <AddVIS data={data} dark={dark} plotStyle={{ width: 240, margin: 20 }} />
                  {/* distribution example */}
                  {plotByProperty(data, "age_of_casualty", dark, "lines")}
                  {plotByPropertyByDate(data, "sex_of_casualty", dark)}
                  {notEmpty &&
                    Object.keys(data[0].properties)
                      .filter(p => !isEmptyOrSpaces(p)).length > 0 &&
                    layerStyle !== "grid" &&
                    <>
                      <h6>Column for layer:</h6>
                      <MultiSelect
                        title="Choose Column"
                        single={true}
                        value={column && {id:humanize(column), value:column}}
                        values={
                          Object.keys(data[0].properties).map(e =>
                            ({ id: humanize(e), value: e }))
                        }
                        onSelectCallback={(selected) => {
                          // array of seingle {id: , value: } object
                          const newBarChartVar = (selected && selected[0]) ?
                            selected[0].value : barChartVariable;
                          this.setState({
                            barChartVariable: newBarChartVar
                          });
                          typeof onSelectCallback === 'function' &&
                            onSelectCallback({
                              what: 'column', selected: newBarChartVar
                            });
                        }}
                      />
                    </>
                  }
                  {<SeriesPlot
                    dark={dark}
                    data={columnPlot.data}
                    type={VerticalBarSeries}
                    onValueClick={(datapoint) => {
                      // convert back to string
                      multiVarSelect[column ||
                        barChartVariable] = new Set([datapoint.x + ""]);
                      this.setState({ multiVarSelect })
                      onSelectCallback &&
                        onSelectCallback({ what: 'multi', selected: multiVarSelect })
                    }}
                    onDragSelected={(datapoints) => {
                      multiVarSelect[column ||
                        barChartVariable] = new Set(datapoints.map(e => e + ""));
                      this.setState({ multiVarSelect })
                      onSelectCallback &&
                        onSelectCallback({ what: 'multi', selected: multiVarSelect })
                    }}
                    plotStyle={{ marginBottom: 100 }} noYAxis={true}

                  />}
                  {popPyramidPlot({ data, dark: dark })}
                </Tab>
                <Tab eventKey="2" title={
                  <i style={{ fontSize: '2rem' }}
                    className="fa fa-sliders" />
                }>
                  {notEmpty &&
                    <ColorPicker colourCallback={(color) =>
                      typeof colourCallback === 'function' &&
                      colourCallback(color)} />
                  }
                  {notEmpty && withRadius &&
                    <div>
                      <h5>Radius</h5>
                      <Slider
                        value={[radius]}
                        min={50}
                        max={1000}
                        step={50}
                        onChange={({ value }) => {
                          this.setState({ radius: value[0] });
                          typeof (onChangeRadius) === 'function' &&
                            onChangeRadius(value[0])
                        }}
                      />
                      <h5>Elevation</h5>
                      <Slider
                        value={[elevation]}
                        min={2}
                        max={8}
                        step={2}
                        onChange={({ value }) => {
                          this.setState({ elevation: value[0] });
                          typeof (onChangeElevation) === 'function' &&
                            onChangeRadius(value[0])
                        }}
                      />
                    </div>
                  }
                  {notEmpty &&
                    <>
                      <h6>Deck Layer:</h6>
                      <MultiSelect
                        title="Choose Layer"
                        single={true}
                        values={
                          // TODO:filter based on data
                          LAYERSTYLES.map(e =>
                            ({ id: humanize(e), value: e }))
                        }
                        onSelectCallback={(selected) => {
                          // array of seingle {id: , value: } object
                          const newBarChartVar = (selected && selected[0]) ?
                            selected[0].value : barChartVariable;
                          this.setState({
                            barChartVariable: newBarChartVar
                          });
                          typeof onSelectCallback === 'function' &&
                            onSelectCallback({
                              what: 'layerStyle', selected: newBarChartVar
                            });
                        }}
                      />
                    </>
                  }
                  Map Styles
                  <br />
                  <MapboxBaseLayers
                    dark={dark}
                    onSelectCallback={(selected) =>
                      onSelectCallback &&
                      onSelectCallback({
                        selected: selected,
                        what: 'mapstyle'
                      })
                    }
                  />
                  {notEmpty && withRadius &&
                    <Checkbox
                      onChange={() => toggleHexPlot && toggleHexPlot()}
                    >Hex Plot</Checkbox>
                  }
                  {notEmpty &&
                    <Checkbox
                      onChange={() => {
                        this.setState({ subsetBoundsChange: !subsetBoundsChange })
                        if (toggleSubsetBoundsChange && typeof (toggleSubsetBoundsChange) === 'function') {
                          toggleSubsetBoundsChange(!subsetBoundsChange) //starts with false
                        }
                      }}
                    >Subset by map boundary</Checkbox>
                  }
                </Tab>
                <Tab eventKey="3" title={
                  <i style={{ fontSize: '2rem' }}
                    className="fa fa-filter" >{
                      multiVarSelect && Object.keys(multiVarSelect).length ?
                        Object.keys(multiVarSelect).length : ""
                    }</i>
                }>
                  {
                    unfilteredData && unfilteredData.length > 0 &&
                    <Variables
                      dark={dark}
                      multiVarSelect={multiVarSelect}
                      onSelectCallback={(mvs) => {
                        typeof (onSelectCallback) === 'function' &&
                          onSelectCallback(
                            Object.keys(mvs).length === 0 ?
                              { what: '' } : { what: 'multi', selected: mvs })
                        this.setState({ multiVarSelect: mvs })
                      }}
                      unfilteredData={unfilteredData} />
                  }
                </Tab>
              </Tabs>
            </div>
            <div className="space"></div>
            {this._headerComponent(dark, "Vis: " + (layerStyle || "None"))}
            <form className="search-form" onSubmit={(e) => {
              e.preventDefault();
              searchNominatom(this.state.search, (json) => {
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
                    style={{
                      background: dark ? '#242730' : 'white',
                      color: dark ? 'white' : 'black'
                    }}
                    onChange={(e) => this.setState({ search: e.target.value })}
                    placeholder="fly to..." type="text" />
                  <InputGroup.Addon
                    style={{
                      background: dark ? '#242730' : 'white',
                      color: dark ? 'white' : 'black'
                    }}>
                    <Glyphicon glyph="search" />
                  </InputGroup.Addon>
                </InputGroup>
              </FormGroup>
            </form>
          </div>
        </div>
      </>
    )
  }

  _headerComponent(dark, content) {
    return(
    <div
      style={{
        background: dark ? '#29323C' : '#eee'
      }}
      className="side-pane-header">
        {content}
    </div>)
  }
}

