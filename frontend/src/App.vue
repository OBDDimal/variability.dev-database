<template>
  <v-app>
    <navigation title="ddueruem" />

    <v-main style="position: relative">
      <div class="mainView">
        <router-view />
      </div>
      <v-snackbar
        absolute
        v-model="$store.state.snackbar.show"
        elevation="8"
        :multi-line="true"
        :right="true"
        :top="true"
        :timeout="$store.state.snackbar.timeout"
        :color="$store.state.snackbar.variant"
      >
        {{ $store.state.snackbar.message }}
        <template v-slot:action="{ attrs }">
          <v-btn
            dark
            plain
            v-bind="attrs"
            @click="$store.commit('updateSnackbar', { show: false })"
          >
            &#10005;
          </v-btn>
        </template>
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script>
import Vue from "vue";
import Navigation from "./components/Navigation.vue";

export default Vue.extend({
  name: "App",

  components: {
    Navigation,
  },

  data: () => ({
    age: 23,
    list: ["im", "in", "ddueruem"],
  }),

  methods: {
    increment() {
      this.age++;
    },
  },
});
</script>

<style>
.mainView {
  margin-left: auto;
  margin-right: auto;
  padding-left: 30px;
  padding-right: 30px;
  max-width: 1280px !important;
}
</style>
