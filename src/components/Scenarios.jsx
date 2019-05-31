/**
 * ATFutures, LIDA/ITS, University of Leeds
 * Entry component for ATT
 */
import React, { Component } from 'react';
import { Map, TileLayer } from 'react-leaflet';
import Control from 'react-leaflet-control';

import '../App.css';
import ScenariosComponent from './ScenariosComponent';

import {FormGroup, Radio} from 'react-bootstrap';

export default class Scenarios extends Component {
    constructor(props) {
        super(props);
        this.state = {
            map: null,
            selectedOption: '0',
            label: "Scenario 1"
        }
    }

    componentDidMount() {
        const map = this.refs.map.leafletElement
        this.setState({ map })
        // get regions
    }

    render() {
        return (
            <Map
                preferCanvas={true}
                zoom={13}
                ref='map'
                center={[53.8008, -1.5491]}
                onclick={(e) => {
                    this.setState({ touchReceived: true })
                }}
            >
                <Control position="bottomright">
                    <FormGroup style={{backgroundColor: 'white'}}>
                        {
                            ['0','1','2'].map((key) => {
                                return (
                                    <Radio
                                        checked={this.state.selectedOption === key}
                                        value={key}
                                        key={key}
                                        onChange={(e) => {
                                            this.setState({
                                                label: "Scenario " + e.target.value,
                                                selectedOption: e.target.value
                                            })
                                        }}
                                    >{"Scenario " + key}</Radio>
                                )
                            })
                        }
                    </FormGroup>
                </Control>
                <Control position="bottomleft">
                    <h3 style={{backgroundColor: 'white'}}>
                    {this.state.label}</h3>
                </Control>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                />
                {/* #ADD_COMPONENT */}
                <ScenariosComponent 
                    map={ this.state.map } />
            </Map>
        );
    }
}

