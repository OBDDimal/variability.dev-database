import React, { Component } from 'react';
import api from '../../services/api.service';
import { default as Modal } from '../../components/Modal';

const API_URL = process.env.REACT_APP_DOMAIN;

type Props = {};
type State = {};

export default class FileUploadConfirmation extends Component<Props, State> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    const url = window.location.pathname;
    const confirmationCode = url.substring(url.lastIndexOf('/') + 1);

    api
      .get(`${API_URL}files/uploaded/unconfirmed/confirm/${confirmationCode}/`)
      .then((response) => {
        if (response.data.file) {
          Modal.fire({
            icon: 'success',
            title: 'Success!!',
            text: 'Your file upload was confirmed',
          }).then(() => {
            window.location.replace('/');
          });
        } else if (response.data.message === 'File upload is already confirmed!') {
          Modal.fire({
            icon: 'warning',
            title: 'Warning!!',
            text: 'Your code was already used!',
          }).then(() => {
            window.location.replace('/');
          });
        } else {
          Modal.fire({
            icon: 'error',
            title: 'Error!!',
            text: 'The confirmation code is not valid',
          }).then(() => {
            window.location.replace('/');
          });
        }
      })
      .catch(() => {
        Modal.fire({
          icon: 'error',
          title: 'Error!!',
          text: 'The confirmation code is not valid',
        }).then(() => {
          window.location.replace('/');
        });
      });
  }

  render() {
    return <div />;
  }
}
