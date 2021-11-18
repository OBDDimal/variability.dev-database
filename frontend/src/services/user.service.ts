import axios, { AxiosRequestHeaders } from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8000/";

class UserService {
  getPublicContent() {
    return axios.get(API_URL + "user/");
  }

  getFileOverview() {
    return axios.get(API_URL + "files/", { headers: authHeader() });
  }
}

export default new UserService();
