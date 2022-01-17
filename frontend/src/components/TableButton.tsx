import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";

export default function TableButton(props: {
  cell?: { _cell: { row: { data: { id: string; owner: boolean } } } };
  basePath: string;
  method?: string;
  variant?: string;
  icon: IconDefinition;
}) {
  let rowDataId = "";
  let isOwner = false;
  if (props.cell) {
    rowDataId = props.cell._cell.row.data.id;
    isOwner = props.cell._cell.row.data.owner;
  }
  return (
    <a
      href={
        isOwner && props.method
          ? isOwner
            ? `/${props.basePath}/${props.method}/${rowDataId}`
            : "#"
          : props.method
          ? `/${props.basePath}/${props.method}/${rowDataId}`
          : `/${props.basePath}/${rowDataId}`
      }
    >
      <Button
        disabled={
          isOwner && props.method ? undefined : props.method ? true : undefined
        }
        variant={props.variant ?? "secondary"}
        type='button'
      >
        <FontAwesomeIcon icon={props.icon} />
      </Button>
    </a>
  );
}
