<template>
  <div
    class="mainView"
    v-if="$store.state.currentUser"
    style="word-break: break-all"
  >
    <h3 class="text-h3 mb-2 mt-8">Profile</h3>
    <h5 class="text-h5 mb-4">{{ $store.state.currentUser.email }}</h5>
    <v-divider></v-divider>
    <h6 class="text-h6 mt-4">Token</h6>
    {{ $store.state.accessToken }}
    <h6 class="text-h6 mt-4">ID</h6>
    {{ $store.state.currentUser.id }}
    <h6 class="text-h6 mt-4">Authorities</h6>
    <span v-if="$store.state.currentUser.institute === ''"> None </span>
    <span v-else>
      {{ $store.state.currentUser.institute }}
    </span>
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

<style scoped></style>
