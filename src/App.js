/**
 * Alan Turing Geovisualization Engine (eAtlas)
 * 
 */
import React, { Component } from 'react';
import { Provider as StyletronProvider } from 'styletron-react';
import { BaseProvider, DarkTheme, LightTheme } from 'baseui';
import { Client as Styletron } from 'styletron-engine-atomic';

import Welcome from './Welcome';

import './App.css';
import { params } from './utils/api';

const engine = new Styletron();

export default function (props) {
  const apis = params(props)
  return (
    <main>
      <StyletronProvider value={engine}>
        <BaseProvider theme={apis.dark ? DarkTheme : LightTheme}>
          <Welcome
            {...apis}
          />
        </BaseProvider>
      </StyletronProvider>
    </main>
  )
};
