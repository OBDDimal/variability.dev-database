import authService from '@/services/auth.service';
import api from '@/services/api.service';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const API_URL = process.env.VUE_APP_DOMAIN;

export default new Vuex.Store({
    state: {
        snackbar: {
            show: false,
            variant: 'success',
            timeout: 5000,
            message: '',
        },
        loggedIn: !!authService.getCurrentUser(),
        currentUser: authService.getCurrentUser(),
        accessToken: authService.getAccessToken(),
        tags: [],
        families: [],
        licenses: [],
        files: [],
        featureModels: [],
        searchedNodes: '',
        openConstraints: false,
    },
    actions: {
        logout({commit}) {
            authService.logout();
            commit('setLogged');
            commit('setLoggedInUser');
            commit('setAccessToken');
            commit('updateSnackbar', {
                message: 'Successfully logged out',
                variant: 'success',
                timeout: 5000,
                show: true,
            });
        },
        login({commit}) {
            commit('setLogged');
            commit('setLoggedInUser');
            commit('setAccessToken');
            commit('updateSnackbar', {
                message: 'Login successful!',
                variant: 'success',
                timeout: 5000,
                show: true,
            });
        },
        fetchTags({commit}) {
            api.get(`${API_URL}tags/`).then((response) => {
                commit('setTags', {tags: response.data});
            });
        },
        fetchFamilies({commit}) {
            api.get(`${API_URL}families/`).then((response) => {
                commit('setFamilies', {families: response.data});
            });
        },
        fetchLicenses({commit}) {
            api.get(`${API_URL}licenses/`).then((response) => {
                commit('setLicenses', {licenses: response.data});
            });
        },
        fetchFiles({commit}) {
            api.get(`${API_URL}files/uploaded/confirmed/`).then((response) => {
                commit('setFiles', {files: response.data});
            });
        },
        fetchFeatureModels({commit}) {
            api.get(`${API_URL}files/`).then((response) => {
                commit('setFeatureModels', {featureModels: response.data});
            });
        },
        async uploadFeatureModel({commit}, data) {
            return await api
                .post(`${API_URL}files/`, data, {
                    headers: {"Content-Type": "multipart/form-data"},
                })
                .then(() => {
                    commit("updateSnackbar", {
                        message: "File uploaded successfully! Check your mails",
                        variant: "success",
                        timeout: 5000,
                        show: true,
                    });
                })
                .catch((error) => {
                    commit("updateSnackbar", {
                        message: "Error: " + error.message,
                        variant: "error",
                        timeout: 5000,
                        show: true,
                    });
                });
        },
        async uploadFamily({commit}, payload) {
            // payload = { label: this.family, description: this.newFamilyDescription }
            return await api
                .post(`${API_URL}families/`, payload)
                .then((response) => {
                    return response.data
                })
                .catch((error) => {
                    commit("updateSnackbar", {
                        message: "Error while creating new family: " + error.message,
                        variant: "error",
                        timeout: 5000,
                        show: true,
                    });
                    return error
                });
        },
        async uploadTag({commit}, payload) {
            // payload = { label: "", description: "", is_public: false }
            return await api
                .post(`${API_URL}tags/`, payload)
                .then((response) => {
                    return response.data
                })
                .catch((error) => {
                    commit("updateSnackbar", {
                        message: "Error while uploading new tag: " + error.message,
                        variant: "error",
                        timeout: 5000,
                        show: true,
                    });
                    return error
                });
        }
    },
    mutations: {
        updateSnackbar(state, payload) {
            const {message, variant, timeout, show} = payload;
            state.snackbar.message = message;
            state.snackbar.variant = variant;
            state.snackbar.timeout = timeout;
            state.snackbar.show = show;
        },
        setLogged(state) {
            state.loggedIn = !!authService.getCurrentUser();
        },
        setLoggedInUser(state) {
            state.currentUser = authService.getCurrentUser();
        },
        setAccessToken(state) {
            state.accessToken = authService.getAccessToken();
        },
        setTags(state, payload) {
            const {tags} = payload;
            state.tags = tags;
        },
        setFamilies(state, payload) {
            const {families} = payload;
            state.families = families;
        },
        setLicenses(state, payload) {
            const {licenses} = payload;
            state.licenses = licenses;
        },
        setFiles(state, payload) {
            const {files} = payload;
            state.files = files;
        },
        setFeatureModels(state, payload) {
            const {featureModels} = payload;
            state.featureModels = featureModels;
        },
        openConstraints(state, open) {
            state.openConstraints = open;
        },
    },
    modules: {},
});
