/**
 * Turing Geovisualization Engine (TGVE)
 *
 */
import React, { Component } from 'react';
import { Provider as StyletronProvider } from 'styletron-react';
import { BaseProvider, DarkTheme, LightTheme } from 'baseui';
import { Client as Styletron } from 'styletron-engine-atomic';

import Home from './home';

import './App.css';
import { params } from './utils/api';

const engine = new Styletron();

export default function (props) {
  const apis = params(props,
    props.location ?
      props.location.search : window.location.search)

  return (
    <main>
      <StyletronProvider value={engine}>
        <BaseProvider
          theme={apis.dark === false ? LightTheme : DarkTheme}>
          <Home
            {...apis}
          />
        </BaseProvider>
      </StyletronProvider>
    </main>
  )
};
