import React from 'react';
import {
    Tabs, Tab, FormGroup, InputGroup,
    FormControl, Glyphicon, Checkbox
} from 'react-bootstrap';

import './DeckSidebar.css';
import RBDropDown from '../RBDropdownComponent';
import MapboxBaseLayers from '../MapboxBaseLayers';
import { summariseByYear } from '../../utils';
import { XYPlot, LineSeries, XAxis, YAxis, } from 'react-vis';
import Variables from '../Variables';

import GenerateUI from '../UI';

export default class DeckSidebar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            radius: 100,
            elevation: 4,
            open: true,
            // must match the order in plumber.R
            road_types: ["All", "Dual carriageway", "Single carriageway", "Roundabout", "Unknown", "Slip road", "One way street"],
            year: "",
            minAge: 18,
            maxAge: 24
        }
    }

    // static getDerivedStateFromProps(props, state) {
    //     if (props.data) { 
    //         // console.log(props.data.features.length);
    //         let menuitems = []
    //         props.data.features.forEach(feature =>{
    //             if(!menuitems.includes(feature.properties.road_type)){
    //                 menuitems.push(feature.properties.road_type)
    //             }
    //         })
    //         return {
    //             menuitems,
    //             data: props.data
    //         }
    //     }
    //     return null
    // }

    shouldComponentUpdate(nextProps, nextState) {
        const { data } = this.props;
        // if (this.state.year !== nextState.year) return true;
        if (data && nextProps && nextProps.data &&
            data.length === nextProps.data.length) {
            return false
        }
        return true;
    }

    _sliderCallback(value) {
        const { onSelectCallback } = this.props;
        this.setState({
            year: value
        })
        typeof (onSelectCallback) === 'function' &&
            onSelectCallback({ selected: value + "", what: 'year' })
    }

    render() {
        const { hide, open, elevation, road_type, severity,
            radius, road_types, year, minAge, maxAge,
            subsetBoundsChange } = this.state;
        const { onChangeRadius, onChangeElevation,
            onSelectCallback, data,
            toggleSubsetBoundsChange } = this.props;
        // console.log(year);
        const plot_data = summariseByYear(data);
        return (
            <div className="side-panel-container"
                style={{ marginLeft: hide ? '-320px' : '0px' }}>
                <div
                    className="side-panel">
                    <div className="side-pane-header">
                        <h2>{data && data.length ?
                            (data.length === 1 ? data.length + " crash." : data.length + " crashes.")
                            : "Nothing to show"}
                        </h2>
                    </div>
                    <div className="side-panel-body">
                        <div className="side-panel-body-content">
                            {/* range of two values slider is not native html */}
                            <GenerateUI
                                title={
                                    <h5>Year(s): {year ? year : "2009 - 2017"}.
                                        {
                                            year &&
                                            <i style={{ fontSize: '2rem' }}
                                                className="fa fa-trash"
                                                onClick={() => {
                                                    typeof (onSelectCallback) === 'function' &&
                                                        onSelectCallback({ selected: "", what: 'year' })
                                                    this.setState({ year: "" })
                                                }} />
                                        }
                                    </h5>
                                }
                                sublist={[2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017]}
                                suggested="slider"
                                onChange={this._sliderCallback.bind(this)} />
                            {/* <GenerateUI title="Test" sublist={["one", "two"]} suggested="checkbox" /> */}
                            <RBDropDown
                                title={road_type ? road_type : "Road Type(All)"}
                                menuitems={road_types}
                                onSelectCallback={(selected) => {
                                    this.setState({ road_type: selected === "All" ? "" : selected })
                                    onSelectCallback &&
                                        onSelectCallback({
                                            selected: selected === "All" ?
                                                // starts at 1 but 
                                                // road_types has All at 0
                                                "" : road_types.indexOf(selected),
                                            what: 'road_type'
                                        })
                                }} />
                            <RBDropDown
                                title={severity ? severity : "Severity(All)"}
                                menuitems={['All', 'Slight', 'Serious', 'Fatal']}
                                onSelectCallback={(selected) => {
                                    this.setState({ severity: selected === "All" ? "" : selected })
                                    onSelectCallback &&
                                        onSelectCallback({
                                            selected: selected === "All" ? "" : selected,
                                            what: 'severity'
                                        })
                                }} />
                            <hr />
                            <Tabs defaultActiveKey="1" id="main-tabs">
                                <Tab eventKey="1" title={
                                    <i style={{ fontSize: '2rem' }}
                                        className="fa fa-info" />
                                }>
                                    {
                                        data && data.length > 0 &&
                                        <Variables
                                            onSelectCallback={(multiVarSelect) =>
                                                typeof (onSelectCallback) === 'function' &&
                                                onSelectCallback(
                                                    Object.keys(multiVarSelect).length === 0 ?
                                                        { what: '' } : { selected: multiVarSelect, what: 'multi' })
                                            }
                                            data={data} />
                                    }
                                    {plot_data && plot_data.length > 1 && <XYPlot
                                        xType="ordinal"
                                        animation={{ duration: 1 }}
                                        height={250} width={250}>
                                        <XAxis
                                            position="right"
                                            tickLabelAngle={-45}
                                            style={{
                                                text: { fill: '#fff', fontWeight: 400 }
                                            }} />
                                        <YAxis
                                            tickLabelAngle={-45}
                                            tickFormat={v => v > 1000 ? v / 1000 + "K" : v}
                                            style={{
                                                title: { fill: '#fff' },
                                                text: { fill: '#fff', fontWeight: 400 }
                                            }}
                                            position="start"
                                            title="Crashes" />
                                        <LineSeries
                                            onSeriesMouseOver={(event) => {

                                            }}
                                            style={{ fill: 'none' }}
                                            data={plot_data} />
                                    </XYPlot>}
                                </Tab>
                                <Tab eventKey="2" title={
                                    <i style={{ fontSize: '2rem' }}
                                        className="fa fa-sliders" />
                                }>
                                    <input
                                        type="range"
                                        id="radius"
                                        min={50}
                                        max={500}
                                        step={50}
                                        value={radius}
                                        onChange={(e) => {
                                            this.setState({
                                                radius: e.target.value,
                                            })
                                            typeof (onChangeRadius) === 'function' && onChangeRadius(e.target.value)
                                        }}
                                    />
                                    <h5>Radius: {radius}.</h5>
                                    <input
                                        type="range"
                                        id="elevation"
                                        min={2}
                                        max={8}
                                        step={2}
                                        value={elevation}
                                        onChange={(e) => {
                                            this.setState({
                                                elevation: e.target.value
                                            })
                                            typeof (onChangeElevation) === 'function' && onChangeElevation(e.target.value)
                                        }}
                                    />
                                    <h5>Elevation: {elevation}.</h5>

                                    Map Styles
                                    <br />
                                    <MapboxBaseLayers
                                        onSelectCallback={(selected) =>
                                            onSelectCallback &&
                                            onSelectCallback({
                                                selected: selected,
                                                what: 'mapstyle'
                                            })
                                        }
                                    />
                                    <Checkbox
                                        onChange={() => {
                                            this.setState({ subsetBoundsChange: !subsetBoundsChange })
                                            if (toggleSubsetBoundsChange && typeof (toggleSubsetBoundsChange) === 'function') {
                                                toggleSubsetBoundsChange(!subsetBoundsChange) //starts with false
                                            }
                                        }}
                                    >Subset by map boundary</Checkbox>
                                </Tab>
                                <Tab eventKey="3" title={
                                    <i style={{ fontSize: '2rem' }}
                                        className="fa fa-tasks" />
                                }>
                                    Tab 3
                            </Tab>
                            </Tabs>
                        </div>
                        <form className="search-form">
                            <FormGroup>
                                <InputGroup>
                                    <FormControl placeholder="fly to..." type="text" />
                                    <InputGroup.Addon>
                                        <Glyphicon glyph="search" />
                                    </InputGroup.Addon>
                                </InputGroup>
                            </FormGroup>
                        </form>
                    </div>
                </div>
                <div
                    className="close-button"
                    onClick={() =>
                        this.setState({
                            hide: !hide,
                            open: !open
                        })}
                    style={{ color: 'white' }}>
                    <div style={{ backgroundColor: '#242730' }}>
                        <i
                            style={{ fontSize: '2rem' }}
                            className={open ? "fa fa-arrow-circle-left" :
                                "fa fa-arrow-circle-right"} />
                    </div>
                </div>
            </div>
        )
    }
}
