import React, { Component } from "react";
import api from "../services/api.service";
import { Button } from "react-bootstrap";
import { ReactTabulator, reactFormatter } from "react-tabulator";
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/bootstrap/tabulator_bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_DOMAIN;

type Props = {};

type State = {
  files: [];
};

function TableButton(props: any) {
  const rowData = props.cell._cell.row.data;
  return (
    <Button
      variant='secondary'
      type='button'
      onClick={() => window.location.replace(`/files/${rowData.id}`)}
    >
      <FontAwesomeIcon icon={faEye}></FontAwesomeIcon>
    </Button>
  );
}

const columns = [
  { title: "Id", field: "id" },
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
    formatter: reactFormatter(<TableButton></TableButton>),
  },
];

export default class Files extends Component<Props, State> {
  state: State = {
    files: [],
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
      <ReactTabulator
        layout='fitDataTable'
        columns={columns}
        data={this.state.files}
      ></ReactTabulator>
    );
  }
}
