import React from 'react';
import { Button, KIND } from 'baseui/button';
import generateTooltip from './utils';
import DraggableComponent from '../../utils/draggable';

const TOP_OFFSET = 100;
const LEFT_OFFSET = 320;

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
          id='tgve-tooltip'
          style={{
            top: TOP_OFFSET,
            left: LEFT_OFFSET,
            position: 'absolute',
            cursor: 'move'
          }}>
          <DraggableComponent
            component={
              <div>
                <Button
                  kind={KIND.minimal}
                  onClick={() => typeof (onCloseCallback) === 'function'
                    && onCloseCallback()} >X</Button>
                {generateTooltip(this.props)}</div>} />
        </div >
      )
    }
    return generateTooltip(this.props);
  }
}
