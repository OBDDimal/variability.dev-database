import React, { Component } from "react";
import { Button, Form } from "react-bootstrap";
import Select from "react-select";
import { Modal } from "../../components/Modal";
import api from "../../services/api.service";

const API_URL = process.env.REACT_APP_DOMAIN;

// Can't use enums because of iteration problems
const license = ["CC BY - Mention", "CC BY-NC - Mention - Non-commercial"];

type Props = {};

type State = {
  label: string;
  description?: string;
  file?: File;
  license: string;
  gottenTags: Array<{ key: string; value: string }>;
  gottenFiles: Array<{ value: number; label: string }>;
  newVersionOf: string;
  tags: string;
  loading: boolean;
  legalShare: boolean;
  userData: boolean;
  openSource: boolean;
};

export default class FileCreate extends Component<Props, State> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.getTags();
    this.getNewVersionOf();
  }

  state: State = {
    label: "",
    description: undefined,
    file: undefined,
    license: license[0],
    gottenTags: [],
    gottenFiles: [],
    tags: "",
    newVersionOf: "---",
    loading: false,
    legalShare: false,
    userData: false,
    openSource: false,
  };

  getTags = () => {
    api.get(API_URL + "tags/").then((response) => {
      let tags = response.data.results;
      tags = tags.map((tag: { id: number; label: string }) => {
        return { value: tag.id, label: tag.label };
      });
      this.setState({ gottenTags: tags });
    });
  };

  getNewVersionOf = () => {
    api.get(API_URL + "files/").then((response) => {
      let files = response.data.results;
      files = files.map((file: { id: number; label: string }) => {
        return { value: file.id, label: file.label };
      });
      this.setState({ gottenFiles: files });
    });
  };

  onTagChange = (options: any) => {
    this.setState({
      tags: options.map((option: any) => {
        return { id: option.value, label: option.label };
      }),
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

  onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target as HTMLInputElement;
    if (file.files) {
      this.setState({ file: file.files[0] });
    }
  };

  onNewVersionOfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVersionOf = e.target as HTMLSelectElement;
    this.setState({ newVersionOf: newVersionOf.value });
  };

  onLicenseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const license = e.target as HTMLSelectElement;
    this.setState({ license: license.value });
  };

  isReady = () => {
    return (
      this.state.tags &&
      this.state.label &&
      this.state.file &&
      this.state.description &&
      this.state.legalShare &&
      this.state.userData &&
      this.state.openSource
    );
  };

  onSubmit = () => {
    if (
      this.state.tags &&
      this.state.label &&
      this.state.file &&
      this.state.description &&
      this.state.legalShare &&
      this.state.userData &&
      this.state.openSource
    ) {
      const data = new FormData();

      data.append("label", this.state.label);
      data.append("description", this.state.description);
      data.append("local_file", this.state.file);
      data.append("license", this.state.license);
      if (this.state.newVersionOf !== "---") {
        data.append("new_version_of", this.state.newVersionOf);
      }
      data.append("tags", JSON.stringify(this.state.tags));

      api
        .post(`${API_URL}files/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((result) => {
          Modal.fire({
            icon: "success",
            title: "Success!!",
            text: JSON.stringify(result.data),
          }).then(() => {
            window.location.reload();
          });
        })
        .catch((error) => {
          Modal.fire({
            icon: "error",
            title: "Error!!",
            text: JSON.stringify(error.message),
          });
        });
    }
  };

  render() {
    return (
      <div>
        <Form.Group className="mb-3">
          <Form.Label>File name</Form.Label>
          <Form.Control
            data-testid="label"
            onChange={this.onLabelChange}
            placeholder="Leave a filename"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            data-testid="description"
            as="textarea"
            onChange={this.onDescriptionChange}
            placeholder="Leave a comment here"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>File Upload</Form.Label>
          <Form.Control
            data-testid="file-upload"
            type="file"
            onChange={this.onFileChange}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>License</Form.Label>
          <Form.Select onChange={this.onLicenseChange}>
            {license.map((key) => {
              return (
                <option key={key} value={key}>
                  {key}
                </option>
              );
            })}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>New version of</Form.Label>
          <Form.Select
            onChange={this.onNewVersionOfChange}
            defaultValue={"---"}
          >
            {this.state.gottenFiles.map((key) => {
              return (
                <option key={key.value} value={key.value}>
                  {key.value}: {key.label}
                </option>
              );
            })}
            <option key="---" value="---">
              ---
            </option>
          </Form.Select>
        </Form.Group>
        <Form.Group data-testid="tag-form" className="mb-3">
          <Form.Label htmlFor="tags">Tags</Form.Label>
          <Select
            isMulti
            name="tags"
            inputId="tags"
            onChange={this.onTagChange}
            options={this.state.gottenTags}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check
            data-testid="legal-share"
            type="checkbox"
            checked={this.state.legalShare}
            onChange={() =>
              this.setState({ legalShare: !this.state.legalShare })
            }
            id="legal-share"
            label="I am legally allowed to share this model"
          />
          <Form.Check
            data-testid="user-data"
            type="checkbox"
            checked={this.state.userData}
            onChange={() => this.setState({ userData: !this.state.userData })}
            id="user-data"
            label="My email and a date will always be tied to the file upload (even after account deletion)"
          />
          <Form.Check
            data-testid="open-source"
            type="checkbox"
            checked={this.state.openSource}
            onChange={() =>
              this.setState({ openSource: !this.state.openSource })
            }
            id="open-source"
            label="All information will be published according to your chosen license"
          />
        </Form.Group>
        <Button
          variant="primary"
          type="button"
          disabled={!this.isReady() ? true : undefined}
          onClick={this.onSubmit}
        >
          {this.state.loading && (
            <span className="spinner-border spinner-border-sm" />
          )}
          Upload!
        </Button>
      </div>
    );
  }
}
