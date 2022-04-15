import React from 'react';

import { Button, KIND, SIZE } from 'baseui/button';
import { Input } from 'baseui/input';
import { FormControl } from 'baseui/form-control';
import { Checkbox, StatefulCheckbox } from 'baseui/checkbox';
import { StatefulTabs, Tab, StyledTabPanel } from "baseui/tabs-motion";

import './DeckSidebar.css';
import DataInput from '../DataInput';
import MapboxBaseLayers from '../MapboxBaseLayers';
import {
  searchNominatom, firstLastNCharacters,
  humanize, getMainMessage, theme
} from '../../utils/utils';
import Variables from '../Variables';
import RBAlert from '../RBAlert';
import ColorPicker from '../ColourPicker';
import Modal from '../Modal';
import DataTable from '../Table';

import { isEmptyOrSpaces } from '../../utils/JSUtils';
import MultiSelect from '../MultiSelect';
import AddVIS from '../AddVIS';
import LayerSettings from '../settings/LayerSettings';
import { LAYERS } from '../settings/settingsUtils'
import Export from '../export/Export';
import Charts from './Charts';
import { headerComponent } from './utils';

export default class DeckSidebar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      radius: 100,
      year: "", // required to reset state
      reset: false,
      multiVarSelect: props.multiVarSelect || {},
      barChartVariable: "road_type",
      datasetName: props.datasetName
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { data, alert, layerName, column,
      subsetBoundsChange, hideChartGenerator,
      hideCharts } = this.props;
    const { reset, year, barChartVariable } = this.state;
    // avoid rerender as directly operating on document.get*
    // does not look neat. Keeping it React way.
    if (reset !== nextState.reset
      || year !== nextState.year
      || alert !== nextProps.alert
      || subsetBoundsChange !== nextProps.subsetBoundsChange
      || barChartVariable !== nextState.barChartVariable
      // API change
      || column !== nextProps.column
      || layerName !== nextProps.layerName
      || hideChartGenerator !== nextProps.hideChartGenerator
      || hideCharts !== nextProps.hideCharts ) {
      return true
    };
    //TODO: a bit better now but more is needed.
    // this solves a lag in large datasets
    // a more functional way is needed
    // e.g JSON.stringify like in Welcome.js etc
    // consider change in unfilteredData too
    if (!data && !nextProps.data) return false
    const r = Math.floor(Math.random() * data.length)
    if (JSON.stringify(data[r]) === JSON.stringify(nextProps.data[r])) {
      return false
    }
    return true;
  }

  /**
   * Render the sidebar empty if no data is loaded.
   * Partly because we like to load from a URL.
   */
  render() {
    const { multiVarSelect,
      barChartVariable, datasetName } = this.state;
    const { onLayerOptionsCallback,
      onSelectCallback, data, colourCallback, unfilteredData,
      toggleSubsetBoundsChange, urlCallback, alert, layerName,
      onlocationChange, column, dark, toggleOpen, toggleHexPlot,
      hideChartGenerator, hideCharts
    } = this.props;

    const notEmpty = data && data.length > 1;

    // TODO: more comprehensive method needed
    // last reg is "" string which is undefined
    const withRadius = !layerName ||
      new RegExp("grid|sgrid|hex|scatter", "i").test(layerName);

    const columnNames = notEmpty && Object.keys(data[0].properties)
      .filter(p => !isEmptyOrSpaces(p));

    const resetState = (urlOrName, button) => {
      this.setState({
        reset: !button,
        year: "",
        multiVarSelect: {},
        barChartVariable: "road_type",
        datasetName: urlOrName || this.props.datasetName
      })
    }

    const TabOverrides = {
      TabPanel: {
        component: function TabPanelOverride(props) {
          return <StyledTabPanel {...props} $pad={false} />;
        }
      }
    };

    return (
      <>
        <div
          style={{
            ...theme(dark)
          }}
          className="side-panel">
          <RBAlert alert={alert} />
          {headerComponent(
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
              }} />
            {
              this.state.reset &&
              // can check alert content to see if
              // recent DataInput just failed
              // TODO: further genrealise this in
              // constants or from parent
              (!alert || !alert.content.includes("Could not reach:")) &&
              <Button
                kind={KIND.secondary} size={SIZE.compact}
                onClick={() => {
                  resetState(undefined, true);
                  typeof (urlCallback) === 'function'
                    && urlCallback();
                  typeof (this.props.showLegend) === 'function' &&
                    this.props.showLegend(false);
                }}>Reset</Button>
            }
            {notEmpty &&
              <Modal
                toggleOpen={() => typeof toggleOpen === 'function' && toggleOpen()}
                component={<DataTable data={data} />} />}
            <Export data={data} notEmpty={notEmpty}
              map={this.props.map} deck={this.props.deck} />
          </div>
          <div className="side-panel-body">
            <div className="side-panel-body-content">
              <hr style={{ clear: 'both' }} />
              <StatefulTabs initialState={{ activeKey: "0" }} id="main-tabs">
                <Tab title={
                  <i style={{ fontSize: '2rem' }}
                    className="fa fa-info" />
                } overrides={TabOverrides}>
                  {!hideChartGenerator &&
                    <AddVIS data={data} dark={dark} plotStyle={{ width: 270, margin: 10 }} />
                  }
                  {notEmpty && columnNames.length > 0 &&
                    layerName !== "grid" &&
                    <>
                      <h6>Column for layer:</h6>
                      <MultiSelect
                        title="Choose Column"
                        single={true}
                        value={column && { id: humanize(column), value: column }}
                        values={
                          columnNames.map(e =>
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
                  {!hideCharts && <Charts {...this.props}/>}
                </Tab>
                <Tab title={
                  <i style={{ fontSize: '2rem' }}
                    className="fa fa-sliders" />
                } overrides={TabOverrides}>
                  {notEmpty &&
                    headerComponent(
                      <ColorPicker colourCallback={(color) =>
                        typeof colourCallback === 'function' &&
                        colourCallback(color)} />
                    )
                  }
                  {notEmpty &&
                    <>
                      <h6>Deck Layer:</h6>
                      <MultiSelect
                        title="Choose Layer"
                        single={true}
                        values={
                          // TODO:filter based on data
                          LAYERS.map(e =>
                            ({ id: humanize(e), value: e }))
                        }
                        onSelectCallback={(selected) => {
                          // array of seingle {id: , value: } object
                          if (selected && selected[0]) {
                            const ls = selected[0].value;
                            this.setState({ layerName: ls });
                            typeof onSelectCallback === 'function' &&
                              onSelectCallback({
                                what: 'layerName', selected: ls
                              });
                          }
                        }}
                      />
                      <LayerSettings
                        layerName={layerName}
                        columnNames={columnNames}
                        onLayerOptionsCallback={(layerOptions) => {
                          typeof (onLayerOptionsCallback) === 'function' &&
                            onLayerOptionsCallback({ ...layerOptions })
                        }} />
                    </>
                  }
                  {
                    headerComponent(
                      <>
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
                      </>)
                  }
                  {notEmpty && withRadius &&
                    <StatefulCheckbox
                      onChange={() => toggleHexPlot && toggleHexPlot()}
                    >Hex Plot</StatefulCheckbox>
                  }
                  {notEmpty &&
                    <Checkbox
                      checked={this.props.subsetBoundsChange}
                      onChange={() =>
                        typeof (toggleSubsetBoundsChange) === 'function'
                        && toggleSubsetBoundsChange()
                      }
                    >Subset by map boundary</Checkbox>
                  }
                </Tab>
                {unfilteredData && unfilteredData.length > 0 &&
                  <Tab title={
                    <i style={{ fontSize: '2rem' }}
                      className="fa fa-filter" >{
                        multiVarSelect && Object.keys(multiVarSelect).length ?
                          Object.keys(multiVarSelect).length : ""
                      }</i>
                  } overrides={TabOverrides}>
                    {
                      headerComponent(
                        <Variables
                          multiVarSelect={multiVarSelect}
                          onSelectCallback={(mvs) => {
                            typeof (onSelectCallback) === 'function' &&
                              onSelectCallback(
                                Object.keys(mvs).length === 0 ?
                                  { what: '' } : { what: 'multi', selected: mvs })
                            this.setState({ multiVarSelect: mvs })
                          }}
                          unfilteredData={unfilteredData} />
                      )
                    }
                  </Tab>}
              </StatefulTabs>
            </div>
            {/* TODO: find the right place for this */}
            {this.props.leftSidebarContent}
            {/* TODO: find the right place for above */}
            <div className="space"></div>
            {notEmpty && headerComponent("Vis: " + (layerName || "None"))}
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
              <FormControl >
                <Input
                  id="search-nominatum"
                  placeholder="fly to ..."
                  value={this.state.search}
                  onChange={({ target: { value } }) => this.setState({ search: value })}
                  endEnhancer="🌐"
                />
              </FormControl>
            </form>
          </div>
        </div>
      </>
    )
  }
}
