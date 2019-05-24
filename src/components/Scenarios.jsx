/**
 * ATFutures, LIDA/ITS, University of Leeds
 * Entry component for ATT
 */
import React, { Component } from 'react';
import { Map, TileLayer } from 'react-leaflet';
import Control from 'react-leaflet-control';

import '../App.css';
import ScenariosComponent from './ScenariosComponent';

export default class Scenarios extends Component {
    constructor(props) {
        super(props);
        this.state = {
            map: null,
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
                {/* <Control position="bottomright">
                    <h3 style={{backgroundColor: 'white'}}>
                    {this.state.label}</h3>
                </Control> */}
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

