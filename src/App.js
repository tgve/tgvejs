/**
 * geoplumber R package code.
 */
import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider as StyletronProvider } from 'styletron-react';
import { BaseProvider, LightTheme, DarkTheme } from 'baseui';
import { Client as Styletron } from 'styletron-engine-atomic';

import Welcome from './Welcome';
import Header from './components/Header';
import About from './About';
import DynamicImport from './components/DynamicImport';

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
function App() {
    const [dark, setDark] = useState(true)
    
    return (
      <BrowserRouter basename={process.env.PUBLIC_URL}>
      <main style={{
        background: dark ? '#242730' : 'white',
        margin: 'auto', color: dark ? '#a3a5a8' : 'black'
      }}>
        <Header dark={dark}
        toggleTheme={() => setDark(!dark)}/>
        <StyletronProvider value={engine}>
          <BaseProvider theme={dark ? DarkTheme : LightTheme}>
            <Switch>
              <Route exact path="/" component={(props) => <Welcome 
              {...props}
              dark={dark}
              />} />
              <Route exact path="/fui" component={(props) => <DUI 
              {...props}
              dark={dark}
              />} />
              <Route exact path="/about" component={About} />
            </Switch>
          </BaseProvider>
        </StyletronProvider>
      </main>
      </BrowserRouter>
    )
}

export default App;
