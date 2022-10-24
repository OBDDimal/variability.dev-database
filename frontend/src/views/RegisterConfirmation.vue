<template>
    <div></div>
</template>

<script>
import Vue from 'vue';
import api from '../services/api.service';

const API_URL = process.env.VUE_APP_DOMAIN;

export default Vue.extend({
    name: 'RegisterConfirmation',

    components: {},

    props: {},

    data: () => ({
        code: '',
    }),

    computed: {},

    methods: {
        confirm() {
            api.get(`${API_URL}auth/register/confirm/${this.code}/`)
                .then((response) => {
                    if (response.data.user) {
                        /* Modal.fire({
                                        icon: 'success',
                                        title: 'Success!!',
                                        text: 'Your account was confirmed',
                                    }).then(() => {
                                        window.location.replace('/login');
                                    }); */
                        this.$store.commit('updateSnackbar', {
                            message: 'Register successful!',
                            variant: 'success',
                            timeout: 5000,
                            show: true,
                        });
                        this.$router.push('/');
                    } else if (
                        response.data.message === 'User is already activated!'
                    ) {
                        /* Modal.fire({
                                        icon: 'warning',
                                        title: 'Warning!!',
                                        text: 'Your code was already used!',
                                    }).then(() => {
                                        window.location.replace('/login');
                                    }); */
                        this.$store.commit('updateSnackbar', {
                            message: 'Your code was already used!',
                            variant: 'warning',
                            timeout: 5000,
                            show: true,
                        });
                        this.$router.push('/');
                    } else {
                        /* Modal.fire({
                                        icon: 'error',
                                        title: 'Error!!',
                                        text: 'The confirmation code is not valid',
                                    }).then(() => {
                                        window.location.replace('/login');
                                    }); */
                        this.$store.commit('updateSnackbar', {
                            message: 'Your code is not valid',
                            variant: 'error',
                            timeout: 5000,
                            show: true,
                        });
                        this.$router.push('/');
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
                    this.$store.commit('updateSnackbar', {
                        message: 'Your code is not valid',
                        variant: 'error',
                        timeout: 5000,
                        show: true,
                    });
                    window.location.replace('/');
                });
        },
    },

    mounted() {
        this.code = this.$route.params.confirmationCode;
        this.confirm();
    },
});
</script>
