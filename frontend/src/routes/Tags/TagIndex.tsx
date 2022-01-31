import React, { Component } from "react";
import api from "../../services/api.service";
import { reactFormatter, ReactTabulator } from "react-tabulator";
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/bootstrap/tabulator_bootstrap.min.css";
import { faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import TableButton from "../../components/TableButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Container, Row } from "react-bootstrap";

const API_URL = process.env.REACT_APP_DOMAIN;

type Props = {};

type State = {
  tags: [];
};

const columns = [
  { title: "Id", field: "id", width: 60 },
  { title: "Label", field: "label" },
  { title: "Description", field: "description", formatter: "textarea" },
  { title: "Public", field: "is_public", formatter: "tickCross" },
  {
    headerSort: false,
    formatter: reactFormatter(
      <TableButton
        variant='warning'
        method='edit'
        basePath='tags'
        icon={faPen}
      />
    ),
    width: 60,
    hozAlign: "center",
  },
  {
    headerSort: false,
    formatter: reactFormatter(
      <TableButton
        variant='danger'
        method='delete'
        basePath='tags'
        icon={faTrash}
      />
    ),
    width: 60,
    hozAlign: "center",
  },
];

export default class TagIndex extends Component {
  state: State = {
    tags: [],
  };

  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.getTags();
  }

  getTags = () => {
    api.get(API_URL + "tags/").then((response) => {
      this.setState({ tags: response.data });
    });
  };

  render() {
    return (
      <Container>
        <Row>
          <a href='/tags/create'>
            <Button variant='primary' type='button'>
              <FontAwesomeIcon icon={faPlus} />
            </Button>
          </a>
          <ReactTabulator
            layout='fitColumns'
            columns={columns}
            data={this.state.tags}
          />
        </Row>
      </Container>
    );
  }
}
