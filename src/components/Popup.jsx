import React from 'react';
import { Button } from 'baseui/button';
import { generateTooltip } from '../utils/utils';

const BOTTOM_OFFSET= 50;
const RIGHT_OFFSET = 50;
const HEIGHT = 400;
const WIDTH = 300;

export default class Popup extends React.Component {
  constructor(props) {
    super();
    this.state = {
      isMobile: props.isMobile,
    };
  }

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
    console.log("in popup's render()")
    const { onCloseCallback } = this.props;
    const popup =
      <div
        className="side-panel" style={{
          bottom: BOTTOM_OFFSET,
          right: RIGHT_OFFSET,
          height: HEIGHT,
          width: WIDTH,
          position: "absolute",
          backgroundColor: "#000",
          color: "#fff"
        }}>
        <div>
          {generateTooltip(this.props, this.state)}
        </div>
        <Button onClick={() => typeof(onCloseCallback) === 'function' 
          && onCloseCallback()} >X</Button>
      </div >
    return (popup)
  }
}
