import axios from "axios";

const API_URL = "http://localhost:8000/auth/";

class AuthService {
  login(email: string, password: string) {
    return axios
      .post(API_URL + "login/", {
        email,
        password,
      })
      .then((response) => {
        if (response.data.access && response.data.refresh) {
          localStorage.setItem("access", JSON.stringify(response.data.access));
          localStorage.setItem(
            "refresh",
            JSON.stringify(response.data.refresh)
          );
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        return response.data;
      });
  }

  logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    window.location.replace("/");
  }

  register(email: string, password: string) {
    return axios.post(API_URL + "register/", {
      email,
      password,
    });
  }

  getAccessToken() {
    const accessToken = localStorage.getItem("access");
    if (accessToken) return JSON.parse(accessToken);

    return null;
  }

  getRefreshToken() {
    const refreshToken = localStorage.getItem("refresh");
    if (refreshToken) return JSON.parse(refreshToken);

    return null;
  }

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);

    return null;
  }
}

export default new AuthService();
