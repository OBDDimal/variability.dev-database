<template>
    <div class="mainView">
        <h3 class="text-h3 mt-8 text-center">Login</h3>
        <div class="mb-4 text-subtitle-1 text-center">
            Or
            <router-link to="/register">create an account</router-link>
            instead
        </div>
        <div class="d-flex justify-center align-center">
            <login-div></login-div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import LoginDiv from '@/components/LoginDiv';

export default Vue.extend({
    name: 'Login',

    components: {
        LoginDiv,
    },

    props: {},

    data: () => ({}),

    computed: {},

    /*beforeRouteEnter(_to, from, next) {
        next((vm) => {
            vm.prevRoute = from.path;
        });
    },*/

    methods: {},

    mounted() {},
});
</script>
