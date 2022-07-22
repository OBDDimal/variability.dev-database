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
import {Constraint} from "@/classes/constraint";
import {Implication} from "@/classes/Constraint/Implication";
import {FeatureNodeConstraintItem} from "@/classes/Constraint/FeatureNodeConstraintItem";
import {FeatureNode} from "@/classes/featureNode";

export default Vue.extend({
    name: "ConstraintAddDialog",

    data: () => ({
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
            const newConstraint = new Constraint();
            const premise = new FeatureNodeConstraintItem(this.allNodes[0], newConstraint);
            const conclusion = new FeatureNodeConstraintItem(this.allNodes[0], newConstraint);
            const imp = new Implication(premise, conclusion);
            newConstraint.rule = imp;

            this.$emit('add', newConstraint);
        },
    }
});
</script>

<style lang="scss" scoped>

</style>
