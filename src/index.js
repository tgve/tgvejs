/**
 * geoplumber R package code.
 */
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
// brief about serviceworkers from CRA
// https://stackoverflow.com/a/49314454/11101153
import { unregister } from './registerServiceWorker';

/**
 * Separating index.js and App.js:
 * 1. doing above like launch configs here
 * 2. keep App.js clear for React application.
 */
ReactDOM.render(<App />, document.getElementById('root'));

unregister();
