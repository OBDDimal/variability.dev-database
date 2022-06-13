<template>
    <div>

    </div>
</template>

<script lang="ts">
import Vue from "vue"
import api from '../services/api.service';

const API_URL = process.env.VUE_APP_DOMAIN;

export default Vue.extend({
    name: 'Register',

    components: {},

    props: {},

    data: () => ({
        code: ""
    }),

    computed: {

    },

    methods: {
        confirm(): void {
            api
                .get(`${API_URL}auth/register/confirm/${this.code}/`)
                .then((response) => {
                    if (response.data.user) {
                        /* Modal.fire({
                            icon: 'success',
                            title: 'Success!!',
                            text: 'Your account was confirmed',
                        }).then(() => {
                            window.location.replace('/login');
                        }); */
                        console.log("Success")
                        this.$store.commit('updateSnackbar', { message: "Register successful!", variant: "success", show: true })
                        window.location.replace('/login');
                    } else if (response.data.message === 'User is already activated!') {
                        /* Modal.fire({
                            icon: 'warning',
                            title: 'Warning!!',
                            text: 'Your code was already used!',
                        }).then(() => {
                            window.location.replace('/login');
                        }); */
                        console.log("Unsuccess")
                        this.$store.commit('updateSnackbar', { message: "Your code was already used!", variant: "warning", show: true })
                        window.location.replace('/login');
                    } else {
                        /* Modal.fire({
                            icon: 'error',
                            title: 'Error!!',
                            text: 'The confirmation code is not valid',
                        }).then(() => {
                            window.location.replace('/login');
                        }); */
                        console.log("Unsuccess2")
                        this.$store.commit('updateSnackbar', { message: "Your code is not valid", variant: "error", show: true })
                        window.location.replace('/login');
                    }
                })
                .catch(() => {
                    /* Modal.fire({
                        icon: 'error',
                        title: 'Error!!',
                        text: 'The confirmation code is not valid',
                    }).then(() => {
                        window.location.replace('/login');
                    }); */
                    console.log("Unsuccess3")
                    this.$store.commit('updateSnackbar', { message: "Your code is not valid", variant: "error", show: true })
                    window.location.replace('/login');
                });
        }
    },

    mounted(): void {
        this.code = this.$route.params.confirmationCode;
        this.confirm();
    }
});
</script>

<style scoped>
</style>