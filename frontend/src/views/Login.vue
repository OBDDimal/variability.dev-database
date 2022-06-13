<template>
    <div>
        <h3 class="text-h3 mb-2 mt-8 text-center">Login</h3>
        <h5 class="text-h5 mb-4 text-center">
            Or <router-link to="/register">create an account</router-link> instead
        </h5>
        <v-row justify="center" align="center">
            <v-col cols="12" sm="5">
                <v-form ref="form" v-model="valid" lazy-validation v-on:submit="onSubmit">
                    <v-text-field v-model="email" :rules="emailRules" label="E-mail" required></v-text-field>

                    <v-text-field v-model="password" :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                        :rules="passwordRules" :type="show1 ? 'text' : 'password'" name="input-10-1" label="Password"
                        hint="At least 8 characters" counter @click:append="show1 = !show1">
                    </v-text-field>

                    <v-btn :disabled="!isReady" color="primary" class="mr-4" type="submit" :loading="loading">
                        Login
                    </v-btn>
                </v-form>
            </v-col>

        </v-row>
    </div>

</template>

<script lang="ts">
import Vue from "vue"
import { Login } from '../../types'
import AuthService from "@/services/auth.service";

export default Vue.extend({
    name: 'Login',

    components: {},

    props: {},

    data: () => ({
        email: "" as Login["email"],
        password: "" as Login["password"],
        loading: false as Login["loading"],

        valid: false,
        emailRules: [
            (v: string) => v.length > 0,
            (v: string) => !!v || 'E-mail is required',
            (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        ],
        passwordRules: [
            (v: string) => !!v || 'Required.',
            (v: string) => v.length >= 8 || 'Min 8 characters',
            /* emailMatch: () => (`The email and password you entered don't match`), */
        ],
        show1: false
    }),

    computed: {
        isReady(): boolean {
            return this.valid && this.email != "" && this.password != ""
        }
    },

    methods: {
        onSubmit(e: { preventDefault: () => void }) {
            e.preventDefault();
            // Call to this.isReady() does not work, due to typescript checking
            if (this.email != "" && this.password != "") {
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
                        this.$store.commit('updateSnackbar', { message: "Login successful!", variant: "success", show: true })
                        // Check for saved URLS, relocate and wipe them
                        const newUrl = localStorage.getItem('previousURL');
                        if (newUrl) {
                            localStorage.removeItem('previousURL');
                            this.$router.go(-1)
                        } else {
                            this.$router.push("/")
                        }

                        this.loading = false;
                    },
                    (error) => {
                        console.log(error.response.data)
                        this.$store.commit('updateSnackbar', { message: "Login not successful: " + error.response.data.detail, variant: "error", show: true })
                        this.loading = false;
                    },
                );
            }
        }
    },
});
</script>

<style scoped>
</style>