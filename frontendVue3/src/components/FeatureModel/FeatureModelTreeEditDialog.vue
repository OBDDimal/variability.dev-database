<template>
    <div class="text-center">
        <v-dialog v-model="showDialog" persistent width="500">
            <v-card>
                <v-card-title class="text-h5"> Edit Feature</v-card-title>

                <v-divider></v-divider>

                <v-form @submit.prevent="save">
                    <v-card-text>
                        <div>
                            <v-text-field
                                v-model="name"
                                :rules="[(value) => !!value || 'Required.']"
                                label="Name"
                            ></v-text-field>
                        </div>

                        <div v-if="showGroupTypeSelection" class="my-2">
                            <v-btn-toggle
                                v-model="convertGroupType"
                                dense
                                color="primary"
                                tile
                                mandatory
                            >
                                <v-btn text>⊻ alt</v-btn>
                                <v-btn text>∨ or</v-btn>
                                <v-btn text>∧ and</v-btn>
                            </v-btn-toggle>
                        </div>

                        <div v-if="showMandatorySelection" class="my-2">
                            <v-btn-toggle
                                v-model="convertMandatory"
                                dense
                                tile
                                color="primary"
                                mandatory
                            >
                                <v-btn text> mandatory</v-btn>
                                <v-btn text> optional</v-btn>
                            </v-btn-toggle>
                        </div>

                        <v-checkbox
                            v-model="abstract"
                            hide-details
                            label="Abstract"
                        ></v-checkbox>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="secondary" text @click="discard">
                            Discard
                        </v-btn>
                        <v-btn
                            :disabled="!name"
                            color="primary"
                            text
                            type="submit"
                        >
                            Edit</v-btn
                        >
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
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
            }
        },
    },

    computed: {
        showDialog: {
            get() {
                return this.show;
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
            this.name = '';
            this.groupType = '';
            this.mandatory = false;
            this.abstract = false;

            this.$emit('close');
        },

        save() {
            const data = {
                name: this.name,
                groupType: this.groupType,
                mandatory: this.mandatory,
                abstract: this.abstract,
            };

            this.$emit('edit', data);
        },
    },
};
</script>
