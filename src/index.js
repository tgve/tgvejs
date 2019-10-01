/**
 * geoplumber R package code.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
// brief about serviceworkers from CRA
// https://stackoverflow.com/a/49314454/11101153
import { unregister } from './registerServiceWorker';

// keep leaflet for now in case.

// *** Do NOT remove, it seems the location for icon is missing or something
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

/**
 * Separating index.js and App.js:
 * 1. doing above like launch configs here
 * 2. keep App.js clear for React application.
 */
ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>, document.getElementById('root'));

unregister();
