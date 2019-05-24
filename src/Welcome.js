/**
 * ATFutures, LIDA/ITS, University of Leeds
 * Entry component for ATT
 */
import React, { Component } from 'react';
import { Map, TileLayer } from 'react-leaflet';
import Control from 'react-leaflet-control';

import './App.css';
import RailUse from './components/RailUse.jsx';
import RBSlider from './components/RBSlider'
import GeoJSONComponent from './components/GeoJSONComponent.jsx';

export default class Welcome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sfParam: null,
            map: null,
            year: '1995.96',
            label: "Rail use between North East and ..."
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
                    <h3 style={{backgroundColor: 'white'}}>
                    {this.state.label}</h3>
                </Control>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                />
                {/* #ADD_COMPONENT */}
                <RBSlider
                    min="1995"
                    max="2017"
                    step="1"
                    position="bottomleft"
                    onChange={(year) =>
                        this.setState({ 
                            year: year + "." + ((parseInt(year) + 1) + "").substring(2)
                        })
                    } 
                />
                <GeoJSONComponent
                    key="source" 
                    style={{color:'#00ff00'}} 
                    fetchURL='http://localhost:8000/api/target' map={ this.state.map } />
                <GeoJSONComponent
                    key="dests"
                    year={this.state.year} 
                    style={() => {}} 
                    fetchURL='http://localhost:8000/api/trips' map={ this.state.map } />
                <RailUse
                    year={this.state.year} 
                    style={{color:'#000'}} 
                    fetchURL='http://localhost:8000/api/lines' 
                    map={ this.state.map } 
                    connectionError={(error) => {
                        this.setState({label: error})
                    }}/>
            </Map>
        );
    }
}

