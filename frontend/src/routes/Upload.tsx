import React, { Component } from "react";
import { Button, Form, FormControl, FormControlProps } from "react-bootstrap";

export default class upload extends Component {
  state = {
    file: undefined,
  };

  onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target as HTMLInputElement;
    if (file.files) {
      this.setState({ file: file.files[0] });
    }
  };

  render() {
    return (
      <div>
        <Form.Group controlId='formFile' className='mb-3'>
          <Form.Label>File Upload</Form.Label>
          <Form.Control type='file' onChange={this.onFileChange} />
        </Form.Group>
        <Button type='button'>Upload!</Button>
      </div>
    );
  }
}
