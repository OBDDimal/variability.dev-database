<template>
    <div>
        <v-navigation-drawer
            v-model="drawer"
            rail
            expand-on-hover
            absolute
            permanent
            location="end"
        >
        <fact-label></fact-label>
        </v-navigation-drawer>
    </div>
</template>

<script>
import FactLabel from '../FactLabel.vue';
export default {
    name: 'FeatureModelFactLabelBar',

    components: {
        FactLabel,
    },

    props: {},

    data: () => ({
        drawer: true,
    }),


    computed: {},

    methods: {

    },
};
</script>

<style scoped>
.clickable {
    cursor: pointer;
}

@media only screen and (max-width: 1800px) {
    .v-toolbar {
        width: 100%;
    }
}
</style>
