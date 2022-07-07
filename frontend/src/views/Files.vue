<template>
  <div class="mainView">Files</div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  name: "Files",

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
