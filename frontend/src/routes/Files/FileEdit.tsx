import React, { Component } from "react";
import { Container, Form, Row } from "react-bootstrap";
import Select from "react-select";
import api from "../../services/api.service.ts";

const API_URL = process.env.REACT_APP_DOMAIN;

type Props = {};

type State = {
  id?: number;
  file?: {
    label: string;
    description: string;
    new_version_of: number;
    tags: [
      {
        id: number;
        label: string;
        description: string;
      }
    ];
  };
  label?: string;
  description?: string;
  gottenTags: Array<{ label: string; value: string }>;
  gottenFiles: Array<{ value: number; label: string }>;
  newVersionOf?: string;
  tags?: string;
};

/**
 * This route is for editing uploaded files.
 * It is only visible for authenticated users.
 * @param {any} options description
 * @param {any} e description
 */
export default class FileEdit extends Component<Props, State> {
  /**
   * Constructor for the file edit form.
   * It fetches all files and tags.
   * @param {Props} props is not used.
   */
  constructor(props: Props | Readonly<Props>) {
    super(props);
    const url = window.location.pathname;
    const id = url.substring(url.lastIndexOf("/") + 1);

    api.get(`${API_URL}files/${id}/`).then((response) => {
      this.setState({ file: response.data });
      this.getNewVersionOf();
      this.getTags();
    });
  }

  state: State = {
    id: undefined,
    file: undefined,
    label: undefined,
    description: undefined,
    gottenTags: [],
    gottenFiles: [],
    newVersionOf: "---",
  };

  getTags = () => {
    api.get(`${API_URL}tags/`).then((response) => {
      let tags = response.data.results;
      tags = tags.map((tag: { id: number; label: string }) => ({
        value: tag.id,
        label: tag.label,
      }));
      this.setState({ gottenTags: tags });
    });
  };

  getNewVersionOf = () => {
    api.get(`${API_URL}files/`).then((response) => {
      let files = response.data.results;
      files = files.map((file: { id: number; label: string }) => ({
        value: file.id,
        label: file.label,
      }));
      this.setState({ gottenFiles: files });
    });
  };

  onTagChange = (options: any) => {
    this.setState({
      tags: options.map((option: any) => ({
        id: option.value,
        label: option.label,
      })),
    });
  };

  onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const label = e.target as HTMLInputElement;
    this.setState({ label: label.value });
  };

  onDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const description = e.target as HTMLInputElement;
    this.setState({ description: description.value });
  };

  onNewVersionOfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVersionOf = e.target as HTMLSelectElement;
    this.setState({ newVersionOf: newVersionOf.value });
  };

  /**
   * Render the file edit form.
   * @return {JSX} the form.
   */
  render() {
    return (
      <Container>
        <Row>
          <Form.Group className='mb-3'>
            <Form.Label>File name</Form.Label>
            <Form.Control
              data-testid='label'
              onChange={this.onLabelChange}
              placeholder='Leave a filename'
              value={this.state.file?.label}
            />
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>Description</Form.Label>
            <Form.Control
              data-testid='description'
              as='textarea'
              onChange={this.onDescriptionChange}
              placeholder='Leave a comment here'
              value={this.state.file?.description}
            />
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>New version of</Form.Label>
            <Form.Select
              onChange={this.onNewVersionOfChange}
              defaultValue={this.state.file?.new_version_of}
            >
              {this.state.gottenFiles.map((key) => (
                <option key={key.value} value={key.value}>
                  {key.value}:{key.label}
                </option>
              ))}
              <option key='---' value='---'>
                ---
              </option>
            </Form.Select>
            <Form.Group className='mb-3'>
              <Form.Label>Tags</Form.Label>
              <Select
                defaultValue={[this.state.gottenTags[0]]}
                isMulti
                onChange={this.onTagChange}
                options={this.state.gottenTags}
              />
            </Form.Group>
          </Form.Group>
        </Row>
      </Container>
    );
  }
}
