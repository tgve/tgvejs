import React from 'react';
import { generateTooltip } from '../utils/utils';

export default class Tooltip extends React.Component {

  componentDidMount() {
    window.addEventListener('resize', this._handleWindowSizeChange.bind(this));
  }

  // make sure to remove the listener
  // when the component is not mounted anymore
  componentWillUnmount() {
    window.removeEventListener('resize', this._handleWindowSizeChange.bind(this));
  }

  _handleWindowSizeChange () {
    this.forceUpdate()
  };

  render() {
    return generateTooltip(this.props);
  }
}
