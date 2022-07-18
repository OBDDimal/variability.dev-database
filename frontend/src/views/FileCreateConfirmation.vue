<template>
  <div></div>
</template>

<script>
import Vue from "vue";
import api from "../services/api.service";

const API_URL = process.env.VUE_APP_DOMAIN;

export default Vue.extend({
  name: "FileCreateConfirmation",

  components: {},

  props: {},

  data: () => ({
    code: "",
  }),

  computed: {},

  methods: {
    confirm() {
      api
        .get(`${API_URL}files/uploaded/unconfirmed/confirm/${this.code}/`)
        .then((response) => {
          if (response.data.file) {
            this.$store.commit("updateSnackbar", {
              message: "File upload confirmed!",
              variant: "success",
              timeout: 5000,
              show: true,
            });
            this.$router.push("/");
          } else if (response.data.message === "File upload is already activated!") {
            this.$store.commit("updateSnackbar", {
              message: "Your confirmation code was already used!",
              variant: "warning",
              timeout: 5000,
              show: true,
            });
            this.$router.push("/");
          } else {
            this.$store.commit("updateSnackbar", {
              message: "Your confirmation code is not valid",
              variant: "error",
              timeout: 5000,
              show: true,
            });
            this.$router.push("/");
          }
        })
        .catch(() => {
          this.$store.commit("updateSnackbar", {
            message: "Your confirmation code is not valid",
            variant: "error",
            timeout: 5000,
            show: true,
          });
          window.location.replace("/");
        });
    },
  },

  mounted() {
    this.code = this.$route.params.confirmationCode;
    this.confirm();
  },
});
</script>

<style scoped></style>
