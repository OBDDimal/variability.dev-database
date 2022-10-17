<template>
    <div class="mainView">
        <h3 class="text-h3 mb-2 mt-8">My Tags</h3>
        <h5 class="text-h5 mb-4">
            Here you can add new tags for your Feature Models
        </h5>
        <v-data-table
            :headers="headers"
            :items="$store.state.tags"
            :loading="loading"
            :search="search"
            class="elevation-1"
        >
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title class="hidden-sm-and-down"
                        >Tags</v-toolbar-title
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
                                New Tag
                            </v-btn>
                        </template>
                        <v-card>
                            <v-card-title>
                                <span class="text-h5">{{ formTitle }}</span>
                            </v-card-title>

                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <v-col cols="12">
                                            <v-text-field
                                                v-model="editedItem.label"
                                                label="Label"
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field
                                                v-model="editedItem.description"
                                                label="Description"
                                            >
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-checkbox
                                                v-model="editedItem.is_public"
                                                label="Public"
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
                    <v-dialog v-model="dialogDelete" max-width="500px">
                        <v-card>
                            <v-card-title class="text-h5"
                                >Are you sure you want to delete this tag?
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
                <!-- <v-btn small rounded color="primary" class="mr-2" @click="editItem(item)"
                            :disabled="item.owner === false">
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn> -->
                <v-btn
                    :disabled="item.owner === false"
                    class="mr-2"
                    color="error"
                    rounded
                    small
                    @click="deleteItem(item)"
                >
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
                <!-- <v-btn small rounded color="error" class="mr-2"> <v-icon>mdi-delete</v-icon></v-btn> -->
            </template>
            <template v-slot:item.is_public="{ item }">
                <v-icon v-if="item.is_public" color="success">
                    mdi-check</v-icon
                >
                <v-icon v-else color="error"> mdi-cancel</v-icon>
            </template>
            <template v-slot:item.date_created="{ item }">
                {{ new Date(item.date_created).toLocaleString('en-US') }}
            </template>
            <template v-slot:item.id="{ index }">
                {{ index + 1 }}
            </template>
            <template v-slot:item.owner="{ item }">
                <v-icon v-if="item.owner" color="success"> mdi-check</v-icon>
                <v-icon v-else color="error"> mdi-cancel</v-icon>
            </template>
        </v-data-table>
    </div>
</template>

<script>
import Vue from 'vue';
import api from '@/services/api.service';

const API_URL = process.env.VUE_APP_DOMAIN;

export default Vue.extend({
    name: 'Tags',

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
            label: '',
            description: '',
            is_public: false,
        },
        defaultItem: {
            label: '',
            description: '',
            is_public: false,
        },
        editedID: -1,
        tags: [],
        loading: false,
        addLoading: false,
        removeLoading: false,
    }),

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Create New Tag' : 'Edit Tag';
        },
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
        /* editItem(item: Tag) {
                        this.editedIndex = this.tags.indexOf(item);
                        this.editedItem = Object.assign({}, item);
                        this.dialog = true;
                    }, */

        deleteItem(item) {
            this.editedIndex = this.tags.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.editedID = item.id;
            this.dialogDelete = true;
        },

        deleteItemConfirm() {
            this.removeLoading = true;

            api.delete(`${API_URL}tags/${this.editedID}/`)
                .then(() => {
                    this.$store.commit('updateSnackbar', {
                        message: 'Tag deleted successfully!',
                        variant: 'success',
                        timeout: 5000,
                        show: true,
                    });
                    this.$store.dispatch('fetchTags');
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

        addTag() {
            this.addLoading = true;
            /*console.log(this.editedItem)*/
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
