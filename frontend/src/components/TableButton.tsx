import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";

export default function TableButton(props: {
  cell?: { _cell: { row: { data: { id: string } } } };
  basePath: string;
  icon: IconDefinition;
}) {
  let rowDataId = "";
  if (props.cell) {
    rowDataId = props.cell._cell.row.data.id;
  }
  return (
    <Button
      variant='secondary'
      type='button'
      onClick={() => window.location.replace(`/${props.basePath}/${rowDataId}`)}
    >
      <FontAwesomeIcon icon={props.icon}></FontAwesomeIcon>
    </Button>
  );
}
