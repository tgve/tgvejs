import React, { Component } from 'react';

// react bootstrap
import { Alert } from 'react-bootstrap';

// local

class ToastAlert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeDuration: false
    }
  }

  // lifeCycles
  //-----------------------------------------------
  componentWillUnmount() {
    if (this.dismissTimeoutId) clearTimeout(this.dismissTimeoutId)
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.alert) return;
    const oldId = this.props.alert;
    const newId = nextProps.alert;
    if (oldId !== newId) {
      const { time } = nextProps.alert;
      this.setState({
        timeDuration: Boolean(alert)
      },
        () => {
          this.dismissTimeout = setTimeout(() => this.setState({ timeDuration: false }),
            time || 3000)
        });
    }
  }

  // local methods

  // render
  render() {
    const { alert } = this.props;
    const { timeDuration } = this.state;

    if (!timeDuration || !alert || !alert.content)
      return null;

    else {
      return (
        <Alert style={{
          border: 'none',
          background: '#f8d7da',
          color: '#721c24',
          textAlign: 'center'
        }} variant={"danger"} >
          {alert.content}
        </Alert>
      )

    }
  }
}
export default ToastAlert;
