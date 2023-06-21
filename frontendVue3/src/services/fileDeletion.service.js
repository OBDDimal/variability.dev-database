/*import api from './api.service';
import { default as Modal } from '../components/Modal';

const API_URL = process.env.VUE_APP_DOMAIN;

export default function deleteFile(id: string) {
  api.delete(`${API_URL}files/uploaded/unconfirmed/${id}/`)
    .then(() => {
      Modal.fire({
        icon: 'success',
        title: 'Success!!',
        text: 'File was deleted successfully',
      }).then(() => {
        window.location.replace('/');
      });
    })
    .catch((error) => {
      Modal.fire({
        icon: 'error',
        title: 'Error!!',
        text: JSON.stringify(error.message),
      }).then(() => {
        window.location.replace('/');
      });
    });
}
*/