<template>
    <div class="text-center">
        <v-dialog v-model="showDialog" persistent width="500">
            <v-card>
                <v-card-title class="text-h5 grey lighten-2"> Edit Feature</v-card-title>

                <v-form @submit.prevent="save">
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

                        <v-row v-if="showGroupTypeSelection" class="my-2">
                            <v-col cols="12">
                                <v-btn-toggle v-model="convertGroupType" dense mandatory>
                                    <v-btn>⊻ alt</v-btn>
                                    <v-btn>∨ or</v-btn>
                                    <v-btn>∧ and</v-btn>
                                </v-btn-toggle>
                            </v-col>
                        </v-row>

                        <v-row v-if="showMandatorySelection" class="my-2">
                            <v-col cols="12">
                                <v-btn-toggle v-model="convertMandatory" dense mandatory>
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
                        <v-btn color="primary" text type="submit"> Edit</v-btn>
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
    name: 'FeatureModelTreeEditDialog',

    data: () => ({
        name: undefined,
        groupType: undefined,
        mandatory: undefined,
        abstract: undefined,
    }),

    props: {
        node: Object,
        show: Boolean,
    },

    watch: {
        show() {
            if (this.node) {
                this.name = this.node.name;
                this.groupType = this.node.groupType;
                this.mandatory = this.node.isMandatory;
                this.abstract = this.node.isAbstract;
                console.log(this);
            }
        },
    },

    computed: {
        showDialog: {
            get() {
                return this.show;
            },
            set() {
            },
        },

        convertGroupType: {
            get() {
                switch (this.groupType) {
                    case 'alt':
                        return 0;
                    case 'or':
                        return 1;
                    case 'and':
                        return 2;
                    default:
                        return 0;
                }
            },
            set(newValue) {
                switch (newValue) {
                    case 0:
                        this.groupType = 'alt';
                        break;
                    case 1:
                        this.groupType = 'or';
                        break;
                    case 2:
                        this.groupType = 'and';
                        break;
                    default:
                        this.groupType = 'alt';
                        break;
                }
            },
        },

        convertMandatory: {
            get() {
                if (this.node) {
                    return this.mandatory ? 0 : 1;
                }
                return 0;
            },
            set(newValue) {
                this.mandatory = newValue === 0;
            },
        },

        showMandatorySelection() {
            if (this.node) {
                return !this.node.isRoot && this.node.parent.isAnd();
            }
            return false;
        },

        showGroupTypeSelection() {
            if (this.node) {
                return !this.node.isLeaf();
            }
            return false;
        },
    },

    methods: {
        discard() {
            this.name = "";
            this.groupType = "";
            this.mandatory = false;
            this.abstract = false;

            this.$emit('close');
        },

        save() {
            this.node.name = this.name;
            this.node.groupType = this.groupType;
            this.node.isMandatory = this.mandatory;
            this.node.isAbstract = this.abstract;
            this.$emit('edit');
        },
    },
});
</script>

<style scoped></style>
