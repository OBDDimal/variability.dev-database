import React, {Component} from "react";
import api from "../../services/api.service";
import {reactFormatter, ReactTabulator} from "react-tabulator";
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/bootstrap/tabulator_bootstrap.min.css";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import TableButton from "../../components/TableButton";

const API_URL = process.env.REACT_APP_DOMAIN;

type Props = {};

type State = {
  tags: [];
};

const columns = [
  {title: "Id", field: "id"},
  {title: "Label", field: "label"},
  {title: "Description", field: "description"},
  {title: "Public", field: "is_public", formatter:"tickCross"},
  {
    formatter: reactFormatter(
      <TableButton basePath={"tags"} icon={faEye}/>
    ),
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
      this.setState({tags: response.data.results});
    });
  };

  render() {
    return (
      <ReactTabulator
        layout='fitColumns'
        columns={columns}
        data={this.state.tags}
      />
    );
  }
}
