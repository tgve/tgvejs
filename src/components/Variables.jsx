/**
 * eAtlas code
 *  
 * React component which takes a GeoJSON object. Loops through its
 * properties and show the list to start with. Each property 
 * can show all avialable values. Each value can be selected/deselected.
 *
 * Current code can deal with only one GeoJSON property's keys.
 * 
 * Next is handling multiple GeoJSON key value pairs.
 * Next will be replacing current "hard" code in the parent code,
 * so that all key values can be dynamically filtered.
 * 
 * This should be generalizeable to any GeoJSON file, or that is the
 * aim.
 */
import React, { Component } from 'react';

import './style.css';

export default class Variables extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: null,
            drill: false,
            selected: {}
        }
        this._generateList = this._generateList.bind(this);
        this._geoJSONPropsOrValues = this._geoJSONPropsOrValues.bind(this);
        this._humanize = this._humanize.bind(this);
        this._processData = this._processData.bind(this);
        this._showSelectedVars = this._showSelectedVars.bind(this);
        this._showTopn = this._showTopn.bind(this);
    }

    componentDidMount() {
        const { data } = this.props;
        if (!data || data.length === 0) return (null);
        this._processData(data);
    }

    componentDidUpdate(prevProps) {
        const { data } = this.props;
        if (!data || data.length === 0) return;
        if (data.length !== prevProps.data.length) {
            this._processData(data);
        }
    }

    /**
     * The main function in this clase.
     * 
     * Loops through properties of a GeoJSON object, 
     * generates both properties and their available values.
     * Uses Set to avaoid duplicates for each property values set.
     * 
     * @param {*} properties 
     */
    _generateList(properties) {
        const { data, onSelectCallback, style, subStyle,
            propertyValuesCallback } = this.props;
        const selected = this.state.selected;
        const list = Object.keys(properties).map(key =>
            <span
                style={style}
                onClick={() => {
                    if (key === "date") return;
                    let sublist = [];
                    data.forEach(feature =>
                        Object.keys(feature.properties).forEach(property =>
                            property === key &&
                            !sublist.includes(feature.properties[key]) &&
                            sublist.push(
                                feature.properties[key]
                            )
                        )
                    )
                    sublist = sublist.map(each => each &&
                        <span
                            style={subStyle}
                            onClick={() => {
                                //add each to the key
                                if (!selected.hasOwnProperty(key)) {
                                    selected[key] = new Set()
                                }
                                selected[key].add(each + ""); // make sure it is string
                                typeof (onSelectCallback) === 'function' &&
                                    onSelectCallback(selected)
                                this.setState({ selected })
                            }}
                            className="sub"
                            key={each + ""}> {each}
                        </span>
                    )
                    typeof (propertyValuesCallback) === 'function' &&
                        propertyValuesCallback({ key, sublist })
                    this.setState({
                        sublist: sublist,
                        key
                    })
                }}
                key={key}>
                {this._humanize(key)}
            </span>
        )
        return (list)
    }

    /**
     * Helper to convert key_values to "Key Values"
     * @param {*} str 
     */
    _humanize(str) {
        let frags = str.split('_');
        for (let i = 0; i < frags.length; i++) {
            frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
        }
        return frags.join(' ');
    }

    /**
     * As state changes regenerate key/vlaues
     * @param {*} data 
     */
    _processData(data) {
        const properties = data[0].properties;
        const list = this._generateList(properties);
        this.setState({
            list
        });
    }

    /**
     * 
     * @param {*} shownSublist 
     * @param {*} n 
     */
    _showTopn(shownSublist, n = 5) {
        return <>
            {shownSublist.slice(0, n)}
            <i>Showing {n} out of {shownSublist.length}</i>
        </>;
    }

    /**
     * Word cloud of all values for a particular key.
     * 
     * @param {*} selected 
     * @param {*} key 
     */
    _showSelectedVars(selected, key) {
        const { onSelectCallback } = this.props;
        let ret = []
        selected && selected[key] && selected[key].size > 0 &&
            selected[key].forEach(each => {
                if (ret.length === 0) ret.push(<p key="chosen-label">
                    <b>{` ${this._humanize(key)}'s `}</b> values</p>)
                //add remove
                ret.push(<span
                    style={this.props.subStyle}
                    key={"remove-" + each} onClick={() => {
                        selected[key].delete(each);
                        if (selected[key].size === 0) delete selected[key]
                        typeof (onSelectCallback) === 'function' &&
                            onSelectCallback(selected)
                        this.setState({ selected });
                    }}>{`${each} x`}</span>)
            });
        return (ret)
    }

    /**
     * Show:
     * 1. If filtered sublist has been populated and it is
     * above 5 (top 5)
     * 2. If all has been filtered then show nothing
     * 3. If 5 or less has been filtered show them
     * 4. Otherwise just show sublist UNfiltered (top 5)
     */
    _geoJSONPropsOrValues(shownSublist, selected, key, sublist, n = 5) {
        // console.log(selected);

        if (!sublist) return null
        if ((!shownSublist || shownSublist.length === 0) &&
            (!selected || !selected[key] || selected[key].size === 0)) {
            return this._showTopn(sublist)
        } else if (selected && selected[key] && selected[key].size ===
            sublist.length) {
            return null
        } else if (shownSublist.length > n) {
            return this._showTopn(shownSublist, n)
        }
        return shownSublist
    }

    render() {
        const { list, sublist, key, selected } = this.state;
        const shownSublist = sublist && selected && key &&
            sublist.filter(each => {
                return selected[key] && each && !selected[key].has(each.key)
            })
        // console.log(shownSublist);

        return (
            <div >
                Dataset variables:
                <div>
                    <div className="tagcloud">
                        {
                            //show main GeoJSON key if there is one chosen
                            key ? <span
                                style={this.props.style}
                                onClick={() => this.setState({
                                    sublist: null,
                                    key: null
                                })}>{`${this._humanize(key)} x`}</span> : list
                        }
                    </div>
                    <div className="tagcloud">
                        {
                            this._geoJSONPropsOrValues(shownSublist, selected, key, sublist)
                        }
                    </div>
                    <div className="tagcloud">
                        {
                            // simplest logic
                            // if you click me, I will remove myself from the list
                            this._showSelectedVars(selected, key)
                        }
                    </div>
                </div>
            </div>
        )
    }
}
