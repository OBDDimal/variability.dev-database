import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
    state: () => ({
        snackbar: {
            show: false,
            variant: 'success',
            timeout: 5000,
            message: '',
        },
        fileCreateAlert: {
            show: false,
            variant: 'success',
            message: '',
        },
        isOnline: true,
    }),
    actions: {
        updateSnackbar(message, variant, timeout, show) {
            this.snackbar.message = message;
            this.snackbar.variant = variant;
            this.snackbar.timeout = timeout;
            this.snackbar.show = show;
        },
        closeSnackbar() {
            this.snackbar.show = false;
        },
        updateFileCreateAlert(message, variant, show) {
            this.fileCreateAlert.message = message;
            this.fileCreateAlert.variant = variant;
            this.fileCreateAlert.show = show;
        },
        closeFileCreateAlert() {
            this.fileCreateAlert.show = false;
        },
        setOnlineState(isOnline) {
            this.isOnline = isOnline;
        },
    },
});
