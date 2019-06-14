import React from 'react';
import _ from 'underscore';
import { scaleLinear } from 'd3-scale';

import DataSeries from './DataSeries';
import './LineChart.css';

export default class LineChart extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            x: null, y: null
        }
        this._calculateTicks = this._calculateTicks.bind(this);
    }

    _calculateTicks(min, max, tickCount) {
        var span = max - min,
            step = Math.pow(10, Math.floor(Math.log(span / tickCount) / Math.LN10)),
            err = tickCount / span * step;
    
        // Filter ticks to get closer to the desired count.
        if (err <= .15) step *= 10;
        else if (err <= .35) step *= 5;
        else if (err <= .75) step *= 2;
    
        // Round start and stop values to step interval.
        var tstart = Math.ceil(min / step) * step,
            tstop = Math.floor(max / step) * step + step * .5,
            ticks = [];
    
        // now generate ticks
        for (let i=tstart; i < tstop; i += step) {
            ticks.push(i);  
        } 
        return ticks;
    }

    render() {
        const data = this.props.data,
            size = { width: this.props.width, height: this.props.height };
        // console.log(data);
        if (!data) return (null) // React
        const { x } = this.state;
        // console.log(x, y);

        const max = _.chain(data)
            .zip()
            .map(function (values) {
                return _.reduce(values, function (memo, value) { return Math.max(memo, value.y); }, 0);
            })
            .max()
            .value();

        const xScale = scaleLinear()
            .domain([2009, 2017])
            .range([0, this.props.width]);

        const yScale = scaleLinear()
            .domain([0, max])
            .range([this.props.height, 0]);
        
        const ticks = this._calculateTicks(0,max, 4).sort().reverse()
        return (
            <svg
                className="d3-chart"
                width={this.props.width} height={this.props.height}>
                <DataSeries
                    coordinates={({ x, y }) => this.setState({ x, y })}
                    data={data} size={size} xScale={xScale}
                    yScale={yScale} ref="series1" color="cornflowerblue" />
                <text x="65" y="40" className="d3-line-text">Year</text>
                {/* <text x={x} y={y} className="d3-line-text">Year</text> */}
                <line x1={x} y1={0} x2={x} y2="180" />
                {
                    data && data.map((year, i) => {
                        const x1 = i * (260 / data.length);
                        // const y1 = i * (180 / data.length);
                        return (
                            <g key={year + "" + i}>
                                <line x1={x1} y1="180" x2={x1} y2="175" />
                                <text x={x1 + 2} y="170"
                                    // transform="rotate(10)"
                                    className="d3-axis-labels">{year.x}</text>
                            </g>
                        )
                    })
                }
                {/* yAxis is different */}
                {
                    data && ticks.map((value, i) => {
                        const y1 = i * (180 /(ticks.length - 1));
                        if(value === 0) return(null)
                        return (
                            <g key={"yaxis" + i}>
                                <line x1={0} y1={y1} x2={280} y2={y1} className="d3-line-grid" />
                                <text x={2} y={y1 + 15}
                                    // transform="rotate(10)"
                                    className="d3-yaxis-labels">
                                    {value}
                                </text>
                            </g>
                        )
                    })
                }
            </svg>
        )
    }

}

LineChart.defaultProps = {
    width: 260,
    height: 180
}