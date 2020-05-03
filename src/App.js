/**
 * geoplumber R package code.
 */
import React, { Component } from 'react';
import { Provider as StyletronProvider } from 'styletron-react';
import { BaseProvider, DarkTheme } from 'baseui';
import { Client as Styletron } from 'styletron-engine-atomic';

import Welcome from './Welcome';
import Header from './components/Header';

import './App.css';

const engine = new Styletron();

/**
 * Separate the Header and the main content.
 * Up to this point we are still not using SSR
 */
class App extends Component {
  render() {
    return (
      <main>
        <Header />
        <StyletronProvider value={engine}>
          <BaseProvider theme={DarkTheme}>
            <Welcome data={this.props.data}/>
          </BaseProvider>
        </StyletronProvider>
      </main>
    )
  }
}

export default App;
