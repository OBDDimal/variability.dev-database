import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    snackbar: {
      show: false,
      variant: "success",
      message: ""
    },
  },
  mutations: {
    updateSnackbar(state, payload) {
      const { message, variant, show } = payload
      state.snackbar.message = message
      state.snackbar.variant = variant
      state.snackbar.show = show
    }
  },
  actions: {
  },
  modules: {
  }
})
