<template>
    <div class="mainView">
        <h3 class="text-h3 mb-2 mt-8">Admin Page</h3>
        <h5 class="text-h5 mb-4">
            Here you can add new analyses for your Feature Models
        </h5>

        <v-data-table
            :headers="headers"
            :items="$store.state.analysis"
            :loading="loading"
            :search="search"
            class="elevation-1"
        >
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title class="hidden-sm-and-down"
                        >Analysis</v-toolbar-title
                    >
                    <v-divider
                        class="mx-4 hidden-sm-and-down"
                        inset
                        vertical
                    ></v-divider>
                    <v-spacer class="hidden-sm-and-down"></v-spacer>
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        hide-details
                        label="Search"
                        single-line
                    >
                    </v-text-field>
                    <v-dialog v-model="dialog" max-width="500px">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                class="mb-2 ml-4"
                                color="primary"
                                dark
                                rounded
                                v-bind="attrs"
                                v-on="on"
                            >
                                <v-icon left> mdi-plus</v-icon>
                                New Analysis
                            </v-btn>
                        </template>
                        <v-card>
                            <v-card-title>
                                <span class="text-h5">Create New Analysis</span>
                            </v-card-title>

                            <v-card-text>
                                <v-row>
                                    <v-col cols="12">
                                        <v-text-field
                                            v-model="editedItem.name"
                                            label="Name"
                                            hide-details
                                        ></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-text-field
                                            v-model="editedItem.query"
                                            label="Query"
                                            hide-details
                                        >
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-checkbox
                                            v-model="editedItem.admin_only"
                                            label="Admin Only"
                                            hide-details
                                        ></v-checkbox>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-checkbox
                                            v-model="editedItem.disabled"
                                            label="Disabled"
                                            hide-details
                                        ></v-checkbox>
                                    </v-col>
                                </v-row>
                            </v-card-text>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="error" text @click="close">
                                    Cancel
                                </v-btn>
                                <v-btn
                                    :loading="addLoading"
                                    color="primary"
                                    text
                                    @click="save"
                                >
                                    Save
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-dialog v-model="dialogDelete" max-width="500px">
                        <v-card>
                            <v-card-title class="text-h5"
                                >Are you sure you want to delete this analysis?
                            </v-card-title>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" text @click="closeDelete"
                                    >Cancel</v-btn
                                >
                                <v-spacer></v-spacer>
                                <v-btn
                                    :loading="removeLoading"
                                    color="primary"
                                    text
                                    @click="deleteItemConfirm"
                                    >Delete
                                </v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </template>
            <template v-slot:item.actions="{ item }">
                <v-btn
                    class="mr-2"
                    color="error"
                    rounded
                    small
                    @click="deleteItem(item)"
                >
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </template>
            <template v-slot:item.admin_only="{ item }">
                <v-icon v-if="item.admin_only" color="success">
                    mdi-check</v-icon
                >
                <v-icon v-else color="error"> mdi-cancel</v-icon>
            </template>
            <template v-slot:item.disabled="{ item }">
                <v-icon v-if="item.disabled" color="success"> mdi-check</v-icon>
                <v-icon v-else color="error"> mdi-cancel</v-icon>
            </template>
            <template v-slot:item.date_created="{ item }">
                {{ new Date(item.date_created).toLocaleString('en-US') }}
            </template>
            <template v-slot:item.id="{ index }">
                {{ index + 1 }}
            </template>
        </v-data-table>
    </div>
</template>

<script>
import Vue from 'vue';
import api from '@/services/api.service';

const API_URL = process.env.VUE_APP_DOMAIN;

export default Vue.extend({
    name: 'Admin',

    components: {},

    props: {},

    data: () => ({
        search: '',
        dialog: false,
        dialogDelete: false,
        editedIndex: -1,
        headers: [
            {
                text: 'ID',
                align: 'start',
                sortable: false,
                value: 'id',
            },
            { text: 'Name', value: 'name' },
            { text: 'Query', value: 'query' },
            { text: 'Admin Only', value: 'admin_only' },
            { text: 'Disabled', value: 'disabled' },
            { text: 'Date Created', value: 'date_created' },
            {
                text: 'Actions',
                align: 'center',
                value: 'actions',
                sortable: false,
            },
        ],
        editedItem: {
            name: '',
            query: '',
            admin_only: false,
            disabled: false,
        },
        defaultItem: {
            name: '',
            query: '',
            admin_only: false,
            disabled: false,
        },
        editedID: -1,
        analysis: [],
        loading: false,
        addLoading: false,
        removeLoading: false,
    }),

    computed: {},

    watch: {
        dialog(val) {
            val || this.close();
        },
        dialogDelete(val) {
            val || this.closeDelete();
        },
    },

    methods: {
        deleteItem(item) {
            this.editedIndex = this.analysis.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.editedID = item.id;
            this.dialogDelete = true;
        },

        deleteItemConfirm() {
            this.removeLoading = true;

            api.delete(`${API_URL}analysis/${this.editedID}/`)
                .then(() => {
                    this.$store.commit('updateSnackbar', {
                        message: 'Analysis deleted successfully!',
                        variant: 'success',
                        timeout: 5000,
                        show: true,
                    });
                    this.$store.dispatch('fetchAnalysis');
                    this.removeLoading = false;
                })
                .catch((error) => {
                    this.$store.commit('updateSnackbar', {
                        message: 'Error: ' + error.message,
                        variant: 'error',
                        timeout: 5000,
                        show: true,
                    });
                    this.removeLoading = false;
                });
            this.closeDelete();
        },

        close() {
            this.dialog = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },
        closeDelete() {
            this.dialogDelete = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
                this.editedID = -1;
            });
        },

        addAnalysis() {
            this.addLoading = true;
            api.post(`${API_URL}analysis/`, this.editedItem)
                .then(() => {
                    this.$store.commit('updateSnackbar', {
                        message: 'Analysis added successfully!',
                        variant: 'success',
                        timeout: 5000,
                        show: true,
                    });
                    this.$store.dispatch('fetchAnalysis');
                    this.addLoading = false;
                })
                .catch((error) => {
                    this.$store.commit('updateSnackbar', {
                        message: 'Error: ' + error.message,
                        variant: 'error',
                        timeout: 5000,
                        show: true,
                    });
                    this.addLoading = false;
                });
        },

        save() {
            if (this.editedIndex > -1) {
                //Object.assign(this.tags[this.editedIndex], this.editedItem);
                //this.addTag();
                //UPDATE call to service
            } else {
                this.addAnalysis();
            }
            // TODO: call a service to push new tag / edited tag to the server
            this.close();
        },
    },

    mounted() {
        if (!this.$store.state.loggedIn || !this.$store.state.currentUser) {
            this.$store.commit('updateSnackbar', {
                message: 'Please log in to view this page',
                variant: 'info',
                timeout: 5000,
                show: true,
            });
            this.$router.push('/login');
        } else {
            this.loading = true;
            this.$store.dispatch('fetchAnalysis');
            this.analysis = this.$store.state.analysis;
            this.loading = false;
        }
    },
});
</script>
