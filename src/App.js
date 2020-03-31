/**
 * geoplumber R package code.
 */
import React, {useState} from "react";
import Welcome from "./Welcome";
// import Header from "./components/Header";

import {Provider as StyletronProvider} from "styletron-react";
import {BaseProvider, LightTheme, DarkTheme} from "baseui";
import {Client as Styletron} from "styletron-engine-atomic";

import "regenerator-runtime/runtime.js";

import "./react-vis.css";

import "./App.css";

const engine = new Styletron();

/**
 * Separate the Header and the main content.
 * Up to this point we are still not using SSR
 */
function App() {
  const [dark, setDark] = useState(false);

  return (
    <main>
      <StyletronProvider value={engine}>
        <BaseProvider theme={dark ? DarkTheme : LightTheme}>
          <Welcome dark={dark} />
        </BaseProvider>
      </StyletronProvider>
    </main>
  );
}

export default App;
