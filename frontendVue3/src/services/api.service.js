import axios from 'axios';
import authService from './auth.service';

const API_URL = import.meta.env.VITE_APP_DOMAIN;

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
        const changeConfig = config;
        if (token && changeConfig.headers) {
            changeConfig.headers.Authorization = `Bearer ${token}`;
        }

        return changeConfig;
    },
    // In case there is an error just pipe it through to the appropriate handler
    (error) => Promise.reject(error)
);

// Look at every answer from the API, in case it is unauthorized
// get another access token with the refresh token (Server -> Client)
instance.interceptors.response.use(
    // A fine response remains untouched
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        // Access key expired
        if (error.response && error.response.status === 401) {
            try {
                // Use axios not an instance to prevent infinite loops
                const response = await axios.post(`${API_URL}auth/refresh/`, {
                    refresh: authService.getRefreshToken(),
                });

                const accessToken = response.data.access;
                localStorage.setItem('access', JSON.stringify(accessToken));

                return instance(originalRequest);
            } catch (responseError) {
                // Refresh Token is also not valid anymore -> return to login
                // Also save the previously surfed URL to relocate to when logged in
                localStorage.setItem(
                    'previousURL',
                    `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search}`
                );

                authService.logout();
                window.location.replace('/login');
                return Promise.reject(error);
            }
        } else {
            return Promise.reject(error);
        }
    }
);

export default instance;
