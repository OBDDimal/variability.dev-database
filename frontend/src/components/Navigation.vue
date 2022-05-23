<template>
    <div>
        <v-app-bar app color="primary" dark>
            <h1 class="mr-6">{{title}}</h1>
            <v-btn to="/" text class="mx-1">
                <v-icon left> mdi-home </v-icon>
                Home
            </v-btn>
            <v-btn to="/profile" text class="mx-1">
                <v-icon left> mdi-account </v-icon>
                Profile
            </v-btn>
            <v-btn to="/files" text class="mx-1">
                <v-icon left> mdi-file </v-icon>
                Files
            </v-btn>
            <v-btn to="/tags" text class="mx-1">
                <v-icon left> mdi-tag </v-icon>
                Tags
            </v-btn>
            <v-btn to="/families" text class="mx-1">
                <v-icon left> mdi-human-male-female-child </v-icon>
                Families
            </v-btn>
            <v-btn to="/dsgvo" text class="mx-1">
                <v-icon left> mdi-scale-balance </v-icon>
                DSGVO
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn text>
                <v-icon left> mdi-exit-to-app </v-icon>
                Logout
            </v-btn>
        </v-app-bar>
    </div>
</template>

<script>
import Vue from "vue"

export default Vue.extend({
    name: 'Navigation',

    components: {},

    props: {
        title: {
            type: String,
            require: true
        }
    },

    data: () => ({}),

    computed: {},
});
</script>

<style scoped>
</style>