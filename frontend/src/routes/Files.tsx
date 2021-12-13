import React, { Component } from "react";
import api from "../services/api.service";
import { Button } from "react-bootstrap";
import { ReactTabulator, reactFormatter } from "react-tabulator";
import MultiValueFormatter from "react-tabulator/lib/formatters/MultiValueFormatter";
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/bootstrap/tabulator_bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoffee } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_DOMAIN;

type Props = {};

type State = {
  files: [];
};

const columns = [
  { title: "Id", field: "id" },
  { title: "Description", field: "description" },
  { title: "File", field: "local_file" },
  { title: "License", field: "license" },
  {
    title: "Tags",
    field: "tags",
    formatter: (cell: any) => {
      console.log(cell.getValue().label);

      return JSON.stringify(cell.getValue());
    },
    formatterParams: { style: "PILL" },
  },
  { title: "Uploaded at", field: "uploaded_at" },
  {
    formatter: reactFormatter(
      <Button variant='secondary' type='button'>
        <FontAwesomeIcon icon={faCoffee} />
      </Button>
    ),
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
