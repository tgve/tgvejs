import React from 'react';

import { Button, KIND, SIZE } from 'baseui/button';

import './DeckSidebar.css';
import DataInput from '../input/DataInput';
import { firstLastNCharacters,
  getMainMessage, theme
} from '../../utils/utils';
import RBAlert from '../RBAlert';
import Modal from '../Modal';
import DataTable from '../Table';

import Export from '../export/Export';
import { headerComponent } from './utils';
import SidebarTabs from './Tabs';
import SearchForm from './Search';
const tgve = require('../../../package.json');

export default class DeckSidebar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      radius: 100,
      reset: false,
      barChartVariable: "",
      datasetName: props.datasetName
    }
  }

  /**
   * Render the sidebar empty if no data is loaded.
   * Partly because we like to load from a URL.
   */
  render() {
    const { datasetName } = this.state;
    const { data, unfilteredData, urlCallback, alert,
      layerName, dark, toggleOpen } = this.props;

    const notEmpty = data && data.length > 1;

    const resetState = (urlOrName, button) => {
      this.setState({
        reset: !button,
        datasetName: urlOrName || this.props.datasetName
      })
    }
    console.log("sidebar - render");
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
              toggleOpen={toggleOpen}
              urlCallback={(inputValues) => {
                const {geojson, name, geography,
                  geoColumn} = inputValues
                resetState(name);
                typeof (urlCallback) === 'function'
                  && urlCallback({
                    geojson_returned: geojson,
                    geography_returned: geography,
                    geoColumn,
                    reset: true
                  });
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
                    && urlCallback({reset: true});
                }}>Reset</Button>
            }
            {notEmpty &&
              <Modal
                toggleOpen={toggleOpen}
                component={<DataTable data={data} />} />}
            <Export data={data} notEmpty={notEmpty}
              map={this.props.map} deck={this.props.deck} />
          </div>
          <div className="side-panel-body">
            <div className="side-panel-body-content">
              <hr style={{ clear: 'both' }} />
              <SidebarTabs {...this.props} />
            </div>
            {/* TODO: find the right place for this */}
            {this.props.leftSidebarContent}
            {/* TODO: find the right place for above */}
            <div className="space"></div>
            {notEmpty && headerComponent("Vis: " + (layerName || "None"))}
            <SearchForm {...this.props} />
            <p>TGVE: {tgve.version}</p>
          </div>
        </div>
      </>
    )
  }
}
