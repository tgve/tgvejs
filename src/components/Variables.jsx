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
            list:null,
            drill: false,
            selected: {}
        }
        this._generateList = this._generateList.bind(this)
        this._humanize = this._humanize.bind(this)
    }

    componentDidMount() {
        const { data } = this.props;
        if(!data || data.length === 0) return(null);
        this._processData(data);
    }
    
    _processData(data) {
        const properties = data[0].properties;
        const list = this._generateList(properties);
        this.setState({
            list
        });
    }

    componentDidUpdate(prevProps) {
        const { data } = this.props;
        if(!data || data.length === 0) return;
        if(data.length !== prevProps.data.length) {
            this._processData(data);
        }
    }

    _generateList(properties) {
        const {data} = this.props;
        const selected  = this.state.selected;
        const list = Object.keys(properties).map(key =>
            <span
                onClick={() => {
                    if(key === "date") return;
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
                            onClick={() => {
                                //add each to the key
                                let hidden = this.state.hidden || [];
                                if(!selected.hasOwnProperty(key)) {
                                    selected[key] = new Set()
                                }
                                selected[key].add(each);
                                hidden.push(each);
                                this.setState({ selected, hidden })
                            }}
                            className="sub" 
                            key={each}> {each} </span>)
                    
                    this.setState({
                        sublist: sublist,
                        key
                    })
                }}
                key={key}>
                {this._humanize(key)}
            </span>
        ) 
        return(list) 
    }

    _humanize(str) {
        let frags = str.split('_');
        for (let i = 0; i < frags.length; i++) {
            frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
        }
        return frags.join(' ');
    }

    render() {
        const { list, sublist, key, hidden } = this.state;
        // console.log(this.state.hidden);
        const shownSublist = sublist && hidden && sublist.filter(each => !hidden.includes(parseInt(each.key)))
        // console.log(shownSublist);
                              
        return (
            <div 
            className="tagcloud">
                Dataset variables:
                <div>
                {
                    //show main GeoJSON key if there is one chosen
                    key ? <span
                    onClick={() => this.setState({
                        sublist: null,
                        hidden: null,
                        key: null
                    })}>{`${this._humanize(key)} x`}</span> : list
                }
                {
                    /**
                     * Show:
                     * 1. If filtered sublist has been populated and it is
                     * above 5 (top 5)
                     * 2. If all has been filtered then show nothing
                     * 3. If 5 or less has been filtered show them
                     * 4. Otherwise just show sublist UNfiltered (top 5)
                     */
                    //better if/else is needed.
                    shownSublist && shownSublist.length > 5 ? 
                    this._showTopn(shownSublist): hidden && hidden.length === shownSublist && shownSublist.length ?
                    null : shownSublist && shownSublist.length <= 5 ? shownSublist : sublist && this._showTopn(sublist)
                }
                {
                    hidden && hidden.length > 0 &&
                    <p>Chosen key > values</p>
                }
                {
                    // simplest logic
                    // if you click me, I will remove myself from the list
                    hidden && hidden.length > 0 &&
                    hidden.map(each => {
                        //add remove
                        return(
                            <span
                                key={"remove-" + each}
                                onClick={() => {
                                    let newHidden = [...hidden];
                                    const index = newHidden.indexOf(each);
                                    if (index !== -1) newHidden.splice(index, 1);
                                    this.setState({hidden: newHidden})
                                }}>{`${each} x`}</span>
                        )
                    })
                }
                </div>
            </div>
        )
    }

    _showTopn(shownSublist) {
        return <>
            {shownSublist.slice(0, 5)}
            <i>Showing 5 out of {shownSublist.length}</i>
        </>;
    }
}
