import {
  faSlash, faClock, faSpinner, faCheck, faTimes, faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button } from 'react-bootstrap';
import api from '../services/api.service';

const API_URL = process.env.REACT_APP_DOMAIN;

type Props = {
  cell?: { _cell: { value: string, row: { data: { id: string; owner: boolean } } } };
}

export default function AnalysesDisplay(props: Props) {
  let icon = faTimes;
  let permissionDenied = false;
  switch (props.cell?._cell.value) {
    case 'Permission denied':
      icon = faExclamationTriangle;
      permissionDenied = true;
      break;
    case 'Not started':
      icon = faSlash;
      break;
    case 'Queued':
      icon = faClock;
      break;
    case 'Working':
      icon = faSpinner;
      break;
    case 'Analyzed':
      icon = faCheck;
      break;
    default:
      icon = faTimes;
  }

  function onClickHandler() {
    const rowDataId = props.cell?._cell.row.data.id;
    api.post(`${API_URL}docker/`, { file_to_analyse: rowDataId, resources: '4-1', library: 'buddy' })
      .then(() => window.location.reload());
  }

  return (
    <Button
      onClick={onClickHandler}
      disabled={props.cell?._cell.value === 'Not started' ? undefined : true}
      type="button"
      variant={permissionDenied ? 'secondary' : 'success'}
    >
      <FontAwesomeIcon icon={icon} />
    </Button>
  );
}
