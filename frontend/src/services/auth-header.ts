import { AxiosRequestHeaders } from "axios";
import authService from "./auth.service";

export default function authHeader() {
  const user = authService.getCurrentUser();
  const accessToken = authService.getAccessToken();

  if (user && accessToken) {
    return { Authorization: "Bearer " + accessToken } as AxiosRequestHeaders;
  } else {
    return undefined;
  }
}
