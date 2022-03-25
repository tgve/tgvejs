import React from 'react';
import { Button, KIND } from 'baseui/button';
import generateTooltip from './utils';

const BOTTOM_OFFSET = 50;
const RIGHT_OFFSET = 50;

export default class Tooltip extends React.Component {

  componentDidMount() {
    window.addEventListener('resize', this._handleWindowSizeChange.bind(this));
  }

  // make sure to remove the listener
  // when the component is not mounted anymore
  componentWillUnmount() {
    window.removeEventListener('resize', this._handleWindowSizeChange.bind(this));
  }

  _handleWindowSizeChange() {
    this.forceUpdate()
  };

  render() {
    const { onCloseCallback } = this.props;
    if (this.props.popup) {
      return (
        <div
          style={{
            bottom: BOTTOM_OFFSET,
            right: RIGHT_OFFSET,
            position: 'absolute',
          }}>
          <Button
            kind={KIND.minimal}
            onClick={() => typeof (onCloseCallback) === 'function'
            && onCloseCallback()} >X</Button>
          <div>
            {generateTooltip(this.props)}
          </div>
        </div >
      )
    }
    return generateTooltip(this.props);
  }
}
