import React from 'react';
import MultiSelect from './MultiSelect';

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
        
        return(
          <MultiSelect 
          title={selected === 'dark' ? "Default(dark)" : selected}
            single={true}
            values={bases.map(e => ({id:e, value:e}))}
            onSelectCallback= {(selected) => {
              const base = selected && selected[0] ?
              selected[0].value : this.state.selected;
              this.setState({selected: base});
              typeof(onSelectCallback) === 'function' && base &&
              onSelectCallback(base)
          }}
          />
            // <RBDropDown
            //     title={selected === 'dark' ? "Default(dark)" : selected}
            //     menuitems={bases}
            //     onSelectCallback= {(selected) => {
            //         this.setState({selected});
            //         typeof(onSelectCallback) === 'function' &&
            //         onSelectCallback(selected)
            //     }}
            // />
        )
    }
}