/**
 * eAtlas code
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
                    key ? <span
                    onClick={() => this.setState({
                        sublist: null,
                        hidden: null,
                        key: null
                    })}>{`${this._humanize(key)} x`}</span> : list
                }
                {
                    shownSublist && shownSublist.length > 5 ? 
                    this._showTopn(shownSublist): hidden && hidden.length === shownSublist && shownSublist.length ?
                    null : shownSublist && shownSublist.length <= 5 ? shownSublist : sublist && this._showTopn(sublist)
                }
                {
                    hidden && hidden.length > 0 &&
                    <p>Chosen key > values</p>
                }
                {
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
