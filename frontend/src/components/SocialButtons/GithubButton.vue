<template>
    <v-btn
        :color="this.$vuetify.theme.dark ? '#fff' : '#333'"
        block
        dark
        @click="loginWithGithub()"
        :outlined="this.$vuetify.theme.dark"
    >
        <v-icon left>mdi-github</v-icon>
        Sign in with GitHub
    </v-btn>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
    name: 'GithubButton',

    methods: {
        async loginWithGithub() {
            const url = await this.$store.dispatch('loginWithGithubRedirect');
            window.open(url, '_self');
        },
    },
});
</script>
