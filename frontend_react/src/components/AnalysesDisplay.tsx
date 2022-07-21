import {
  faClock, faSpinner, faTimes, faExclamationTriangle, faFileAlt, faPlay,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button } from 'react-bootstrap';
import api from '../services/api.service';
import { default as Modal } from './Modal';

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
      icon = faPlay;
      break;
    case 'Queued':
      icon = faClock;
      break;
    case 'Working':
      icon = faSpinner;
      break;
    case 'Analyzed':
      icon = faFileAlt;
      break;
    default:
      icon = faTimes;
  }

  function onClickHandler() {
    const rowDataId = props.cell?._cell.row.data.id;
    if (props.cell?._cell.value === 'Not started') {
      api.post(`${API_URL}docker/`, { file_to_analyse: rowDataId, resources: '4-1', library: 'buddy' })
        .then(() => window.location.reload());
    } else if (props.cell?._cell.value === 'Analyzed') {
      api.get(`${API_URL}files/uploaded/confirmed/${rowDataId}/`)
        .then((response) => {
          Modal.fire({
            html: `<div><h2>Order</h2><textarea readonly rows="8" cols="35">${response.data.analysis.order}</textarea></div><div><h2>Report</h2><textarea readonly rows="8" cols="35">${response.data.analysis.report}</textarea></div>`,
          });
        });
    }
  }

  return (
    <Button
      onClick={onClickHandler}
      disabled={(props.cell?._cell.value === 'Not started') || (props.cell?._cell.value === 'Analyzed') ? undefined : true}
      type="button"
      variant={permissionDenied ? 'secondary' : 'success'}
    >
      <FontAwesomeIcon icon={icon} />
    </Button>
  );
}
