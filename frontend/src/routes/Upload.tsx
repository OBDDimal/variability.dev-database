import React, { Component } from "react";
import { Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import api from "../services/api.service";

const MySwal = withReactContent(Swal);

// Can't use enums because of iteration problems
const license = ["CC BY - Mention", "CC BY-NC - Mention - Non-commercial"];

type Props = {};

type State = {
  description?: string;
  file?: File;
  license: string;
  loading: boolean;
  legalShare: boolean;
  userData: boolean;
  openSource: boolean;
};

export default class upload extends Component<Props, State> {
  state: State = {
    description: undefined,
    file: undefined,
    license: license[0],
    loading: false,
    legalShare: false,
    userData: false,
    openSource: false,
  };

  onDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const description = e.target as HTMLInputElement;
    this.setState({ description: description.value });
  };

  onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target as HTMLInputElement;
    if (file.files) {
      this.setState({ file: file.files[0] });
    }
  };

  isReady = () => {
    return (
      this.state.file &&
      this.state.description &&
      this.state.legalShare &&
      this.state.userData &&
      this.state.openSource
    );
  };

  onSubmit = () => {
    if (
      this.state.file &&
      this.state.description &&
      this.state.legalShare &&
      this.state.userData &&
      this.state.openSource
    ) {
      const data = new FormData();

      data.append("description", this.state.description as string);
      data.append("file", this.state.file as File);
      data.append("license", this.state.license);

      api
        .post(`${process.env.REACT_ENV_DOMAIN}files/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((result) => {
          MySwal.fire({
            icon: "success",
            title: "Success!!",
            text: JSON.stringify(result),
          }).then(() => {
            document
              .querySelectorAll("textarea, input[type=file]")
              .forEach((e: Element) => {
                console.log(e);
                const element = e as HTMLInputElement;
                element.value = "";
              });
            this.setState({
              description: undefined,
              file: undefined,
              license: license[0],
              loading: false,
              legalShare: false,
              userData: false,
              openSource: false,
            });
          });
        })
        .catch((error) => {
          MySwal.fire({
            icon: "error",
            title: "Error!!",
            text: JSON.stringify(error),
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
        <Form.Group className='mb-3'>
          <Form.Label>File Upload</Form.Label>
          <Form.Control type='file' onChange={this.onFileChange} />
        </Form.Group>
        <Form.Group className='mb-3'>
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
        <Form.Group className='mb-3'>
          <Form.Check
            type='checkbox'
            checked={this.state.legalShare}
            onChange={() =>
              this.setState({ legalShare: !this.state.legalShare })
            }
            id='legal-share'
            label='I am legally allowed to share this model'
          />
          <Form.Check
            type='checkbox'
            checked={this.state.userData}
            onChange={() => this.setState({ userData: !this.state.userData })}
            id='user-data'
            label='My email and a date will always be tied to the file upload (even after account deletion)'
          />
          <Form.Check
            type='checkbox'
            checked={this.state.openSource}
            onChange={() =>
              this.setState({ openSource: !this.state.openSource })
            }
            id='open-source'
            label='All information will be published according to your chosen license'
          />
        </Form.Group>
        <Button
          variant='primary'
          type='button'
          disabled={!this.isReady() ? true : undefined}
          onClick={this.onSubmit}
        >
          {this.state.loading && (
            <span className='spinner-border spinner-border-sm' />
          )}
          Upload!
        </Button>
      </div>
    );
  }
}
