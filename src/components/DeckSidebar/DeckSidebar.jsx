import React from 'react';
import './DeckSidebar.css';
import {
  xyObjectByProperty, humanize, generateLegend, sortNumericArray
} from '../../utils';
import RBAlert from '../RBAlert';
import { propertyCount } from '../../geojsonutils';

import { crashes_plot_data } from '../Showcases/Plots';
import { isNumber } from '../../JSUtils';

import LetsBeatCovidAccordion from "../covid/LetsBeatCovidAccordion"

export default class DeckSidebar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      radius: 100,
      elevation: 4,
      year: "",
      reset: false,
      multiVarSelect: {},
      barChartVariable: "TotalCases",
      datasetName: props.datasetName
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { data, alert, loading, daily, tests } = this.props;
    const { elevation, radius, reset,
      barChartVariable } = this.state;
    // avoid rerender as directly
    if (reset !== nextState.reset ||
      elevation !== nextState.elevation ||
      radius !== nextState.radius ||
      alert !== nextProps.alert ||
      loading !== nextProps.loading ||
      barChartVariable !== nextState.barChartVariable ||
      daily !== nextProps.daily ||
      tests !== nextProps.tests) return true;
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
    const { elevation, radius, year,
      subsetBoundsChange, multiVarSelect, barChartVariable } = this.state;
    const { onChangeRadius, onChangeElevation,
      onSelectCallback, data, colourCallback, daily, tests,
      toggleSubsetBoundsChange, urlCallback, alert,
      onlocationChange, column, dark, toggleOpen, toggleHexPlot } = this.props;
    let plot_data = [];
    let plot_data_multi = [[], []];
    const notEmpty = data && data.length > 1;
    plot_data = crashes_plot_data(notEmpty, data, plot_data, plot_data_multi);
    const severity_data = propertyCount(data, "accident_severity");
    let columnDomain = [];
    const columnData = notEmpty ?
      xyObjectByProperty(data, column || barChartVariable) : [];
    const geomType = notEmpty && data[0].geometry.type.toLowerCase();
    // console.log(geomType);
    if (notEmpty && column && (geomType === 'polygon' ||
      geomType === 'multipolygon' || "linestring") &&
      isNumber(data[0].properties[column])) {
      // we dont need to use generateDomain(data, column)
      // columnData already has this in its x'es
      columnDomain = columnData.map(e => e.x);
      // we will just sort it        
      columnDomain = sortNumericArray(columnDomain);
      // console.log(columnDomain);

      this.props.showLegend(
        generateLegend(
          {
            domain: columnDomain,
            title: humanize(column)
          }
        )
      );
    }
    const resetState = (urlOrName) => {
      this.setState({
        reset: true,
        year: "",
        multiVarSelect: {},
        barChartVariable: "TotalCases",
        datasetName: urlOrName || this.state.datasetName
      })
    }
    let d = new Date();
    d = new Date(d - d.getMinutes() * 60000 - d.getSeconds() * 1000)
    return (
      <>
        <div
          style={{
            color: dark ? "white" : "black",
            background: dark ? "#242730" : "white"
          }}
          className="side-panel">
          <RBAlert alert={alert} />
          <img alt="Let's beat covid logo" src={ require("../../img/lets-beat-covid-logo.png")} style={{ width : "100%" }}/>
          {/* <div
            style={{
              background: dark ? '#29323C' : '#eee'
            }}
            className="side-pane-header">
            {
              (data && data.length && data[0].properties.TotalCases) ||
                this.state.TotalCases || daily ?
                <h2>
                  {(this.state.TotalCases ||
                    daily && daily[0] && daily[daily.length - 1].CumCases) + " cases"}
                </h2>
                :
                <h2>{data && data.length ?
                  data.length + " row" + (data.length > 1 ? "s" : "") + "."
                  : "Nothing to show"}
                </h2>
            }
            dataset: {this.props.datasetName}
          </div>
          <div>
            updated: {d.toLocaleString()}
            <br />
            <DataInput
              toggleOpen={() => typeof toggleOpen === 'function' && toggleOpen()}
              urlCallback={(url, geojson, name) => {
                resetState(url || name);
                typeof (urlCallback) === 'function'
                  && urlCallback(url, geojson);
                typeof (toggleOpen) === 'function' && toggleOpen()
              }
              } />
            <Modal
              toggleOpen={() => typeof toggleOpen === 'function' && toggleOpen()}
              component={<DataTable data={data} />} />
            {
              this.state.reset &&
              <Button
                kind={KIND.secondary} size={SIZE.compact}
                onClick={() => {
                  resetState();
                  typeof (urlCallback) === 'function'
                    && urlCallback(URL + "/api/covid19");
                  typeof (this.props.showLegend) === 'function' &&
                    this.props.showLegend(false);
                }}>Reset</Button>
            }
          </div> */}
          <div className="side-panel-body">
            <div className="side-panel-body-content">
              <LetsBeatCovidAccordion
                data={data}
                multiVarSelect={multiVarSelect}
                onSelectCallback={(fieldName, selected) => {

                  // this.setState({
                  //   barChartVariable: newBarChartVar
                  // });
                  typeof onSelectCallback === 'function' &&
                    onSelectCallback({
                      what: 'multi', selected: { [fieldName] : new Set([selected]) }
                    });
              }} />
              
              <div style={{padding : 20}}>
                Developed by MedShr, NHS doctors and Leeds University Institute of Data Analytics, using <a href="https://github.com/layik/eAtlas">eAtlas</a>
              </div>
              <div style={{padding : "0px 20px" }}>
                <img alt="MedShr Logo" src={require("../../img/medshr-logo.svg")} style={{margin : "0px 5px"}}/>
                <img alt="Health Education England Logo" src={require("../../img/health-education-england.png")} style={{margin : "0px 5px"}}/>
                <img alt="NHS Logo" src={require("../../img/NHS.png")} style={{margin : "0px 5px"}}/>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}

