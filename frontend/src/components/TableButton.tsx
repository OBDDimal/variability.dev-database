import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";

export default function TableButton(props: {
  cell?: { _cell: { row: { data: { id: string } } } };
  basePath: string;
  method?: string;
  variant?: string;
  icon: IconDefinition;
}) {
  let rowDataId = "";
  if (props.cell) {
    rowDataId = props.cell._cell.row.data.id;
  }
  return (
    <a
      href={
        props.method
          ? `/${props.basePath}/${props.method}/${rowDataId}`
          : `/${props.basePath}/${rowDataId}`
      }
    >
      <Button variant={props.variant || "secondary"} type='button'>
        <FontAwesomeIcon icon={props.icon} />
      </Button>
    </a>
  );
}
