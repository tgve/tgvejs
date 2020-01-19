import React, { Component } from 'react';
import { Slider } from 'baseui/slider';
import { XYPlot, XAxis, YAxis, HexbinSeries, Hint } from 'react-vis';

export default class HexHeatmap extends Component {
  state = {
    hoveredNode: null,
    radius: 10,
    offset: 0,
  };
  render() {
    const { data, options } = this.props;
    const { radius, hoveredNode } = this.state;
    if(!data || !data.length) return null
    return (
      <div className="centered-and-flexed" style={{color:'#fff'}}>
        <Slider
            value={[this.state.radius]}
            min={5}
            max={50}
            step={5}
            onChange={({ value }) => {
              this.setState({ radius: value[0] });
              // typeof (onChange) === 'function' && onChange(value[0])
            }}
          />
          {"Radius (pixels)"}
        <XYPlot
          margin={{ left: 10, bottom: 10 }}
          height={options &&
            options.plotStyle && options.plotStyle.height || 350}
          width={options &&
            options.plotStyle && options.plotStyle.width || 350}
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
          {options && !options.noXAxis && 
          <XAxis tickLabelAngle={-45} style={{
            text: { fill: '#fff', fontWeight: 400 }
          }} />}
          {options && !options.noYAxis && 
          <YAxis tickLabelAngle={-45} style={{
            text: { fill: '#fff', fontWeight: 400 }
          }} />}
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
