import React, { Component } from 'react';
import {
  Button, Container, Form, Row,
} from 'react-bootstrap';
import AuthService from '../services/auth.service';
import { default as Modal } from '../components/Modal';

type Props = {};

type State = {
  email?: string;
  password?: string;
  loading: boolean;
};

export default class Login extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { email: undefined, password: undefined, loading: false };
  }

  onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target as HTMLInputElement;
    this.setState({ email: email.value });
  };

  onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target as HTMLInputElement;
    this.setState({ password: password.value });
  };

  isReady = () => this.state.email && this.state.password;

  onSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // Call to this.isReady() does not work, due to typescript checking
    if (this.state.email && this.state.password) {
      this.setState({ loading: true });

      AuthService.login(this.state.email, this.state.password).then(
        () => {
          Modal.fire({
            icon: 'success',
            title: 'Login successful',
            toast: true,
            position: 'top-right',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          }).then(() => {
            window.location.replace('/');
          });
        },
        (error) => {
          this.setState({ loading: false });
          Modal.fire({
            icon: 'error',
            title: 'Error!!',
            text: `Wrong login credentials! ${error.toString()}`,
          });
        },
      );
    }
  };

  render() {
    return (
      <Container>
        <Row>
          <form onSubmit={this.onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email"
                onChange={this.onEmailChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" onChange={this.onPasswordChange} />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              disabled={
                !this.isReady() || this.state.loading ? true : undefined
              }
            >
              {this.state.loading && (
                <span className="spinner-border spinner-border-sm" />
              )}
              Login!
            </Button>
          </form>
        </Row>
      </Container>
    );
  }
}
