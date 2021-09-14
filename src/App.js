/**
 * Alan Turing Geovisualization Engine (eAtlas)
 * 
 */
import React, { Component } from 'react';
import { Provider as StyletronProvider } from 'styletron-react';
import { BaseProvider, DarkTheme } from 'baseui';
import { Client as Styletron } from 'styletron-engine-atomic';

import Welcome from './Welcome';

import './App.css';

const engine = new Styletron();

class App extends Component {
  render() {    
    const { defaultURL, tooltipColumns, geographyURL, 
      geographyColumn, column, data, layerName, dark,
      leftSidebarContent
    } = this.props;
    return (
      <main>
        <StyletronProvider value={engine}>
          <BaseProvider theme={DarkTheme}>
            <Welcome 
            dark={process.env.REACT_APP_DARK || dark || true}
            // TODO get these from a settings-json file/object
            // as well as envs
            defaultURL={process.env.REACT_APP_DEFAULT_URL || defaultURL}
            tooltipColumns= {process.env.REACT_APP_TOOLTIP_COLUMNS || 
              tooltipColumns || {column1: "accident_severity" , column2: "date"}}
            geographyURL={ process.env.REACT_APP_GEOGRAPHY_URL || geographyURL}
            geographyColumn={ process.env.REACT_APP_GEOGRAPHY_COLUMN_NAME || geographyColumn}
            column= {process.env.REACT_APP_COLUMN_NAME || column}
            layerStyle={ process.env.REACT_APP_LAYER_NAME || layerName}
            // doubt they can be injected from envs
            data={data}
            leftSidebarContent={leftSidebarContent}/>
          </BaseProvider>
        </StyletronProvider>
      </main>
    )
  }
}

export default App;
