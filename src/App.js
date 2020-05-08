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
            //TODO or get it from a settings-json file/objeect
            defaultURL={this.props.defaultURL} 
            data={this.props.data}/>
          </BaseProvider>
        </StyletronProvider>
      </main>
    )
  }
}

export default App;
