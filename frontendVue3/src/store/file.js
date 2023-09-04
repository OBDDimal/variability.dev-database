import { defineStore } from 'pinia';
import api from '@/services/api.service';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';

const API_URL = import.meta.env.VITE_APP_DOMAIN;

export const useFileStore = defineStore('file', {
    state: () => ({
        tags: [],
        families: [],
        analysis: [],
        licenses: [],
        confirmedFeatureModels: [],
        myConfirmedFeatureModels: [],
        featureModels: [],
    }),
    getters: {
        myOwnTags(state) {
            return state.tags.filter((el) => el.owner);
        },
        myOwnFamilies(state) {
            return state.families.filter((el) => el.owner);
        },
    },
    actions: {
        fetchConfirmedFeatureModels() {
            //api.get(`${API_URL}files/uploaded/confirmed/`).then((response) => {
            api.get(`${API_URL}files/`).then((response) => {
                this.confirmedFeatureModels = response.data;
                console.log(response.data[0]);
            });
        },
        async fetchMyConfirmedFeatureModels() {
            const id = useAuthStore().currentUser.id;
            api.get(`${API_URL}files/uploaded/confirmed/?owner=` + id).then(
                (response) => {
                    this.myConfirmedFeatureModels = response.data;
                }
            );
        },
        async deleteFeatureModel(id) {
            const appStore = useAppStore();
            await api
                .delete(`${API_URL}files/${id}/`)
                .then(() => {
                    appStore.updateSnackbar(
                        'File deleted successfully!',
                        'success',
                        5000,
                        true
                    );
                })
                .catch((error) => {
                    appStore.updateSnackbar(
                        'Error: ' + error.message,
                        'error',
                        5000,
                        true
                    );
                });
        },
        async fetchFeatureModelOfFamily(value) {
            await api
                .get(`${API_URL}files/uploaded/confirmed/?family=${value}`)
                .then((response) => {
                    if (response.data.length === 0) {
                        return null;
                    } else {
                        return response.data;
                        /*this.numberOfModelsInFamily = response.data.length;
                        this.allVersions = response.data.map(
                            (item) => item.version
                        );
                        this.latestFeatureModelVersion =
                            response.data[response.data.length - 1].version;*/
                    }
                });
        },
        fetchLicenses() {
            api.get(`${API_URL}licenses/`).then((response) => {
                this.licenses = response.data;
            });
        },
        fetchTags() {
            api.get(`${API_URL}tags/`).then((response) => {
                this.tags = response.data;
            });
        },
        fetchFamilies() {
            api.get(`${API_URL}families/`).then((response) => {
                this.families = response.data;
            });
        },
        async uploadBulkFeatureModels(data) {
            const appStore = useAppStore();
          return await api
              .post(`${API_URL}bulk-upload/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
              })
              .then(() => {
                appStore.updateSnackbar(
                  'Upload successfully! Check your mails',
                  'success',
                  5000,
                  true
                );
                return true
              })
              .catch((error) => {
                appStore.updateSnackbar(
                  'Error! ' + error.message,
                  'error',
                  5000,
                  true
                );
                return false;
              });
        },
        async uploadZipFeatureModels(data) {
            const appStore = useAppStore();
          return api
              .post(`${API_URL}zip-upload/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
              })
              .then(() => {
                appStore.updateSnackbar(
                  'Upload successfully! Check your mails',
                  'success',
                  5000,
                  true
                );
                return true;
              })
              .catch((error) => {
                appStore.updateSnackbar(
                  'Error! ' + error.message,
                  'error',
                  5000,
                  true
                );
                return false;
              })
        },
        async uploadTag(payload) {
            // payload = { label, description, is_public }
            const appStore = useAppStore();
            return api
                .post(`${API_URL}tags/`, payload)
                .then((response) => {
                    appStore.updateFileCreateAlert(
                        `Successfully uploaded new tag '${payload.label}'`,
                        'success',
                        true
                    );
                    return response.data;
                })
                .catch((error) => {
                    appStore.updateFileCreateAlert(
                        'Error while uploading new tag: ' + error.message,
                        'error',
                        true
                    );
                    return error;
                });
        },
        async uploadFamily(payload) {
            // payload = { label, description }
            const appStore = useAppStore();
            return api
                .post(`${API_URL}families/`, payload)
                .then((response) => {
                    appStore.updateFileCreateAlert(
                        `Successfully uploaded new family '${payload.label}'`,
                        'success',
                        true
                    );
                    return response.data;
                })
                .catch((error) => {
                    console.log(error);
                    appStore.updateFileCreateAlert(
                        'Error while uploading new family: ' + error.message,
                        'error',
                        true
                    );
                    return error;
                });
        },
    },
});
