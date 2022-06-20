<template>
    <div>
        <v-app-bar app color="primary" dark>
            <h1 class="mr-6">{{ title }}</h1>
            <v-btn to="/" text class="mx-1">
                <v-icon left> mdi-home </v-icon>
                Home
            </v-btn>
            <v-btn v-if="$store.state.loggedIn" to="/profile" text class="mx-1">
                <v-icon left> mdi-account </v-icon>
                Profile
            </v-btn>
            <v-btn v-if="$store.state.loggedIn" to="/files" text class="mx-1">
                <v-icon left> mdi-file </v-icon>
                Files
            </v-btn>
            <v-btn v-if="$store.state.loggedIn" to="/tags" text class="mx-1">
                <v-icon left> mdi-tag </v-icon>
                Tags
            </v-btn>
            <v-btn v-if="$store.state.loggedIn" to="/families" text class="mx-1">
                <v-icon left> mdi-human-male-female-child </v-icon>
                Families
            </v-btn>
            <v-btn to="/dsgvo" text class="mx-1">
                <v-icon left> mdi-scale-balance </v-icon>
                DSGVO
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn v-if="!$store.state.loggedIn" text to="/register">
                <v-icon left> mdi-account-plus </v-icon>
                Register
            </v-btn>
            <v-btn v-if="!$store.state.loggedIn" text to="/login">
                <v-icon left> mdi-login-variant </v-icon>
                Login
            </v-btn>
            <v-btn v-if="$store.state.loggedIn" text @click="logoutAndRedirect()">
                <v-icon left> mdi-logout-variant </v-icon>
                Logout
            </v-btn>
            <v-divider vertical class="mx-5"></v-divider>
            <v-btn
                icon
                class="mr-3"
                @click="$vuetify.theme.dark = !$vuetify.theme.dark"
            >
                <v-icon v-if="$vuetify.theme.dark">
                    mdi-brightness-7
                </v-icon>
                <v-icon v-else>
                    mdi-brightness-4
                </v-icon>
            </v-btn>
        </v-app-bar>
    </div>
</template>

<script lang="ts">
import Vue from "vue"

export default Vue.extend({
    name: 'Navigation',

    components: {},

    props: {
        title: {
            type: String,
            required: true
        }
    },

    data: () => ({}),

    computed: {},

    methods: {
        logoutAndRedirect() {
            if(this.$route.path !== "/") {
                this.$router.push("/")
            }
            this.$store.dispatch('logout')
        }
    }
});
</script>

<style scoped>
</style>