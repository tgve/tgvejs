import React from 'react';
import { MenuItem, DropdownButton } from 'react-bootstrap';

import { humanize } from '../utils';

export default class RBDropDown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: props.hasOwnProperty('title') ? props.title : "No Title",
      menuitems: props.hasOwnProperty('menuitems') ? props.menuitems : []
    }
    this._generateMenuItems = this._generateMenuItems.bind(this);
  }

  _generateMenuItems(menuitems) {
    const isArray = menuitems && typeof (menuitems[0]) !== 'string';
    return menuitems.map((entry, i) => {
      let key, value;
      if (isArray) {
        key = Object.keys(entry)[0];
        value = Object.values(entry)[0];
      }
      if ((!isArray && entry === "") ||
        (isArray && key === "" && value === "")) {
        return (<MenuItem
          className="mi-class" key={i} divider />);
      }
      else {
        return (<MenuItem
          className="mi-class" key={i} eventKey={entry // the object
          }>
          {humanize(isArray ? value : entry)}
        </MenuItem>);
      }
    });
  }

  static getDerivedStateFromProps(props, state) {
    if (props.hasOwnProperty('title') && props.title !== state.title) {
      return {
        title: props.title
      }
    }
    if (props.hasOwnProperty('menuitems') && props.menuitems.length !== state.menuitems.length) {
      return {
        menuitems: props.menuitems
      }
    }
    return null
  }

  render() {
    const { title, menuitems } = this.state;
    const { size, classNames } = this.props;
    const keyIsArray = menuitems && typeof (menuitems[0]) !== 'string';

    // console.log(title);
    if (!menuitems || menuitems.length === 0) {
      return (null)
    }

    return (
      <DropdownButton
        style={{ width: '100%' }}
        title={title}
        className={typeof (classNames) === 'object'
          && classNames.length > 0 ? classNames.join(" ") : classNames}
        id={typeof (size) === 'string' ? size : "dropdown-size-medium"}
        onSelect={(event) => {
          //update title
          this.setState({
            title: keyIsArray ? Object.values(event)[0] : event
          })
          if (typeof (this.props.onSelectCallback) === 'function') {
            this.props.onSelectCallback(keyIsArray ? Object.values(event)[0] : event)
          }
          //die gracefully
        }}>
        {
          this._generateMenuItems(menuitems)
        }
      </DropdownButton>
    )
  }
}
