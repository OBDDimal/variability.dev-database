import { useParams } from "react-router-dom";

function File() {
  let { id } = useParams<"id">();

  return <h3>{id}</h3>;
}

export default File;
