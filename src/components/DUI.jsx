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
import { FlexibleXYPlot, VerticalBarSeries, XAxis, YAxis } from 'react-vis';

import {
  shortenName, propertyCount,
  fetchData, humanize
} from '../utils';
import Variables from './Variables';
import Constants from '../Constants';
import File from './File';
import GenerateUI from './UI';

const WIDTH = '400';
const BAR_HEIGHT = 320;
const url = (process.env.NODE_ENV === 'development' ? Constants.DEV_URL : Constants.PRD_URL);

export default class DUI extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      checked: false,
      loading: true
    }
    this._fetchAndUpdateState = this._fetchAndUpdateState.bind(this);
    this._generateBarChart = this._generateBarChart.bind(this);
  }

  _generateBarChart(key, sublist) {
    const { data } = this.state;
    if (!key || !sublist) return;
    let bars = sublist;
    if (sublist.length > 10) {
      bars = bars.slice(0, 10)
    }
    let sub_data = propertyCount(data, key, bars);
    return (
      <FlexibleXYPlot
        title={humanize(key)}
        xType="ordinal"
        width={WIDTH} height={BAR_HEIGHT}
        style={{
          padding: 10,
        }}>
        <YAxis
          style={{ text: { fill: '#fff' } }}
          tickPadding={10}
          tickLabelAngle={-45}
          tickFormat={v => v.toFixed(0)} />
        <XAxis
          style={{ text: { fill: '#fff' } }}
          tickLabelAngle={-45}
          tickFormat={v => v + ""}
        />
        <VerticalBarSeries
          // color={v => v === "Fatal" ? 1 : v === "Slight" ? 0 : null}
          data={sub_data} />
      </FlexibleXYPlot>
    )
  }

  _fetchAndUpdateState() {
    fetchData(url + "/api/stats19", (data, error) => {
      if (!error) {
        this.setState({
          loading: false,
          data: data.features,
          name: "/api/stats19"
        })
      } else {
        this.setState({
          loading: false,
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
    const { data, key, sublist, name, loading } = this.state;
    return (
      <div className="content" style={{
        margin: 'auto', maxWidth: '60%',
        padding: 20
      }}>

        <File contentCallback={({ text, name }) => {
          const json = JSON.parse(text)
          this.setState({
            name,
            data: json.features
          })
        }} />
        {loading && <div id="loading"></div>}
        {
          data && <h3 style={{ color: 'white' }}>
            There are {` ${data.length} `} features in this
                ({shortenName(name)}) resource.
              </h3>
        }
        {
          data && data.length > 0 &&
          <Variables
            data={data}
            style={{ color: 'lightgray' }}
            subStyle={{ color: 'lightgray' }}
            propertyValuesCallback={({ key, sublist }) =>
              this.setState({
                key,
                sublist: sublist.sort((a, b) => { return (a - b) })
              })} />
        }
        {
          key && sublist &&
          <center>
            <h5 style={{ color: 'white' }}>
              For ({key}) and its variables:
                </h5>
            <hr />
            {this._generateBarChart(key, sublist)}
          </center>
        }
        {
          key && sublist &&
          <>
            <hr />
            <GenerateUI title={key} sublist={sublist} />
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

      </div>
    );
  }
}
