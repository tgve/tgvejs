import React from 'react';
import { line } from 'd3-shape';

export default class DataSeries extends React.Component {
    render() {
        const props = this.props,
            yScale = props.yScale,
            xScale = props.xScale,
            coordinates = props.coordinates;
        const path = line()
            .x((d) => { return xScale(d.x); })
            .y((d) => { return yScale(d.y); })
        return (
            <path
                onMouseEnter={(e) => {
                    const bounds = e.target.getBoundingClientRect();
                    const x = e.clientX - bounds.left;
                    const y = e.clientY - bounds.top;
                    coordinates && 
                    coordinates({ x: x, y: y })
                }}
                strokeWidth="3"
                onMouseLeave={() => coordinates && coordinates({ x:null, y:null})}
                d={path(props.data)}
                stroke={props.color}
                fill="none"
            />
        )
    }
}

DataSeries.defaultProps = {
    title: '',
    data: [],
    interpolate: 'linear'
}