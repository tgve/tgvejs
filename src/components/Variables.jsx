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
                            (!selected[key] || !selected[key]
                                .has(feature.properties[key])) &&
                            sublist.push(
                                feature.properties[key]
                            )
                        )
                    )
                    sublist = sublist.map(each => each && 
                        <span 
                            onClick={() => {
                                //add each to the key
                                if(!selected.hasOwnProperty(key)) {
                                    selected[key] = new Set()
                                }
                                if(!selected[key].has(each)) {
                                    selected[key].add(each);
                                    this.setState({ selected })
                                }
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
        const { list, sublist, key } = this.state;
        console.log(this.state.selected);
                                
        return (
            <div 
            className="tagcloud">
                Dataset variables:
                <p>
                {
                    key ? <span
                    onClick={() => this.setState({
                        sublist: null,
                        key: null
                    })}>{`${this._humanize(key)} x`}</span> : list
                }
                {
                    sublist && sublist.length > 5 ? 
                    <>
                        { sublist.slice(0,5) } 
                        <i>Showing 5 out of {sublist.length}</i>
                    </>: sublist
                }
                </p>
            </div>
        )
    }
}
