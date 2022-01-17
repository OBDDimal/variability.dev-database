import React, { Component } from "react";
import { Button, Form } from "react-bootstrap";
import { Modal } from "../components/Modal";
import AuthService from "../services/auth.service";

type Props = {};

type State = {
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  loading: boolean;
};

export default class Register extends Component<Props, State> {
  state: State = {
    email: undefined,
    password: undefined,
    passwordConfirmation: undefined,
    loading: false,
  };

  onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target as HTMLInputElement;
    this.setState({ email: email.value });
  };

  onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target as HTMLInputElement;
    this.setState({ password: password.value });
  };

  onPasswordConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const passwordConfirmation = e.target as HTMLInputElement;
    this.setState({ passwordConfirmation: passwordConfirmation.value });
  };

  isReady = () => {
    return (
      this.state.email &&
      this.state.password &&
      this.state.passwordConfirmation &&
      this.state.password === this.state.passwordConfirmation
    );
  };

  onSubmit = () => {
    if (
      this.state.email &&
      this.state.password &&
      this.state.passwordConfirmation &&
      this.state.password === this.state.passwordConfirmation
    ) {
      AuthService.register(
        this.state.email,
        this.state.password,
        this.state.passwordConfirmation
      ).then(
        () => {
          Modal.fire({
            icon: "success",
            title: "Register successful, please check your mail",
            toast: true,
            position: "top-right",
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          }).then(() => {
            window.location.replace("/");
          });
        },
        (error) => {
          this.setState({ loading: false });
          Modal.fire({
            icon: "error",
            title: "Error!!",
            text: `Something went wrong while registering! ${error.toString()}`,
          });
        }
      );
    }
  };

  render() {
    return (
      <div>
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
        <Form.Group className="mb-3">
          <Form.Label>Password Confirmation</Form.Label>
          <Form.Control
            type="password"
            onChange={this.onPasswordConfirmationChange}
          />
        </Form.Group>
        <Button
          variant="primary"
          type="button"
          disabled={!this.isReady() || this.state.loading ? true : undefined}
          onClick={this.onSubmit}
        >
          {this.state.loading && (
            <span className="spinner-border spinner-border-sm" />
          )}
          Register!
        </Button>
      </div>
    );
  }
}
