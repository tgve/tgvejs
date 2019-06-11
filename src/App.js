/**
 * geoplumber R package code.
 */
import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import Welcome from './Welcome';
import Header from './components/Header';
import Deck from './components/Deck';
import Scenarios from './components/Scenarios';
import About from './About';
import RailShowcase from './components/RailShowcase';

import './App.css';


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
          <Route exact path="/rail" component={RailShowcase} />
          <Route exact path="/deck" component={Deck} />
          <Route exacg path="/scenarios" component={Scenarios} />
          <Route exact path="/about" component={About} />
        </Switch>
      </main>
    )
  }
}

export default App;
