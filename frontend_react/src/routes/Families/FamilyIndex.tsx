import React, { Component } from 'react';
import { reactFormatter, ReactTabulator } from 'react-tabulator';
import 'react-tabulator/lib/styles.css'; // default theme
import 'react-tabulator/css/bootstrap/tabulator_bootstrap.min.css';
import { faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Container, Row } from 'react-bootstrap';
import api from '../../services/api.service';
import TableButton from '../../components/TableButton';

const API_URL = process.env.REACT_APP_DOMAIN;

type Props = {};

type State = {
  families: [];
};

const columns = [
  { title: 'Id', field: 'id', width: 60 },
  { title: 'Label', field: 'label' },
  { title: 'Description', field: 'description', formatter: 'textarea' },
  { title: 'Owner', field: 'owner', formatter: 'tickCross' },
  {
    headerSort: false,
    formatter: reactFormatter(
      <TableButton
        variant="warning"
        method="edit"
        basePath="tags"
        icon={faPen}
      />,
    ),
    width: 60,
    hozAlign: 'center',
  },
];

export default class FamilyIndex extends Component<Props, State> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      families: [],
    };

    this.getTags();
  }

  getTags = () => {
    api.get(`${API_URL}families/`).then((response) => {
      this.setState({ families: response.data });
    });
  };

  render() {
    return (
      <Container>
        <Row>
          <a href="/families/create">
            <Button variant="primary" type="button">
              <FontAwesomeIcon icon={faPlus} />
            </Button>
          </a>
          <ReactTabulator
            layout="fitColumns"
            columns={columns}
            data={this.state.families}
          />
        </Row>
      </Container>
    );
  }
}
