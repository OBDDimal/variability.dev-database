import React, { Component } from "react";
import api from "../services/api.service";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const API_URL = process.env.REACT_APP_DOMAIN;

type Props = {};

type State = {};

export default class File extends Component<Props, State> {
  state: State = {};
}
