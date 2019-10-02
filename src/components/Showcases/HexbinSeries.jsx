import React, { Component } from 'react';

import { XYPlot, XAxis, YAxis, HexbinSeries, Hint } from 'react-vis';

export default class HexHeatmap extends Component {
  state = {
    hoveredNode: null,
    radius: 10,
    offset: 0
  };
  render() {
    const { data, options } = this.props;
    const { radius, hoveredNode } = this.state;

    return (
      <div className="centered-and-flexed">
        <XYPlot
          height={options &&
            options.plotStyle && options.plotStyle.height || 250}
          width={options &&
            options.plotStyle && options.plotStyle.width || 250}
          onMouseLeave={() => this.setState({ hoveredNode: null })}
        >
          <HexbinSeries
            animation
            className="hexbin-example"
            style={{
              stroke: '#125C77',
              strokeLinejoin: 'round'
            }}
            // onValueMouseOver={d => this.setState({ hoveredNode: d })}
            colorRange={['orange', 'cyan']}
            radius={radius}
            data={data}
          />
          <XAxis tickLabelAngle={-45} style={{
            text: { fill: '#fff', fontWeight: 400 }
          }} />
          <YAxis tickLabelAngle={-45} style={{
            text: { fill: '#fff', fontWeight: 400 }
          }} />
          {/* {hoveredNode && (
            <Hint
              style={{ background: '#fff', position: 'relative' }}
              xType="literal"
              yType="literal"
              getX={d => 50}
              getY={d => 50}
              value={{
                x: hoveredNode.x,
                y: hoveredNode.y,
                value: hoveredNode.length
              }}
            />
          )} */}
        </XYPlot>
      </div>
    );
  }
}
