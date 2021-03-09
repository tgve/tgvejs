import React, { useState } from 'react';
import { colorRangeNames} from '../utils';

export default function ColorPicker(props) {
  const [chosen, setChosen] = useState(0);
  const { colourCallback } = props;
  return (
    <div className="color-picker-container">
      <p>Color:</p>
      {
        colorRangeNames.map((each, i) => {
            return (
              <div
                key={each}
                style={{
                  backgroundColor: i === 0 ? 'red' :
                    i === 1 ? 'blue' : i === 2 ? 'green' :
                      i === 3 ? 'orange' : i === 4 ? 'brown' : 'yellow'
                }}
                className={"color-box" + (chosen === i ? " color-box-active" : "")}
                onClick={() => {
                  setChosen(i)              
                  typeof colourCallback === 'function' &&
                    colourCallback(each)
                }}/>
            )
          })
      }
    </div>
  )
}