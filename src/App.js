/**
 * geoplumber R package code.
 */
import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import Welcome from './Welcome';
import Header from './components/Header';
import About from './About';
import DynamicImport from './components/DynamicImport';

import './App.css';

/**
 * Code splitting.
 * @param {*} props 
 */
const FUI = (props) => (
  <DynamicImport load={() => import('./components/FUI')}>
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
      <main>
        <Header />
        <Switch>
          <Route exact path="/" component={Welcome} />
          <Route exact path="/fui" component={FUI} />
          <Route exact path="/about" component={About} />
        </Switch>
      </main>
    )
  }
}

export default App;
