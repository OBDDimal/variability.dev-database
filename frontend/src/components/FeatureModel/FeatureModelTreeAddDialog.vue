<template>
    <div class="text-center">
        <v-dialog width="500" v-model="show" persistent>
            <v-card>
                <v-card-title class="text-h5 grey lighten-2"> Add Feature</v-card-title>

                <v-form @submit.prevent="add">
                    <v-card-text>
                        <v-row class="my-2">
                            <v-col cols="12" class="pt-0">
                                <template>
                                    <v-text-field
                                        v-model="name"
                                        hide-details
                                        label="Name"
                                        :rules="[(value) => !!value || 'Required.']"
                                    ></v-text-field>
                                </template>
                            </v-col>
                        </v-row>

                        <v-row class="my-2" v-if="showMandatorySelection">
                            <v-col cols="12">
                                <v-btn-toggle dense v-model="mandatory" mandatory>
                                    <v-btn> mandatory</v-btn>
                                    <v-btn> optional</v-btn>
                                </v-btn-toggle>
                            </v-col>
                        </v-row>

                        <v-checkbox v-model="abstract" label="Abstract" hide-details></v-checkbox>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-btn color="secondary" text @click="discard"> Discard</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" type="submit" text> Add</v-btn>
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import Vue from 'vue';
import {FeatureNode} from "@/classes/featureNode";

export default Vue.extend({
    name: 'FeatureModelTreeAddDialog',

    data: () => ({
        name: "",
        mandatory: false,
        abstract: false,
    }),

    props: {
        parent: Object,
    },

    computed: {
        show: {
            get() {
                return !!this.parent;
            },
            set() {
            },
        },

        showMandatorySelection() {
            if (this.parent) {
                return this.parent.isAnd();
            }
            return false;
        },
    },

    methods: {
        discard() {
            this.name = "";
            this.mandatory = false;
            this.abstract = false;
            this.show = false;

            this.$emit('close');
        },

        add() {
            const newNode = new FeatureNode(this.parent, this.name, 'and', this.mandatory === 0, this.abstract);
            this.name = "";
            this.mandatory = false;
            this.abstract = false;
            this.show = false;

            this.$emit('add', newNode, this.parent);
        },
    },
});
</script>

<style scoped></style>
