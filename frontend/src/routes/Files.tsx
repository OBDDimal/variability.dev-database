import React, { Component } from "react";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import "@inovua/reactdatagrid-community/index.css";
import "@inovua/reactdatagrid-community/theme/blue-light.css";
import api from "../services/api.service";
import { Container } from "react-bootstrap";

const API_URL = process.env.REACT_APP_DOMAIN;

type Props = {};

type State = {
  files: [];
};

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
      <Container className='files-container'>
        <ReactDataGrid
          style={{ height: "80vh" }}
          columns={[
            { name: "description", header: "Description" },
            { name: "file", header: "File" },
            { name: "license", header: "License" },
            { name: "uploaded_at", header: "Upload Date" },
          ]}
          dataSource={this.state.files}
          theme='blue-light'
        />
      </Container>
    );
  }
}
