import React from 'react';

import { Slider } from 'baseui/slider';
import { Checkbox } from 'baseui/checkbox';
import { Button } from 'baseui/button';
import { StatefulButtonGroup } from 'baseui/button-group';
import { StatefulSelect, TYPE } from 'baseui/select';

import {
  suggestUIforNumber, humanize
} from '../utils';

export default class UI extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checks: [],
    }
  }

  render() {
    const {
      title, sublist, suggested, onChange, steps
    } = this.props;
    if (!title || !sublist || sublist.length === 0) return null;
    const new_checks = this.state.checks;
    const ui_name = suggested || suggestUIforNumber(sublist.length)
    let ui_returned = null;
    if (ui_name === "checkbox") {
      ui_returned = <>
        {
          sublist.map((each, i) =>
            // deal with each checked!
            <Checkbox
              key={each}
              checked={this.state.checks[i]}
              value={each}
              onChange={() => {
                new_checks[i] = !new_checks[i]
                this.setState({
                  checks: new_checks
                })
              }}>
              {each}
            </Checkbox>
          )
        }
      </>
    } else if (ui_name === "slider" && parseInt(sublist[0])) {
      const s = sublist;
      ui_returned =
        <>
          <Slider
            value={this.state.value || [s[0]]}
            min={parseInt(s[0])}
            max={parseInt(s[s.length - 1])}
            step={steps || 1} //something
            onChange={({ value }) => {
              this.setState({ value });
              typeof (onChange) === 'function' && onChange(value[0])
            }}
          />
          {title}
        </>
    } else if (ui_name === "buttongroups") {
      ui_returned = <>
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
    } else {
      ui_returned = <StatefulSelect
        options={sublist.map(each => ({ id: each }))}
        labelKey="id"
        placeholder={"Choose " + humanize(title)}
        type={TYPE.search}
        onChange={event => 
          console.log(event && event.value[0] && event.value[0].id)
        }
      />
    }
    return ui_returned
  }
}