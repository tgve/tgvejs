import React from 'react';

import { Slider } from 'baseui/slider';
import { Checkbox } from 'baseui/checkbox';
import { Button } from 'baseui/button';
import { StatefulButtonGroup } from 'baseui/button-group';
import { StatefulSelect, TYPE } from 'baseui/select';
import {
  suggestUIforNumber, humanize
} from '../utils';

export const generateUI = (key, sublist) => {
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
        options={sublist.map(each => ({ id: each }))}
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