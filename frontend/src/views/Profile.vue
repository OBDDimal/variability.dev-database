<template>
  <div
    class="mainView"
    v-if="$store.state.currentUser"
  >
    <div class="my-10 py-4 d-flex justify-center">
      <v-card outlined elevation="4" max-width="1000px">
        <v-card-title>
          <v-row align="center">
            <v-col cols="auto">
              <v-avatar
                  size="100"
                  color="primary"
                  class=""
              >
                <v-icon size="80" dark> mdi-account </v-icon>
              </v-avatar>
            </v-col>
            <v-col cols="auto">
              <h4 class="mb-2 text-h4">{{ $store.state.currentUser.email }}</h4>
              <h6 class="text-h6" v-if="$store.state.currentUser.institute === ''">Institute: None </h6>
              <h6 class="text-h6" v-else>
                Institute: {{ $store.state.currentUser.institute }}
              </h6>
            </v-col>
          </v-row>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text>
          <v-row align="center">
            <v-col cols="2">
              <h4>User since:</h4>
            </v-col>
            <v-col cols="10">
              <div style="word-break: break-all">
                {{ new Date($store.state.currentUser.date_joined).toLocaleString("en-US").substring(0, 9) }}
              </div>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col cols="2">
              <h4>Token:</h4>
            </v-col>
            <v-col cols="10">
              <div style="word-break: break-all">
                {{ $store.state.accessToken }}
              </div>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col cols="2">
              <h4>ID:</h4>
            </v-col>
            <v-col cols="9">
              <div style="word-break: break-all">{{ $store.state.currentUser.id }}</div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
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
