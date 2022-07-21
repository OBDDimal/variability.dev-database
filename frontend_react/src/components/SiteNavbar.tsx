import {
  faBalanceScaleLeft,
  faEdit,
  faFile,
  faHome, faPeopleArrows, faSignInAlt, faSignOutAlt, faTags, faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import {
  Container, Nav, Navbar,
} from 'react-bootstrap';
import authService from '../services/auth.service';

type Props = {
  url: string;
};

type State = {
  loggedIn: boolean;
};

export default class SiteNavbar extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loggedIn: !!authService.getCurrentUser(),
    };
  }

  logout() {
    authService.logout();
    this.setState({ loggedIn: false });
  }

  render() {
    return (
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="/">DDueruem</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link
                className={this.props.url === '/' ? 'active' : ''}
                href="/"
              >
                <FontAwesomeIcon icon={faHome} />
                &nbsp;Home
              </Nav.Link>

              {this.state.loggedIn && (
                <Nav.Link
                  href="/profile"
                  className={this.props.url === '/profile' ? 'active' : ''}
                >
                  <FontAwesomeIcon icon={faUser} />
                  &nbsp;Profile
                </Nav.Link>
              )}

              {this.state.loggedIn && (
                <Nav.Link
                  href="/files"
                  className={this.props.url === '/files' ? 'active' : ''}
                >
                  <FontAwesomeIcon icon={faFile} />
                  &nbsp;Files
                </Nav.Link>
              )}

              {this.state.loggedIn && (
                <Nav.Link
                  href="/tags"
                  className={this.props.url === '/tags' ? 'active' : ''}
                >
                  <FontAwesomeIcon icon={faTags} />
                  &nbsp;Tags
                </Nav.Link>
              )}

              {this.state.loggedIn && (
                <Nav.Link
                  href="/families"
                  className={this.props.url === '/families' ? 'active' : ''}
                >
                  <FontAwesomeIcon icon={faPeopleArrows} />
                  &nbsp;Families
                </Nav.Link>
              )}

              <Nav.Link
                href="/dsgvo"
                className={`justify-content-end ${this.props.url === '/dsgvo' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faBalanceScaleLeft} />
                  &nbsp;DSGVO
              </Nav.Link>

              {/* <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Dummy</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">
                  Another action
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">
                  Something
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">
                  Separated link
                </NavDropdown.Item>
              </NavDropdown> */}

            </Nav>
            <Nav>
              {!this.state.loggedIn && (
                <Nav.Link
                  href="/register"
                  className={this.props.url === '/register' ? 'active' : ''}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  &nbsp;Register
                </Nav.Link>
              )}

              {!this.state.loggedIn && (
                <Nav.Link
                  href="/login"
                  className={this.props.url === '/login' ? 'active' : ''}
                >
                  <FontAwesomeIcon icon={faSignInAlt} />
                  &nbsp;Login
                </Nav.Link>
              )}

              {this.state.loggedIn && (
                <Nav.Link
                  href="/logout"
                  className={this.props.url === '/logout' ? 'active' : ''}
                  onClick={this.logout}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  &nbsp;Logout
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
}
