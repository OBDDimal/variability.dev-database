import React, { Component } from 'react';
import { reactFormatter, ReactTabulator } from 'react-tabulator';
import 'react-tabulator/lib/styles.css'; // default theme
import 'react-tabulator/css/bootstrap/tabulator_bootstrap.min.css';
import { faEye, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Container, Row } from 'react-bootstrap';
import api from '../../services/api.service';
import TableButton from '../../components/TableButton';

const API_URL = process.env.REACT_APP_DOMAIN;

type Props = {
  readonly?: boolean;
};

type State = {
  files:
    | [
        {
          id: number;
          label: string;
          description: string;
          license: string;
          tags: [];
          owner: boolean;
          uploaded_at: string;
        }
      ]
    | [];
  columns: Array<any>;
};

export default class FileIndex extends Component<Props, State> {
  columns = [
    { title: 'Id', field: 'id', width: 60 },
    { title: 'Label', field: 'label' },
    { title: 'Description', field: 'description', formatter: 'textarea' },
    { title: 'License', field: 'license' },
    {
      title: 'Tags',
      field: 'tags',
      // TODO: Cosmetic update to display nice pills
      formatter: (cell: any) => {
        const cellValues = cell.getValue();
        const labels = cellValues.map(
          (cellValue: { label: string }) => cellValue.label,
        );

        return labels.toString();
      },
    },
    { title: 'Uploaded at', field: 'uploaded_at' },
    {
      headerSort: false,
      formatter: reactFormatter(
        <TableButton variant="info" basePath="files" icon={faEye} />,
      ),
      width: 60,
      hozAlign: 'center',
    },
  ];

  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = { files: [], columns: [] };
    // Check for readonly property
    if (!props.readonly) {
      const editButton = {
        headerSort: false,
        formatter: reactFormatter(
          <TableButton
            variant="warning"
            method="edit"
            basePath="files"
            icon={faPen}
          />,
        ),
        width: 60,
        hozAlign: 'center',
      };

      this.columns.push(editButton);
    }

    this.getFiles();
  }

  getFiles = () => {
    api.get(`${API_URL}files/`).then((response) => {
      this.setState({ files: response.data });
    });
  };

  render() {
    return (
      <Container>
        <Row>
          {!this.props.readonly && (
            <a href="/files/create">
              <Button variant="primary" type="button">
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </a>
          )}
          <ReactTabulator
            layout="fitColumns"
            columns={this.state.columns}
            data={this.state.files}
          />
        </Row>
      </Container>
    );
  }
}
