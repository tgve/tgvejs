/**
 * Turing Geovisualization Engine (TGVE)
 *
 */
import React from 'react';
import { Provider as StyletronProvider } from 'styletron-react';
import { BaseProvider, DarkTheme, LightTheme } from 'baseui';
import { Client as Styletron } from 'styletron-engine-atomic';

import Home from './home';

import './App.css';
import { hasAPIChanged, params } from './utils/api';

const engine = new Styletron();

function App(props) {
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

export default React.memo(App, (prevProps, nextProps) => {
  return !hasAPIChanged(prevProps, nextProps)
})
