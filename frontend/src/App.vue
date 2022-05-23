<template>
    <v-app>
        <navigation title="ddueruem" />
        
        <v-main>
            <router-view />
        </v-main>
    </v-app>
</template>

<script>
import Vue from "vue"
import Navigation from "./components/Navigation.vue"

export default Vue.extend({
    name: "App",

    components: {
        Navigation
    },

    data: () => ({
        age: 23,
        list: [
            "im",
            "in",
            "ddueruem"
        ]
    }),

    methods: {
        increment() {
            this.age++
        }
    }
});
</script>

<style>
.v-main__wrap {
    margin-left: auto;
    margin-right: auto;
    padding-left: 30px;
    padding-right: 30px;
    max-width: 1280px !important;
}
</style>
