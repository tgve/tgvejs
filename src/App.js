/**
 * Alan Turing Geovisualization Engine (eAtlas)
 * 
 */
import React, { Component } from 'react';
import { Provider as StyletronProvider } from 'styletron-react';
import { BaseProvider, DarkTheme, LightTheme } from 'baseui';
import { Client as Styletron } from 'styletron-engine-atomic';

import Welcome from './Welcome';

import './App.css';

const engine = new Styletron();

class App extends Component {
  render() {
    const { defaultURL, tooltipColumns, geographyURL,
      geographyColumn, column, data, layerName, dark,
      leftSidebarContent, viewport
    } = this.props;
    const isDark = dark || process.env.REACT_APP_DARK || true;
    return (
      <main>
        <StyletronProvider value={engine}>
          <BaseProvider theme={isDark ? DarkTheme : LightTheme}>
            <Welcome
              dark={isDark}
              // TODO get these from a settings-json file/object
              // as well as envs
              defaultURL={defaultURL || process.env.REACT_APP_DEFAULT_URL}
              tooltipColumns={
                tooltipColumns || process.env.REACT_APP_TOOLTIP_COLUMNS
                || { column1: "accident_severity", column2: "date" }}
              geographyURL={geographyURL || process.env.REACT_APP_GEOGRAPHY_URL}
              geographyColumn={geographyColumn || process.env.REACT_APP_GEOGRAPHY_COLUMN_NAME}
              column={column || process.env.REACT_APP_COLUMN_NAME}
              layerStyle={layerName || process.env.REACT_APP_LAYER_NAME}
              // doubt they can be injected from envs
              data={data}
              leftSidebarContent={leftSidebarContent}
              viewport={viewport}
              />
          </BaseProvider>
        </StyletronProvider>
      </main>
    )
  }
}

export default App;
