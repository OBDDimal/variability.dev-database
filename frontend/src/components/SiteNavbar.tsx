import React, { Component } from "react";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";

type MenuProps = {
  url: String;
};

export default class SiteNavbar extends Component<MenuProps> {
  render() {
    return (
      <Navbar bg='light' expand='lg'>
        <Container>
          <Navbar.Brand href='/'>DDueruem</Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='me-auto'>
              <Nav.Link
                className={this.props.url === "/" ? "active" : ""}
                href='/'
              >
                Home
              </Nav.Link>
              <Nav.Link
                href='/upload'
                className={this.props.url === "/upload" ? "active" : ""}
              >
                Upload
              </Nav.Link>
              <NavDropdown title='Dropdown' id='basic-nav-dropdown'>
                <NavDropdown.Item href='#action/3.1'>Dummy</NavDropdown.Item>
                <NavDropdown.Item href='#action/3.2'>
                  Another action
                </NavDropdown.Item>
                <NavDropdown.Item href='#action/3.3'>
                  Something
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href='#action/3.4'>
                  Separated link
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
}
