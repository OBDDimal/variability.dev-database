import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api.service";

const API_URL = process.env.REACT_APP_DOMAIN;

function File() {
  let { id } = useParams<"id">();
  const [state, setState] = useState("");

  useEffect(() => {
    api.get(`${API_URL}files/${id}/`).then((response) => {
      setState(JSON.stringify(response.data));
    });
  });

  return <div>{state}</div>;
}

export default File;
