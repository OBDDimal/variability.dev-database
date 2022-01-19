import { Component } from "react";
import { Button, Container, Form, Row } from "react-bootstrap";
import { Modal } from "../../components/Modal";
import api from "../../services/api.service";

const API_URL = process.env.REACT_APP_DOMAIN;

type Props = {};

type State = {
  label?: string;
  description?: string;
  loading: boolean;
};

export default class TagCreate extends Component<Props, State> {
  state: State = {
    label: undefined,
    description: undefined,
    loading: false,
  };

  onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const label = e.target as HTMLInputElement;
    this.setState({ label: label.value });
  };

  onDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const description = e.target as HTMLInputElement;
    this.setState({ description: description.value });
  };

  isReady = () => {
    return this.state.label && this.state.description;
  };

  onSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (this.state.label && this.state.description) {
      this.setState({ loading: true });

      api
        .post(`${API_URL}tags/`, this.state)
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
          this.setState({ loading: false });
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
      <Container>
        <Row>
          <form onSubmit={this.onSubmit}>
            <Form.Group className='mb-3'>
              <Form.Label>Tag name</Form.Label>
              <Form.Control
                data-testid='label'
                onChange={this.onLabelChange}
                placeholder='Leave a tagname'
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                data-testid='description'
                as='textarea'
                onChange={this.onDescriptionChange}
                placeholder='Leave a comment here'
              />
            </Form.Group>
            <Button
              variant='primary'
              type='submit'
              disabled={
                !this.isReady() || this.state.loading ? true : undefined
              }
            >
              {this.state.loading && (
                <span className='spinner-border spinner-border-sm' />
              )}
              Create!
            </Button>
          </form>
        </Row>
      </Container>
    );
  }
}
