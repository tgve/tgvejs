/**
 * geoplumber R package code.
 */
import React from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap';

import { ATILOGO } from '../utils';

class Header extends React.Component {

  render() {
    return (
      <Navbar inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="/">
              <svg className="logo" viewBox="0 0 1025 428" version="1.1" 
              xmlns="http://www.w3.org/2000/svg" 
              xlink="http://www.w3.org/1999/xlink">
                {ATILOGO()}
              </svg>
            </a>
          </Navbar.Brand>
        <Navbar.Toggle />
        </Navbar.Header>
      <Navbar.Collapse>
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
export default Header;
