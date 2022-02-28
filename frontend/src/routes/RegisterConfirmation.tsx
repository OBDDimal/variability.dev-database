import React, { Component } from 'react';
import api from '../services/api.service';
import { default as Modal } from '../components/Modal';

const API_URL = process.env.REACT_APP_DOMAIN;

type Props = {};
type State = {};

export default class RegisterConfirmation extends Component<Props, State> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    const url = window.location.pathname;
    const confirmationCode = url.substring(url.lastIndexOf('/') + 1);

    api
      .get(`${API_URL}auth/register/confirm/${confirmationCode}/`)
      .then((response) => {
        if (response.data.user) {
          Modal.fire({
            icon: 'success',
            title: 'Success!!',
            text: 'Your account was confirmed',
          }).then(() => {
            window.location.replace('/login');
          });
        } else if (response.data.message === 'User is already activated!') {
          Modal.fire({
            icon: 'warning',
            title: 'Warning!!',
            text: 'Your code was already used!',
          }).then(() => {
            window.location.replace('/login');
          });
        } else {
          Modal.fire({
            icon: 'error',
            title: 'Error!!',
            text: 'The confirmation code is not valid',
          }).then(() => {
            window.location.replace('/login');
          });
        }
      })
      .catch(() => {
        Modal.fire({
          icon: 'error',
          title: 'Error!!',
          text: 'The confirmation code is not valid',
        }).then(() => {
          window.location.replace('/login');
        });
      });
  }

  render() {
    return <div />;
  }
}
