import React, { Component } from "react";
import api from "../../services/api.service";
import { reactFormatter, ReactTabulator } from "react-tabulator";
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/bootstrap/tabulator_bootstrap.min.css";
import { faEye, faPen, faPlus } from "@fortawesome/free-solid-svg-icons";
import TableButton from "../../components/TableButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";

const API_URL = process.env.REACT_APP_DOMAIN;

type Props = {};

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

const columns = [
  { title: "Id", field: "id", width: 60 },
  { title: "Label", field: "label" },
  { title: "Description", field: "description" },
  { title: "File", field: "local_file" },
  { title: "License", field: "license" },
  {
    title: "Tags",
    field: "tags",
    // TODO: Cosmetic update to display nice pills
    formatter: (cell: any) => {
      const cellValues = cell.getValue();
      const labels = cellValues.map((cellValue: { label: string }) => {
        return cellValue.label;
      });

      return labels.toString();
    },
  },
  { title: "Uploaded at", field: "uploaded_at" },
  {
    headerSort: false,
    formatter: reactFormatter(
      <TableButton variant='info' basePath={"files"} icon={faEye}></TableButton>
    ),
    width: 60,
    hozAlign: "center",
  },
  {
    headerSort: false,
    formatter: reactFormatter(
      <TableButton
        variant='warning'
        method='edit'
        basePath='files'
        icon={faPen}
      />
    ),
    width: 60,
    hozAlign: "center",
  },
];

export default class FileIndex extends Component<Props, State> {
  state: State = {
    files: [],
    columns: columns,
  };

  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.getFiles();
  }

  getFiles = () => {
    api.get(API_URL + "files/").then((response) => {
      this.setState({ files: response.data.results });
    });
  };

  render() {
    return (
      <>
        <a href='/files/create'>
          <Button variant='primary' type='button'>
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </a>
        <ReactTabulator
          layout='fitColumns'
          columns={columns}
          data={this.state.files}
        />
      </>
    );
  }
}
