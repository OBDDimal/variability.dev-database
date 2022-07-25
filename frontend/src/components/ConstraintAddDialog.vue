<template>
    <div class="text-center">
        <v-dialog v-model="showDialog" persistent width="700">
            <v-card>
                <v-card-title class="text-h5 grey lighten-2"> Add Constraint</v-card-title>

                <v-form @submit.prevent="add">
                    <v-card-text>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-btn color="secondary" text @click="discard">Discard</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text type="submit">Add</v-btn>
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import Vue from "vue";
import {FeatureNode} from "@/classes/FeatureNode";
import {parse} from "@/services/booleanExpressionParser.service";

export default Vue.extend({
    name: "ConstraintAddDialog",

    data: () => ({
        constraintText: "BerkeleyDB or (BASE or FBTree and FLogging and (not FStatistics)) implies FConcurrency",
    }),

    props: {
        show: Boolean,
        allNodes: [FeatureNode],
    },

    computed: {
        showDialog: {
            get() {
                return this.show;
            },
            set() {},
        },
    },

    methods: {
        discard() {
            this.$emit('close');
        },

        add() {
            const newConstraint = parse(this.constraintText, this.allNodes);
            this.$emit('add', newConstraint);
        },
    }
});
</script>

<style lang="scss" scoped>

</style>
