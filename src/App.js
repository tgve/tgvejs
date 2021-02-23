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
    return (
      <main>
        <StyletronProvider value={engine}>
          <BaseProvider theme={DarkTheme}>
            <Welcome 
            dark={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || false}
            //TODO or get it from a settings-json file/objeect
            defaultURL={process.env.REACT_APP_DEFAULT_URL || this.props.defaultURL} 
            data={this.props.data}/>
          </BaseProvider>
        </StyletronProvider>
      </main>
    )
  }
}

export default App;
