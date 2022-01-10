import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api.service";

const API_URL = process.env.REACT_APP_DOMAIN;

function FileShow() {
  const { id } = useParams<"id">();
  const [state, setState] = useState("");

  useEffect(() => {
    api.get(`${API_URL}files/${id}/`).then((response) => {
      setState(JSON.stringify(response.data));
    });
  });

  return <div>{state}</div>;
}

export default FileShow;
