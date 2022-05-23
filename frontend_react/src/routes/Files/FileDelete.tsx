import React, { Component } from 'react';
import deleteFile from '../../services/fileDeletion.service';

type Props = {};

type State = {};

export default class FileDelete extends Component<Props, State> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    const url = window.location.pathname;
    const id = url.substring(url.lastIndexOf('/') + 1);

    deleteFile(id);
  }

  render() {
    return <div />;
  }
}
