import React from 'react';
import { Client as Styletron } from 'styletron-engine-atomic';
import { Provider as StyletronProvider } from 'styletron-react';
import { LightTheme, BaseProvider } from 'baseui';
import { Slider } from 'baseui/slider';
import { Checkbox } from 'baseui/checkbox';
import { Button } from 'baseui/button';
import { StatefulButtonGroup } from 'baseui/button-group';

const engine = new Styletron();

export default class FUI extends React.Component {
  constructor(props) {
    super(props)
    this.state = { value: [50], checked: false }
  }
  render() {
    return (
      <div className="content" style={{ maxWidth: '60%', padding: 20 }}>
        <StyletronProvider value={engine}>
          <BaseProvider theme={LightTheme}>
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
              <Button onChange={(value) => console.log(value)}>Slight</Button>
              <Button>Serious</Button>
              <Button>Killed</Button>
            </StatefulButtonGroup>
          </BaseProvider>
        </StyletronProvider>
      </ div >
    );
  }
}
