import authService from '@/services/auth.service'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

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
    }
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
    }
  },
  modules: {
  }
})
