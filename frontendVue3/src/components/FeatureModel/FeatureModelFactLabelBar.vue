<template>
    <div>
        <v-navigation-drawer
            v-model="drawer"
            temporary           
            location="end"
        >
        <fact-label
        :metadata="metadata"
        :metrics="metrics"
        :analysis="analysis"></fact-label>
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

    props: {
        isOpen: Boolean,
        metadata: Array,
        metrics: Array,
        analysis: Array,
    },

    data: () => ({
    }),


    computed: {
        drawer: {
            get() {
                return this.isOpen;
            },
            set() {this.$emit('close'); },
        },},

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
