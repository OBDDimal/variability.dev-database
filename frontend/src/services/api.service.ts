import axios from 'axios';
import authService from './auth.service';

const API_URL = process.env.REACT_APP_DOMAIN;

// axios instance for checking if token is (still) valid.
const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Send the authorization header with every request, but only if auth code exists (Client -> Server)
// Enhance all requests to server with auth header
instance.interceptors.request.use(
    (config) => {
      const token = authService.getAccessToken();

      if (token && config.headers) {
        config.headers['Authorization'] = 'Bearer ' + token;
      }

      return config;
    },
    // In case there is an error just pipe it through to the appropriate handler
    (error) => {
      return Promise.reject(error);
    },
);

// Look at every answer from the API, in case it is unauthorized get another access token with the refresh token (Server -> Client)
instance.interceptors.response.use(
    // A fine response remains untouched
    (res) => {
      return res;
    },
    async (error) => {
      const originalRequest = error.config;

      // Access key expired
      if (error.response && error.response.status === 401) {
        try {
        // Use axios not an instance to prevent infinite loops
          const response = await axios.post(API_URL + 'auth/refresh/', {
            refresh: authService.getRefreshToken(),
          });

          const accessToken = response.data.access;
          localStorage.setItem('access', JSON.stringify(accessToken));

          return instance(originalRequest);
        } catch (responseError) {
        // Refresh Token is also not valid anymore -> return to login
          authService.logout();
          window.location.replace('/login');
        }
      } else {
        return Promise.reject(error);
      }
    },
);

export default instance;
