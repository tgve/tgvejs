/**
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
    const { defaultURL, tooltipColumns, geographyURL, geographyColumn, 
      column, data
    } = this.props;
    return (
      <main>
        <StyletronProvider value={engine}>
          <BaseProvider theme={DarkTheme}>
            <Welcome 
            dark={true}
            //TODO or get it from a settings-json file/objeect
            defaultURL={process.env.REACT_APP_DEFAULT_URL || defaultURL}
            tooltipColumns= {process.env.REACT_APP_TOOLTIP_COLUMNS || 
              tooltipColumns || {column1: "accident_severity" , column2: "date"}}
            geographyURL={ process.env.REACT_APP_GEOGRAPHY_URL || geographyURL}
            geographyColumn={ process.env.REACT_APP_GEOGRAPHY_COLUMN_NAME || geographyColumn}
            column= {process.env.REACT_APP_COLUMN_NAME || column}
            data={data}/>
          </BaseProvider>
        </StyletronProvider>
      </main>
    )
  }
}

export default App;
