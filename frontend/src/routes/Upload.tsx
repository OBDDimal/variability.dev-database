import React, { Component } from "react";
import { Button, Form } from "react-bootstrap";

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

  onSubmit = () => {
    if (this.state.file) {
      const data = new FormData();
      data.append("file", this.state.file);

      fetch("http://localhost:8000/core/files/", {
        mode: "no-cors",
        method: "POST",
        body: data,
      })
        .then((response) => response.json())
        .then((result) => {
          console.log("Success:", result);
        })
        .catch((error) => {
          console.log("Error:", error);
        });
    }
  };

  render() {
    return (
      <div>
        <Form.Group controlId='formFile' className='mb-3'>
          <Form.Label>File Upload</Form.Label>
          <Form.Control type='file' onChange={this.onFileChange} />
        </Form.Group>
        <Button
          type='button'
          disabled={this.state.file === undefined ? true : undefined}
          onClick={this.onSubmit}
        >
          Upload!
        </Button>
      </div>
    );
  }
}
