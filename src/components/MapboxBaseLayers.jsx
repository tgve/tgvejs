import React from 'react';
import RBDropDown from './RBDropdownComponent';

export default class MapboxBaseLayers extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            bases: [
                'dark',
                'basic',
                'streets',
                'bright',
                'light',
                'satellite',
                'No map'
            ],
            selected: 'dark'
        }
    }

    render() { 
        const {selected, bases} = this.state;
        const {onSelectCallback} = this.props;
        // console.log(selected);
        
        return(
            <RBDropDown
                title={selected === 'dark' ? "Default(dark)" : selected}
                menuitems={bases}
                onSelectCallback= {(selected) => {
                    this.setState({selected});
                    typeof(onSelectCallback) === 'function' &&
                    onSelectCallback(selected)
                }}
            />
        )
    }
}