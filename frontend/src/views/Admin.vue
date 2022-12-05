<template>
    <div class="mainView">
        <h3 class="text-h3 mb-2 mt-8">Admin Page</h3>
        <h5 class="text-h5 mb-4">
            Here you can add new analyses for your Feature Models
        </h5>
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
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field
                                    v-model="editedItem.name"
                                    label="Name"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field
                                    v-model="editedItem.query"
                                    label="Query"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-checkbox
                                    v-model="editedItem.admin_only"
                                    label="Admin Only"
                                ></v-checkbox>
                            </v-col>
                            <v-col cols="12">
                                <v-checkbox
                                    v-model="editedItem.disabled"
                                    label="Disabled"
                                ></v-checkbox>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="blue darken-1"
                        text
                        @click="close"
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        :loading="addLoading"
                        color="blue darken-1"
                        text
                        @click="save"
                    >
                        Save
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-list>
                <v-list-item>
                    <Analysis />
                </v-list-item>
                <v-list-item>
                    <Analysis />
                </v-list-item>
                <v-list-item>
                    <Analysis />
                </v-list-item>
            </v-list>
    </div>
</template>

<script>
import Vue from 'vue';
import api from '@/services/api.service';
import Analysis from '@/components/Analysis.vue'

const API_URL = process.env.VUE_APP_DOMAIN;

export default Vue.extend({
    name: 'Admin',

    components: {Analysis},

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
            { text: 'Label', value: 'label' },
            { text: 'Description', value: 'description' },
            { text: 'Owner', value: 'owner' },
            { text: 'Public', value: 'is_public' },
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
        tags: [],
        loading: false,
        addLoading: false,
        removeLoading: false,
    }),

    computed: {
    },

    watch: {
        dialog(val) {
            val || this.close();
        },
        dialogDelete(val) {
            val || this.closeDelete();
        },
    },

    methods: {
        close() {
            this.dialog = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },

        addTag() {
            this.addLoading = true;
            api.post(`${API_URL}tags/`, this.editedItem)
                .then(() => {
                    this.$store.commit('updateSnackbar', {
                        message: 'Tag added successfully!',
                        variant: 'success',
                        timeout: 5000,
                        show: true,
                    });
                    this.$store.dispatch('fetchTags');
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
                this.addTag();
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
            this.$store.dispatch('fetchTags');
            this.tags = this.$store.state.tags;
            this.loading = false;
        }
    },
});
</script>
