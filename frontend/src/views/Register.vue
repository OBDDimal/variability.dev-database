<template>
  <div class="mainView">
    <h3 class="text-h3 mb-2 mt-8 text-center">Register</h3>
    <h5 class="text-h5 mb-4 text-center">Create an account for ddueruem-web</h5>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="5">
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
          v-on:submit="onSubmit"
        >
          <v-text-field
            v-model="email"
            :rules="emailRules"
            label="E-mail"
            required
          ></v-text-field>

          <v-text-field
            v-model="password"
            :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="passwordRules"
            :type="show1 ? 'text' : 'password'"
            name="input-10-1"
            label="Password"
            hint="At least 8 characters"
            counter
            @click:append="show1 = !show1"
          >
          </v-text-field>

          <v-text-field
            v-model="passwordConfirmation"
            :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="passwordRules"
            :type="show2 ? 'text' : 'password'"
            name="input-10-1"
            label="Password"
            hint="At least 8 characters"
            counter
            @click:append="show2 = !show2"
          >
          </v-text-field>

          <p>
            By registering you accept our
            <router-link to="/dsgvo" target="_blank">DSGVO</router-link>
            (german language).
          </p>

          <v-btn
            :disabled="!isReady"
            color="primary"
            class="mr-4"
            :loading="loading"
            type="submit"
          >
            Register
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Vue from "vue";
import AuthService from "@/services/auth.service";

export default Vue.extend({
  name: "Register",

  components: {},

  props: {},

  data: () => ({
    email: "",
    password: "",
    passwordConfirmation: "",
    loading: false,

    valid: false,
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
    ],
    passwordRules: [
      (v) => !!v || "Required.",
      (v) => v.length >= 8 || "Min 8 characters",
      /* emailMatch: () => (`The email and password you entered don't match`), */
    ],
    show1: false,
    show2: false,
  }),

  computed: {
    isReady() {
      return (
        this.valid &&
        this.email != "" &&
        this.password != "" &&
        this.passwordConfirmation != ""
      );
    },
  },

  methods: {
    onSubmit(e) {
      e.preventDefault();
      if (
        this.email != "" &&
        this.password != "" &&
        this.passwordConfirmation != "" &&
        this.password === this.passwordConfirmation
      ) {
        this.loading = true;
        AuthService.register(
          this.email,
          this.password,
          this.passwordConfirmation
        ).then(
          () => {
            /* Modal.fire({
                            icon: 'success',
                            title: 'Register successful, please check your mail',
                            toast: true,
                            position: 'top-right',
                            showConfirmButton: false,
                            timer: 1500,
                            timerProgressBar: true,
                        }).then(() => {
                            window.location.replace('/login');
                        }); */
            this.loading = false;
            this.$store.commit("updateSnackbar", {
              message: "Please verify your mail address.",
              variant: "info",
              timeout: -1,
              show: true,
            });
            console.log("Success");
          },
          (error) => {
            /* Modal.fire({
                            icon: 'error',
                            title: 'Error!!',
                            text: `Something went wrong while registering! ${error.toString()}`,
                        }); */
            this.$store.commit("updateSnackbar", {
              message: "Error! " + error.response.data.email,
              variant: "error",
              show: true,
            });
            this.loading = false;
            console.log(error.response.data);
          }
        );
      } else {
        this.$store.commit("updateSnackbar", {
          message: "Passwords don't match!",
          variant: "warning",
          timeout: 5000,
          show: true,
        });
      }
    },
  },

  mounted() {
    if (this.$store.state.loggedIn && this.$store.state.currentUser) {
      this.$store.commit("updateSnackbar", {
        message: "User is already logged in",
        variant: "info",
        timeout: 5000,
        show: true,
      });
      this.$router.push("/");
    }
  },
});
</script>

<style scoped></style>
