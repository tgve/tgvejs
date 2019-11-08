/**
 * geoplumber R package code.
 */
import React from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { Link, withRouter } from 'react-router-dom';

import { ATILOGO } from '../utils';

const navs = [
  {
    key: 1,
    to: "fui",
    title: "DUI"
  },
  {
    key: 2,
    to: "about",
    title: "About"
  },
];

class Header extends React.Component {

  render() {
    return (
      <Navbar inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">
              <svg className="logo" viewBox="0 0 1025 428" version="1.1" 
              xmlns="http://www.w3.org/2000/svg" 
              xlink="http://www.w3.org/1999/xlink">
                {ATILOGO()}
              </svg>
            </Link>
          </Navbar.Brand>
        <Navbar.Toggle />
        </Navbar.Header>
      <Navbar.Collapse>
        <Nav>
          {
            navs.map((item, i) => {
              return (
                <NavItem
                  key={i}
                  eventKey={item.key}
                  onClick={() => this.props.history.push(item.to)}>
                  {item.title}
                </NavItem>
              )
            })
          }
        </Nav>
        {/* trick RB with navbar-nav > li a but do it like following*/}
        {/* <div className="nav navbar-nav">
            <li>
              <a href="https://github.com/layik/eAtlas">
                <i style={{ fontSize: '1.5em' }} className="fa fa-github"></i>
              </a>
            </li>
          </div> */}
        <Nav pullRight>
          <NavItem href="https://github.com/layik/eAtlas">
            <i style={{ fontSize: '1.5em' }} className="fa fa-github"></i>
          </NavItem>
        </Nav>
      </Navbar.Collapse>
      </Navbar >
    )
  }
}

// thanks to https://stackoverflow.com/a/42124328/2332101
export default withRouter(Header);
