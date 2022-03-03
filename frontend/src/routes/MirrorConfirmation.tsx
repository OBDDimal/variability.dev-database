import React, { Component } from 'react';
import api from '../services/api.service';
import { default as Modal } from '../components/Modal';

const API_URL = process.env.REACT_APP_DOMAIN;

type Props = {};
type State = {};
/**
* TODO:
* - Add loading bar while mirroring
* - Fix EsLint for this file
* - Rethink redirects here
* Problem: Github mirror takes to long for huge files (100 mb)
* */
export default class MirrorConfirmation extends Component<Props, State> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    const url = window.location.pathname;
    const confirmationCode = url.substring(url.lastIndexOf('/') + 1);

    api
      .get(`${API_URL}files/confirm/${confirmationCode}/`)
      .then((response) => {
        if (response.data.message === 'File mirrored to GitHub!') {
          Modal.fire({
            icon: 'success',
            title: 'Success!!',
            text: 'File mirrored to GitHub!',
          }).then(() => {
            window.location.replace('/files');
          });
        } else if (response.data.message === 'File already mirrored to GitHub!') {
          Modal.fire({
            icon: 'warning',
            title: 'Warning!!',
            text: 'File already mirrored to GitHub!',
          }).then(() => {
            window.location.replace('/login');
          });
        } else if (response.data.message === 'Request user is not file owner!') {
          Modal.fire({
            icon: 'error',
            title: 'Error!!',
            text: 'Request user is not file owner!',
          }).then(() => {
            window.location.replace('/login');
          });
        } else {
          Modal.fire({
            icon: 'error',
            title: 'Error!!',
            text: 'Token invalid',
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
