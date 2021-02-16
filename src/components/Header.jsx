/**
 * geoplumber R package code.
 */
import React, { useState } from 'react';
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

function Header(props) {
  const [dark, setDark] = useState(props.dark)
  return (
    <Navbar inverse={dark} collapseOnSelect>
      <Navbar.Header>
        <Navbar.Brand>
          <Link to="/">
            <svg className="logo" viewBox="0 0 1025 428"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xlink="http://www.w3.org/1999/xlink">
              {ATILOGO(dark)}
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
                  onClick={() => props.history.push(item.to)}>
                  {item.title}
                </NavItem>
              )
            })
          }
        </Nav>
        <Nav pullRight>
          <NavItem href="https://github.com/layik/eAtlas">
            <i style={{ fontSize: '1.5em' }} className="fa fa-github"></i>
          </NavItem>
        </Nav>
        <Nav pullRight>
          <NavItem onClick={() => {
            typeof props.toggleTheme === 'function' && props.toggleTheme()
            setDark(!dark)
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <g transform="matrix( 1 0 0 1 4 1 )">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M15.3999 11C15.7999 10.1 16 9 16 8C16 3.6 12.4 0 8 0C3.6 0 0 3.6 0 8C0 9.1 0.200098 10.1 0.600098 11L2.19995 15L13.8 15L15.3999 11ZM11 22L12.6001 18L3.3999 18L5 22L11 22Z" fill={
                    dark ? '#fff' : '#000'
                  } opacity="1">
                </path>
              </g>
            </svg>
          </NavItem>
        </Nav>
      </Navbar.Collapse>
    </Navbar >
  )
}

// thanks to https://stackoverflow.com/a/42124328/2332101
export default withRouter(Header);
