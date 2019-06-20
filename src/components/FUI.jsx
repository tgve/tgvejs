import React from 'react';
import { Client as Styletron } from 'styletron-engine-atomic';
import { Provider as StyletronProvider } from 'styletron-react';
import { BaseProvider, DarkTheme } from 'baseui';
import { Slider } from 'baseui/slider';
import { Checkbox } from 'baseui/checkbox';
import { Button } from 'baseui/button';
import { StatefulButtonGroup } from 'baseui/button-group';

import {
  fetchData
} from '../utils';
import Variables from './Variables';
import Constants from '../Constants';

const engine = new Styletron();
const url = (process.env.NODE_ENV === 'development' ? Constants.DEV_URL : Constants.PRD_URL);

export default class FUI extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: [50],
      checked: false
    }
    this._fetchAndUpdateState = this._fetchAndUpdateState.bind(this)
  }

  _fetchAndUpdateState() {
    fetchData(url + "/api/stats19", (data, error) => {
      if (!error) {
        console.log(data.features);
        this.setState({
          loading: false,
          data: data.features,
        })
        this._recalculateLayers()
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
  render() {
    const { data } = this.state;
    return (
      <div className="content" style={{ maxWidth: '60%', padding: 20 }}>
        <StyletronProvider value={engine}>
          {
            data && data.length > 0 &&
            <Variables
              data={data}
              subStyle={{ background: 'darkblue', color: 'white' }}
              style={{ background: 'lightblue' }} />
          }
          <BaseProvider theme={DarkTheme}>
            Slider
          <Slider
              value={this.state.value}
              min={-300}
              max={300}
              step={50}
              onChange={({ value }) => this.setState({ value })}
            />
            Checkbox
            <Checkbox checked={this.state.checked} onChange={() =>
              this.setState({ checked: !this.state.checked })}>
              click me
            </Checkbox>
            <br />
            Checkbox Mode StatefulButtonGroup
            <StatefulButtonGroup mode="checkbox"
              initialState={{ selected: [0] }}
            >
              <Button
                value="foo"
                onClick={(e) => console.log(e.target.value)}>Slight</Button>
              <Button value="">Serious</Button>
              <Button>Killed</Button>
            </StatefulButtonGroup>
          </BaseProvider>
        </StyletronProvider>
      </div>
    );
  }
}
