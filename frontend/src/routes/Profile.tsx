import React, { Component } from 'react';
import { Row, Container } from 'react-bootstrap';
import AuthService from '../services/auth.service';

interface IUser {
  id?: any | null;
  email?: string;
  password?: string;
  roles?: Array<string>;
}

type Props = {};

type State = {
  currentUser: IUser & { accessToken: string };
};
export default class Profile extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentUser: { accessToken: '' },
    };
  }

  componentDidMount() {
    const currentUser = AuthService.getCurrentUser();

    if (!currentUser) window.location.replace('/');

    this.setState({ currentUser });
  }

  render() {
    const { currentUser } = this.state;

    return (
      <Container>
        <Row>
          <header>
            <h1>
              <strong>{currentUser.email}</strong>
              {' '}
              Profile
            </h1>
          </header>
          <main>
            <h4 className="text-decoration-underline">Token</h4>
            <p className="text-break">
              {AuthService.getAccessToken()}
            </p>
            <h4 className="text-decoration-underline">Id</h4>
            <p>
              {currentUser.id}
            </p>
            <h4 className="text-decoration-underline">Authorities</h4>
            <ul>
              {currentUser.roles
                && currentUser.roles.map((role, index) => (
                  <li key={index}>{role}</li>
                ))}
            </ul>
          </main>
        </Row>
      </Container>
    );
  }
}
