/**
 * WIP to see if it is possible to match data to appropriate UI.
 * 
 * Expert/novice users could decide to explore the data they want
 * they way they want. 
 * 
 * 1. Select your variable.
 * 2. Select the type of UI for the variable.
 * 3. Select the values you like to explore
 * 4. Select the visualization for those values.
 * 
 */
import React from 'react';
import { Client as Styletron } from 'styletron-engine-atomic';
import { Provider as StyletronProvider } from 'styletron-react';
import { BaseProvider, DarkTheme } from 'baseui';
import { Slider } from 'baseui/slider';
import { Checkbox } from 'baseui/checkbox';
import { Button } from 'baseui/button';
import { StatefulButtonGroup } from 'baseui/button-group';

import {
  fetchData, suggestUIforNumber
} from '../utils';
import Variables from './Variables';
import Constants from '../Constants';
import RBDropDown from './RBDropdownComponent';

const engine = new Styletron();
const url = (process.env.NODE_ENV === 'development' ? Constants.DEV_URL : Constants.PRD_URL);

export default class DUI extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: [50],
      checked: false
    }
    this._fetchAndUpdateState = this._fetchAndUpdateState.bind(this);
    this._generateUI = this._generateUI.bind(this);
  }

  _generateUI(key, sublist) {
    if (!key || !sublist || sublist.length === 0) return null;
    const { dropDownSelected } = this.state;
    const ui_name = suggestUIforNumber(sublist.length)
    if (ui_name === "checkbox") {
      return (
        <>
          {
            sublist.map(each =>
              // deal with each checked!
              <Checkbox checked={this.state.checked}
                onChange={() =>
                  this.setState({ checked: !this.state.checked })}>
                {key}
              </Checkbox>
            )
          }
        </>
      )
    } else if (ui_name === "slider" && parseInt(sublist[0])) {
      const s = sublist;
      s.sort((a, b) => { return (a - b) })
      return (
        <Slider
          value={this.state.value}
          min={parseInt(s[0])}
          max={parseInt(s[s.length - 1])}
          step={1} //something
          onChange={({ value }) => this.setState({ value })}
        />
      )
    } else if (ui_name === "buttongroups") {
      return (
        <>
          Checkbox Mode StatefulButtonGroup
          <StatefulButtonGroup mode="checkbox"
            initialState={{ selected: [0] }}
          >
            {
              sublist.map((each, i) =>
                <Button
                  key={each + "-" + i}
                  value={each}
                  onClick={(e) => console.log(e.target.value)}>
                  {each}
                </Button>
              )
            }
          </StatefulButtonGroup>
        </>
      )
    } else {
      return (
        <RBDropDown
          title={dropDownSelected || "Select one"}
          menuitems={sublist}
          onSelectCallback={(selected) => {
            this.setState({
              dropDownSelected: selected
            })
          }} />
      )
    }
  }

  _fetchAndUpdateState() {
    fetchData(url + "/api/stats19", (data, error) => {
      if (!error) {
        this.setState({
          loading: false,
          data: data.features,
        })
      } else {
        this.setState({
          loading: true,
        })
        //network error?
      }
    })
  }

  componentDidMount() {
    this._fetchAndUpdateState()
  }

  // componentDidUpdate(prevProps) {
  // this._fetchAndUpdateState()
  // }

  render() {
    const { data, key, sublist } = this.state;
    return (
      <div className="content" style={{ maxWidth: '60%', padding: 20 }}>
        <StyletronProvider value={engine}>
          {
            data && data.length > 0 &&
            <Variables
              data={data}
              subStyle={{ background: 'darkblue', color: 'white' }}
              style={{ background: 'lightblue' }}
              propertyValuesCallback={({ key, sublist }) => this.setState({ key, sublist })} />
          }
          <hr />
          <BaseProvider theme={DarkTheme}>
            {
              this._generateUI(key, sublist)
            }

            {/* {
              key && sublist && <div>
                <p>Key: {key}</p>
                {
                  sublist.map((each, i) => <p key={each + "-" + i}>{each}</p>)
                }
              </div>
            } */}
          </BaseProvider>
        </StyletronProvider>
      </div>
    );
  }
}
