import authService from '@/services/auth.service'
import api from '@/services/api.service'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const API_URL = process.env.VUE_APP_DOMAIN;

export default new Vuex.Store({
  state: {
    snackbar: {
      show: false,
      variant: "success",
      timeout: 5000,
      message: ""
    },
    loggedIn: !!authService.getCurrentUser(),
    currentUser: authService.getCurrentUser(),
    accessToken: authService.getAccessToken(),
    tags: [],
    families: [],
    files: [],
  },
  actions: {
    logout({ commit }) {
      authService.logout();
      commit('setLogged')
      commit('setLoggedInUser')
      commit('setAccessToken')
      commit('updateSnackbar', { message: "Successfully logged out", variant: "success", timeout: 5000, show: true })
    },
    login({ commit }) {
      commit('setLogged')
      commit('setLoggedInUser')
      commit('setAccessToken')
      commit('updateSnackbar', { message: "Login successful!", variant: "success", timeout: 5000, show: true })
    },
    fetchTags({ commit }) {
      api.get(`${API_URL}tags/`).then((response) => {
        commit('setTags', { tags: response.data });
      });
    },
    fetchFamilies({ commit }) {
      api.get(`${API_URL}families/`).then((response) => {
        commit('setFamilies', { families: response.data });
      });
    },
    fetchFiles({ commit }) {
      api.get(`${API_URL}files/uploaded/confirmed/`).then((response) => {
        commit('setFiles', { files: response.data });
      });
    },
  },
  mutations: {
    updateSnackbar(state, payload) {
      const { message, variant, timeout, show } = payload
      state.snackbar.message = message
      state.snackbar.variant = variant
      state.snackbar.timeout = timeout
      state.snackbar.show = show
    },
    setLogged(state) {
      state.loggedIn = !!authService.getCurrentUser()
    },
    setLoggedInUser(state) {
      state.currentUser = authService.getCurrentUser()
    },
    setAccessToken(state) {
      state.accessToken = authService.getAccessToken()
    },
    setTags(state, payload) {
      const { tags } = payload
      state.tags = tags
    },
    setFamilies(state, payload) {
      const { families } = payload
      state.families = families
    },
    setFiles(state, payload) {
      const { files } = payload
      state.files = files
    }
  },
  modules: {
  }
})
