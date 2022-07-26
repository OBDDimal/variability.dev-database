<template>
    <div class="text-center">
        <v-dialog v-model="showDialog" persistent width="500">
            <v-card>
                <v-card-title class="text-h5 grey lighten-2"> Add Feature</v-card-title>

                <v-form @submit.prevent="add">
                    <v-card-text>
                        <v-row class="my-2">
                            <v-col class="pt-0" cols="12">
                                <template>
                                    <v-text-field
                                        v-model="name"
                                        :rules="[(value) => !!value || 'Required.']"
                                        hide-details
                                        label="Name"
                                    ></v-text-field>
                                </template>
                            </v-col>
                        </v-row>

                        <v-row v-if="showMandatorySelection" class="my-2">
                            <v-col cols="12">
                                <v-btn-toggle v-model="mandatory" dense mandatory>
                                    <v-btn> mandatory</v-btn>
                                    <v-btn> optional</v-btn>
                                </v-btn-toggle>
                            </v-col>
                        </v-row>

                        <v-checkbox v-model="abstract" hide-details label="Abstract"></v-checkbox>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-btn color="secondary" text @click="discard"> Discard</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text type="submit"> Add</v-btn>
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
    name: 'FeatureModelTreeAddDialog',

    data: () => ({
        name: "",
        mandatory: false,
        abstract: false,
    }),

    props: {
        parent: Object,
        show: Boolean,
    },

    computed: {
        showDialog: {
            get() {
                return this.show;
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

            this.$emit('close');
        },

        add() {
            const data = {name: this.name, groupType: 'and', mandatory: this.mandatory === 0, abstract: this.abstract};
            this.name = "";
            this.mandatory = false;
            this.abstract = false;

            this.$emit('add', data, this.parent);
        },
    },
});
</script>

<style scoped></style>
