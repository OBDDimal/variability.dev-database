import React, {Component} from 'react';
import FileIndex from './Files/FileIndex';

export default class Home extends Component {
  render() {
    return (
      <>
        <h2>Welcome to DDueruem</h2>
        <p>
          A web service for sharing feature model instances and collaborative
          benchmarking.
        </p>
        <FileIndex readonly></FileIndex>
      </>
    );
  }
}
