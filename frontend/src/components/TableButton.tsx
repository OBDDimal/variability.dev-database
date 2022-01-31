import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button } from "react-bootstrap";
import { Modal } from "../components/Modal";
import api from "../services/api.service";

const API_URL = process.env.REACT_APP_DOMAIN;

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

  function clickHandler(e: React.MouseEvent) {
    if (props.method) {
      if (isOwner) {
        if (props.method === "delete") {
          Modal.fire({
            title: "Do you want to delete the resource?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
          }).then((result) => {
            if (result.isConfirmed) {
              api
                .delete(`${API_URL}${props.basePath}/${rowDataId}/`)
                .then(() => {
                  window.location.reload();
                })
                .catch((error) => {
                  Modal.fire({
                    title: "Error!!",
                    icon: "error",
                    text: JSON.stringify(error.message),
                  });
                });
            }
          });
        } else {
          window.location.replace(
            `/${props.basePath}/${props.method}/${rowDataId}`
          );
        }
      }
    } else {
      window.location.replace(`${props.basePath}/${rowDataId}`);
    }
  }

  return (
    <Button
      onClick={clickHandler}
      disabled={
        isOwner && props.method ? undefined : props.method ? true : undefined
      }
      variant={props.variant ?? "secondary"}
      type='button'
    >
      <FontAwesomeIcon icon={props.icon} />
    </Button>
  );
}
