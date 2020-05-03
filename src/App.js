/**
 * geoplumber R package code.
 */
import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider as StyletronProvider } from 'styletron-react';
import { BaseProvider, DarkTheme } from 'baseui';
import { Client as Styletron } from 'styletron-engine-atomic';

import Welcome from './Welcome';
import Header from './components/Header';
import About from './About';
import DynamicImport from './components/DynamicImport';

import '../node_modules/react-vis/dist/style.css';

import './App.css';

const engine = new Styletron();

/**
 * Code splitting.
 * @param {*} props 
 */
const DUI = (props) => (
  <DynamicImport load={() => import('./components/DUI')}>
    {
      (Component) => Component === null
        ? <div className="loader" style={{ zIndex: 999 }} />
        : <Component {...props} />
    }
  </DynamicImport>
)

/**
 * Separate the Header and the main content.
 * Up to this point we are still not using SSR
 */
class App extends Component {
  render() {
    return (
      <BrowserRouter>
      <main>
        <Header />
        <StyletronProvider value={engine}>
          <BaseProvider theme={DarkTheme}>
            <Switch>
              <Route exact path="/" component={Welcome} />
              <Route exact path="/fui" component={DUI} />
              <Route exact path="/about" component={About} />
            </Switch>
          </BaseProvider>
        </StyletronProvider>
      </main>
      </BrowserRouter>
    )
  }
}

export default App;
