'use-strict'

import React, { Component } from 'react';
import Control from 'react-leaflet-control';

import './style.css'
export default class RBSlider extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null
        }
        this.myInput = React.createRef()
    }

    componentDidMount() {
        // console.log(this.myInput.current);
        
    }

    _handleChange(event) {
        if (typeof (this.props.onChange) === 'function') {
            this.props.onChange(event.target.value)
        }
        this.setState({ value: event.target.value })
    }

    _generateTicks() {
        let { min, max } = this.props;
        let i = min;
        const ticks = [];
        while (i < max) {
            ticks.push(<span 
                key={i+"th"} 
                className="ticks"
                style={{
                left: (i-min || 1) * (320/(max-min)),
            }}></span>)
            i++;
        }
        return(ticks)
    }

    render() {
        let { min, max, step } = this.props;
        min = min || 1
        max = max || 10
        step = step || 1
        const { value } = this.state;
        return (
            <Control 
                ref={this.myInput}
                position={
                this.props.position || "topright"
            }>
                <div 
                    style={{
                        width:'320px',
                        backgroundColor: 'white'}}>
                    <label>{min}</label>
                    <label style={{
                        position: 'absolute',
                        left: 290
                    }}>{max}</label>
                    <input
                        id="typeinp"
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={value ? value : min}
                        onChange={this._handleChange.bind(this)}
                        />

                    {
                        this._generateTicks()
                    }
                    <p style={{
                        borderTop: '1px lightgrey solid',
                        paddingTop: '0.3em',
                        textAlign: 'center', 
                        fontSize:'1.5em'}}>{value ? value : min}</p>
                </div>
            </Control>
        )
    }
}
