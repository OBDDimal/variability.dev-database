import React, { Component } from "react";
import api from "../services/api.service";
import { ReactTabulator, reactFormatter } from "react-tabulator";
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/bootstrap/tabulator_bootstrap.min.css";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import TableButton from "../components/TableButton";

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
    formatter: reactFormatter(
      <TableButton basePath={"files"} icon={faEye}></TableButton>
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
