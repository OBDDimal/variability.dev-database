<template>
    <div class="mainView">
        <h3 class="text-h3 mb-2 mt-8 text-center">Login</h3>
        <h5 class="text-h5 mb-4 text-center">
            Or
            <router-link to="/register">create an account</router-link>
            instead
        </h5>
        <v-row align="center" justify="center">
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
                        counter
                        hint="At least 8 characters"
                        label="Password"
                        name="input-10-1"
                        @click:append="show1 = !show1"
                    >
                    </v-text-field>

                    <v-btn
                        :disabled="!isReady"
                        :loading="loading"
                        class="mr-4"
                        color="primary"
                        type="submit"
                    >
                        Login
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
    name: "Login",

    components: {},

    props: {},

    data: () => ({
        email: "",
        password: "",
        loading: false,

        valid: false,
        emailRules: [
            (v) => v.length > 0,
            (v) => !!v || "E-mail is required",
            (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
        ],
        passwordRules: [
            (v) => !!v || "Required.",
            (v) => v.length >= 8 || "Min 8 characters",
            /* emailMatch: () => (`The email and password you entered don't match`), */
        ],
        show1: false,
        prevRoute: "/",
    }),

    computed: {
        isReady() {
            return this.valid && this.email !== "" && this.password !== "";
        },
    },

    beforeRouteEnter(_to, from, next) {
        next((vm) => {
            vm.prevRoute = from.path;
        });
    },

    methods: {
        onSubmit(e) {
            e.preventDefault();
            // Call to this.isReady() does not work, due to typescript checking
            if (this.email !== "" && this.password !== "") {
                this.loading = true;

                AuthService.login(this.email, this.password).then(
                    () => {
                        /* Modal.fire({
                                        icon: 'success',
                                        title: 'Login successful',
                                        toast: true,
                                        position: 'top-right',
                                        showConfirmButton: false,
                                        timer: 1500,
                                        timerProgressBar: true,
                                    }).then(() => {
                                        // Check for saved URLS, relocate and wipe them
                                        const newUrl = localStorage.getItem('previousURL');
                                        if (newUrl) {
                                            localStorage.removeItem('previousURL');
                                            window.location.replace(newUrl);
                                        } else {
                                            window.location.replace('/');
                                        }
                                    }); */
                        console.log(this.prevRoute);
                        this.$store.dispatch("login");
                        this.$router.push(this.prevRoute);
                        this.loading = false;
                    },
                    (error) => {
                        console.log(error.response.data);
                        this.$store.commit("updateSnackbar", {
                            message: "Login not successful: " + error.response.data.detail,
                            variant: "error",
                            timeout: 5000,
                            show: true,
                        });
                        this.loading = false;
                    }
                );
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
