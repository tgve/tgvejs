/**
 * geoplumber R package code.
 */
import React from 'react';
import { Navbar, Nav, NavItem, MenuItem } from 'react-bootstrap';
import { Link, withRouter } from 'react-router-dom';

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
            <Link to="/">eAtlas</Link>
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
            <MenuItem href="https://github.com/layik/eAtlas">
              <i style={{ fontSize: '1.5em' }} className="fa fa-github"></i>
            </MenuItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

// thanks to https://stackoverflow.com/a/42124328/2332101
export default withRouter(Header);
