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
import {StatefulSelect, TYPE} from 'baseui/select';
import {XYPlot, VerticalBarSeries, XAxis, YAxis } from 'react-vis';

import {
  fetchData, suggestUIforNumber, humanize
} from '../utils';
import Variables from './Variables';
import Constants from '../Constants';
import File from './File';

const WIDTH = '400';
const BAR_HEIGHT = 320;
const engine = new Styletron();
const url = (process.env.NODE_ENV === 'development' ? Constants.DEV_URL : Constants.PRD_URL);

export default class DUI extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: [1],
      checked: false
    }
    this._fetchAndUpdateState = this._fetchAndUpdateState.bind(this);
    this._generateUI = this._generateUI.bind(this);
    this._generateBarChart = this._generateBarChart.bind(this);
  }

  _generateUI(key, sublist) {
    if (!key || !sublist || sublist.length === 0) return null;
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
        <StatefulSelect
          options={sublist.map(each => ({id: each}))}
          labelKey="id"
          valueKey="color"
          placeholder={"Choose " + humanize(key)}
          maxDropdownHeight="300px"
          type={TYPE.search}
          onChange={event => console.log(event)}
        />
      )
    }
  }

  _generateBarChart(key, sublist) {
    const { data } = this.state;
    if(!key || !sublist) return;
    let bars = sublist;
    if(sublist.length > 10) {
      bars = bars.slice(0,10)
    }
    console.log(bars, data.length);
    
    let sub_data = []; // match it with sublist
    data.forEach(feature => {
      Object.keys(feature.properties).forEach(each => {
        if(each === key) {
          const i = bars.indexOf(feature.properties[each]);
          console.log(i, feature.properties[each])
          if (sub_data[i] && 
            sub_data[i].x === feature.properties[each]) {
            sub_data[i].y += 1;
          } else {
            sub_data[i] = { x: feature.properties[each], y: 1 };
          }
        }
      })
    })
    console.log(sub_data);
    
    return(
      <XYPlot
        title={humanize(key)}
        xType="ordinal"
        width={WIDTH} height={BAR_HEIGHT}
        style={{
          background: 'white'
        }}>
        <YAxis
          tickPadding={10}
          tickLabelAngle={-45}
          tickFormat={v => v.toFixed(0)} />
        <XAxis
          tickLabelAngle={-45}
          tickFormat={v => v + ""}
          />
        <VerticalBarSeries
          // color={v => v === "Fatal" ? 1 : v === "Slight" ? 0 : null}
          data={sub_data} />
      </XYPlot>
    )
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
      <div className="content" style={{ margin: 'auto', maxWidth: '60%', padding: 20 }}>
        <StyletronProvider value={engine}>
          <BaseProvider theme={DarkTheme}>
            <File contentCallback={(text) => {
              const json = JSON.parse(text)            
              this.setState({data: json.features})
            }}/>
            {
              data && <h3>There are {` ${data.length} `} features in this geojson.</h3>
            }
            {
              data && data.length > 0 &&
              <Variables
                data={data}
                style={{color: 'lightgray'}}
                subStyle={{color: 'lightgray'}}
                propertyValuesCallback={({ key, sublist }) => 
                this.setState({ 
                  key, 
                  sublist: sublist.sort((a, b) => { return (a - b) })})} />
            }
            {
              key && sublist && 
              <>
                <hr />
                {this._generateBarChart(key, sublist)}
              </>
            }
            {
              key && sublist && 
              <>
                <hr />
                {this._generateUI(key, sublist)}
              </>
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
