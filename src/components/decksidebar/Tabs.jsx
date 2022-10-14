import React, { useState } from 'react';
import { Checkbox, StatefulCheckbox } from 'baseui/checkbox';
import { StatefulTabs, Tab, StyledTabPanel } from "baseui/tabs-motion";
import MapboxBaseLayers from '../MapboxBaseLayers';

import LayerSettings from '../settings/LayerSettings';
import { isArray, isEmptyOrSpaces } from '../../utils/JSUtils';
import { LAYERS } from '../settings/settingsUtils';
import { humanize, iWithFaName } from '../../utils/utils';
import ColorPicker from '../ColourPicker';
import { headerComponent } from './utils';
import MultiSelect from '../MultiSelect';
import Variables from '../Variables';
import Charts from './Charts';
import AddVIS from '../AddVIS';

function SidebarTabs(props) {
  const { onLayerOptionsCallback,
    onSelectCallback, data, colourCallback, unfilteredData,
    toggleSubsetBoundsChange, layerName, column, dark, toggleHexPlot,
    hideChartGenerator, hideCharts, multiVarSelect
  } = props;
  const [barChartVariable, setBarChartVar] = useState(column)

  // TODO: more comprehensive method needed
  // last reg is "" string which is undefined
  const withRadius = !layerName ||
    new RegExp("grid|sgrid|hex|scatter", "i").test(layerName);

  const notEmpty = data && data.length > 1;

  const columnNames = notEmpty && Object.keys(data[0].properties)
    .filter(p => !isEmptyOrSpaces(p));

  const TabOverrides = {
    TabPanel: {
      component: function TabPanelOverride(props) {
        return <StyledTabPanel {...props} $pad={false} />;
      }
    }
  };
  return (
    <StatefulTabs initialState={{ activeKey: "0" }} id="main-tabs">
      <Tab title={iWithFaName(
        "fa fa-info", undefined,
        { fontSize: '2rem' }, "Explore")} overrides={TabOverrides}>
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
                setBarChartVar(newBarChartVar)
                typeof onSelectCallback === 'function' &&
                  onSelectCallback({
                    what: 'column', selected: newBarChartVar
                  });
              }}
            />
          </>
        }
        {!hideCharts && <Charts {...props} />}
      </Tab>
      <Tab title={iWithFaName(
        "fa fa-sliders", undefined,
        { fontSize: '2rem' }, "Settings")}
        overrides={TabOverrides}>
        {notEmpty &&
          headerComponent(
            <ColorPicker id="color-picker" colourCallback={(color) =>
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
              layerOptions={props.layerOptions}
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
            checked={props.subsetBoundsChange}
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
                }}
                unfilteredData={unfilteredData} />
            )
          }
        </Tab>}
    </StatefulTabs>
  )
}

const areEqual = (prevProps, nextProps) => {
  const { data, layerName, column, subsetBoundsChange,
    hideCharts } = prevProps;
  // this step bails out rendering as UI must
  // update though data has not changed
  // TODO: move data check only to Components
  // doing heavy processing.
  if (
    //ui
    subsetBoundsChange !== nextProps.subsetBoundsChange
    // API change
    || column !== nextProps.column
    || layerName !== nextProps.layerName
    || hideCharts !== nextProps.hideCharts ) {
    return false
  };
  //TODO:
  // a more functional way is needed
  // e.g JSON.stringify like in Welcome.js etc
  // consider change in unfilteredData too
  if (isArray(data) && isArray(nextProps.data)) {
    const r = (isArray(data) && Math.floor(Math.random() * data.length)) || 0
    if (JSON.stringify(data[r]) === JSON.stringify(nextProps.data[r])) {
      return true
    }
  }
  return false
}
export default React.memo(SidebarTabs, areEqual)
