<template>
  <div
    class="mainView"
    v-if="$store.state.currentUser"
  >
    <div class="my-10 py-4" v-bind:class="[$vuetify.theme.dark ? 'profile-dark-card-color' : 'profile-light-card-color']" style="margin-right: 24rem; margin-left: 24rem">
      <v-row align="center" no-gutters>
        <v-col align="center" justify="center" cols="3">
          <v-avatar
            size="264"
            color="primary"
            class="mb-8 mt-4 mx-8"
          >
            <v-icon size="200"> mdi-account </v-icon>
          </v-avatar>
        </v-col>
        <v-col cols="6">
          <h1 class="mb-4">{{ $store.state.currentUser.email }}</h1>
          <h3 v-if="$store.state.currentUser.institute === ''"> None </h3>
          <h3 v-else>
            {{ $store.state.currentUser.institute }}
          </h3>
        </v-col>
      </v-row>
      <v-divider></v-divider>
      <v-row align="center" class="mx-8" no-gutters>
        <v-col class="my-8" cols="3">
          <h4>Token:</h4>
        </v-col>
        <v-col class="my-8" cols="9">
          <div style="word-break: break-all">
            {{ $store.state.accessToken }}
          </div>
        </v-col>
        <v-col class="my-8" cols="3">
          <h4>ID: </h4>
        </v-col>
        <v-col class="my-8" cols="9">
          <div style="word-break: break-all">{{ $store.state.currentUser.id }}</div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  name: "Profile",

  components: {},

  props: {},

  data: () => ({}),

  computed: {},

  methods: {},

  mounted() {
    if (!this.$store.state.loggedIn || !this.$store.state.currentUser) {
      this.$store.commit("updateSnackbar", {
        message: "Please log in to view this page",
        variant: "info",
        timeout: 5000,
        show: true,
      });
      this.$router.push("/login");
    }
  },
});
</script>

<style scoped>
  .profile-light-card-color {
    background-color: var(--v-primary-lighten5);
  }
  .profile-dark-card-color {
    background-color: var(--v-primary-darken4);
  }
</style>
