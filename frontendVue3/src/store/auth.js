import { defineStore } from 'pinia';
import authService from '@/services/auth.service';
import api from '@/services/api.service';
import { useAppStore } from '@/store/app';

const API_URL = import.meta.env.VITE_APP_DOMAIN;

export const useAuthStore = defineStore('auth', {
    state: () => ({
        loggedIn: !!authService.getCurrentUser(),
        currentUser: authService.getCurrentUser(),
        accessToken: authService.getAccessToken(),
    }),
    actions: {
        logout() {
            const appStore = useAppStore();

            authService.logout();
            this.loggedIn = !!authService.getCurrentUser();
            this.currentUser = authService.getCurrentUser();
            this.accessToken = authService.getAccessToken();
            appStore.updateSnackbar(
                'Successfully logged out',
                'success',
                5000,
                true
            );
        },
        login() {
            const appStore = useAppStore();

            this.loggedIn = !!authService.getCurrentUser();
            this.currentUser = authService.getCurrentUser();
            this.accessToken = authService.getAccessToken();
            appStore.updateSnackbar('Login Successful!', 'success', 5000, true);
        },
        async loginWithGithubRedirect() {
            const appStore = useAppStore();
            return api
                .post(`${API_URL}auth/github/redirect/`)
                .then((response) => {
                    return response.data.url;
                })
                .catch((error) => {
                    appStore.updateSnackbar(
                        'Error while connecting to GitHub: ' + error.message,
                        'error',
                        5000,
                        true
                    );
                    return error;
                });
        },
    },
});
