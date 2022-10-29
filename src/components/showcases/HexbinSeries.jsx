import React, { useState } from 'react';
import { Slider } from 'baseui/slider';
import { XYPlot, XAxis, YAxis,
  HexbinSeries, Hint } from 'react-vis';
import { useStyletron } from 'baseui';

export default function HexHeatmap(props){
  const [hoveredNode, setHoveredNode] = useState(null)
  const [radius, setRadius] = useState(10);
  const [css, theme] = useStyletron();

  const { data, options } = props;
  if(!data || !data.length) return null
    return (
      <div className="centered-and-flexed"
        style={{color: theme.colors.contentPrimary}}>
        <Slider
            style={{width: '100%'}}
            value={[radius]}
            min={5}
            max={50}
            step={5}
            onChange={({ value }) => {
              setRadius(value[0]);
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
          onMouseLeave={() => setHoveredNode(null)}
        >
          <HexbinSeries
            animation
            style={{
              stroke: '#125C77',
              strokeLinejoin: 'round'
            }}
            onValueMouseOver={d => setHoveredNode(d)}
            colorRange={['orange', 'cyan']}
            radius={radius}
            data={data}
          />
          {options && !options.noXAxis &&
          <XAxis tickLabelAngle={-45} style={{
            text: {
              fill: theme.colors.contentPrimary,
              fontWeight: 400 }
          }} />}
          {options && !options.noYAxis &&
          <YAxis tickLabelAngle={-45} style={{
            text: {
              fill: theme.colors.contentPrimary,
              fontWeight: 400 }
          }} />}
          {hoveredNode && (
            <Hint
              style={{
                background: theme.colors.backgroundTertiary,
                position: 'relative' }}
              xType="literal"
              yType="literal"
              getX={d => 50}
              getY={d => 50}
              value={{
                x: hoveredNode.x.toFixed(2),
                y: hoveredNode.y.toFixed(2),
                value: hoveredNode.length
              }}
            />
          )}
        </XYPlot>
      </div>
    );
}
