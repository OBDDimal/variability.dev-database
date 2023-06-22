import axios from 'axios';

const API_URL = `${import.meta.env.VITE_APP_DOMAIN}auth/`;

class AuthService {
    login(email, password) {
        return axios
            .post(`${API_URL}login/`, {
                email,
                password,
            })
            .then((response) => {
                if (response.data.access && response.data.refresh) {
                    localStorage.setItem(
                        'access',
                        JSON.stringify(response.data.access)
                    );
                    localStorage.setItem(
                        'refresh',
                        JSON.stringify(response.data.refresh)
                    );
                    localStorage.setItem(
                        'user',
                        JSON.stringify(response.data.user)
                    );
                }

                return response.data;
            });
    }

    logout() {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
    }

    register(email, password1, password2) {
        return axios.post(`${API_URL}register/`, {
            email,
            password1,
            password2,
        });
    }

    getAccessToken() {
        const accessToken = localStorage.getItem('access');
        if (accessToken) return JSON.parse(accessToken);

        return null;
    }

    getRefreshToken() {
        const refreshToken = localStorage.getItem('refresh');
        if (refreshToken) return JSON.parse(refreshToken);

        return null;
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);

        return null;
    }
}

export default new AuthService();
