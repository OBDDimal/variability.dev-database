<template>
    <div class="mainView">
        <v-skeleton-loader type="heading" class="mb-6 mt-8"></v-skeleton-loader>
        <v-skeleton-loader type="sentences" class="mb-4"></v-skeleton-loader>
        <v-skeleton-loader type="table"></v-skeleton-loader>
    </div>
</template>

<script>
import Vue from 'vue';
import api from '../services/api.service';

const API_URL = process.env.VUE_APP_DOMAIN;

export default Vue.extend({
    name: 'GithubConfirm',

    components: {},

    props: {},

    data: () => ({
        code: '',
        state: '',
    }),

    computed: {},

    methods: {
        confirm() {
            api.post(`${API_URL}auth/github/login/`, {
                code: this.code,
                state: this.state,
            })
                .then((response) => {
                    /*console.log(response.data)*/
                    localStorage.setItem(
                        'access',
                        JSON.stringify(response.data.access_token)
                    );
                    localStorage.setItem(
                        'refresh',
                        JSON.stringify(response.data.refresh_token)
                    );
                    localStorage.setItem(
                        'user',
                        JSON.stringify(response.data.user)
                    );
                    this.$store.dispatch('login');
                    /*this.$store.commit('updateSnackbar', {
						message: 'Register successful!',
						variant: 'success',
						timeout: 5000,
						show: true,
					})*/
                    this.$router.push('/');
                })
                .catch((error) => {
                    console.log(error);
                    let errorMessage = null;
                    if (error.response.status === 400) {
                        errorMessage = Object.prototype.hasOwnProperty.call(
                            error.response.data,
                            'non_field_errors'
                        )
                            ? error.response.data.non_field_errors[0]
                            : 'Bad Request';
                    } else if (error.response.status === 500) {
                        errorMessage = 'Error while connecting to Auth Service';
                    }
                    this.$store.commit('updateSnackbar', {
                        message: errorMessage,
                        variant: 'error',
                        timeout: 5000,
                        show: true,
                    });
                    this.$router.push('/');
                });
        },
    },

    mounted() {
        this.code = this.$route.query.code;
        this.state = this.$route.query.state;
        this.confirm();
    },
});
</script>
