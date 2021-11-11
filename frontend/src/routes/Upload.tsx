import React, { Component } from "react";
import { Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/*
enum license {
  cc_by = "CC BY - Mention",
  cc_by_nc = "CC BY-NC - Mention - Non-commercial",
}
*/

const license = ["CC BY - Mention", "CC BY-NC - Mention - Non-commercial"];

type UploadState = {
  description: string;
  file: string;
  license: string;
};

export default class upload extends Component {
  state: UploadState = {
    description: "",
    file: "",
    license: license[0],
  };

  onDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const description = e.target as HTMLInputElement;
    if (description.value !== "") {
      this.setState({ description: description.value });
    }
  };

  onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target as HTMLInputElement;
    if (file.files) {
      this.setState({ file: file.files[0] });
    }
  };

  isReady = () => {
    return this.state.file !== "" && this.state.description !== "";
  };

  onSubmit = () => {
    if (this.isReady()) {
      const data = new FormData();
      const headers = new Headers();

      headers.set("Authorization", "Basic " + btoa("admin:admin"));
      data.append("description", this.state.description);
      data.append("file", this.state.file);
      data.append("license", this.state.license);

      fetch("http://localhost:8000/core/files/", {
        headers: headers,
        method: "POST",
        body: data,
      })
        .then((response) => response.json())
        .then((result) => {
          MySwal.fire({
            icon: "success",
            title: "Success!!",
            text: JSON.stringify(result),
          }).then(() => {
            window.location.reload();
          });
        })
        .catch((error) => {
          MySwal.fire({
            icon: "error",
            title: "Error!!",
            text: "Please review your form, for non filled fields",
          });
        });
    }
  };

  render() {
    return (
      <div>
        <Form.Group className='mb-3'>
          <Form.Label>Description</Form.Label>
          <Form.Control
            as='textarea'
            onChange={this.onDescriptionChange}
            placeholder='Leave a comment here'
          />
        </Form.Group>
        <Form.Group controlId='formFile' className='mb-3'>
          <Form.Label>File Upload</Form.Label>
          <Form.Control type='file' onChange={this.onFileChange} />
        </Form.Group>
        <Form.Group>
          <Form.Label>License</Form.Label>
          <Form.Select aria-label='Default select example'>
            {license.map((key) => {
              return (
                <option key={key} value={key}>
                  {key}
                </option>
              );
            })}
          </Form.Select>
        </Form.Group>
        <Button
          variant='primary'
          type='button'
          disabled={this.isReady() === false ? true : undefined}
          onClick={this.onSubmit}
        >
          Upload!
        </Button>
      </div>
    );
  }
}
