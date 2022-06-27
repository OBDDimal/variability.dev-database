<template>
    <div>
        <h3 class="text-h3 mb-2 mt-8">My Feature Models</h3>
        <h5 class="text-h5 mb-4">
            Here you can add new Feature Models
        </h5>
        <v-data-table :headers="headers" :items="featureModels" class="elevation-1" :search="search">
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title>All Feature Models</v-toolbar-title>
                    <v-divider class="mx-4" inset vertical></v-divider>
                    <v-spacer></v-spacer>
                    <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details>
                    </v-text-field>
                    <v-dialog v-model="dialog" max-width="700px">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn color="primary" dark rounded class="mb-2 ml-4" v-bind="attrs" v-on="on">
                                <v-icon left> mdi-plus </v-icon>
                                Upload Model
                            </v-btn>
                        </template>
                        <v-card>
                            <v-card-title>
                                <span class="text-h5">{{ formTitle }}</span>
                            </v-card-title>

                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="editedItem.label" label="Label"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="editedItem.description" label="Description">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-file-input chips multiple label="File Upload" show-size></v-file-input>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-autocomplete v-model="editedItem.license" :items="licenses"
                                                label="License"></v-autocomplete>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-autocomplete :disabled="newFamily != ''" v-model="family"
                                                :items="existingFamilies" label="New version of"></v-autocomplete>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field :disabled="family != null" v-model="newFamily"
                                                label="New family"></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-combobox v-model="editedItem.tags" :items="tags" label="Tags" multiple
                                                chips></v-combobox>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-checkbox v-model="check1" label="Lorem Ipsum" hide-details></v-checkbox>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-checkbox v-model="check2" label="Lorem Ipsum 2" hide-details>
                                            </v-checkbox>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-checkbox v-model="check3" label="Lorem Ipsum 3" hide-details>
                                            </v-checkbox>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-btn color="primary" :disabled="
                                                !check1 ||
                                                !check2 ||
                                                !check3
                                            ">Upload</v-btn>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card-text>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" text @click="close">
                                    Cancel
                                </v-btn>
                                <v-btn color="blue darken-1" text @click="save">
                                    Save
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-dialog v-model="dialogDelete" max-width="500px">
                        <v-card>
                            <v-card-title class="text-h5"
                                >Are you sure you want to delete this
                                feature model?</v-card-title
                            >
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" text @click="closeDelete"
                                    >Cancel</v-btn
                                >
                                <v-spacer></v-spacer>
                                <v-btn
                                    color="primary"
                                    text
                                    @click="deleteItemConfirm"
                                    :loading="removeLoading"
                                    >Delete
                                </v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </template>
            <template v-slot:item.actions="{ item }">
                <v-btn small rounded color="primary" class="mr-2" to="/ViewModel">
                    <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                    small
                    rounded
                    color="error"
                    class="mr-2"
                    @click="deleteItem(item)"
                    :disabled="item.owner === false"
                >
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-btn small rounded color="success" class="mr-2">
                    <v-icon>mdi-play</v-icon>
                </v-btn>
                <!-- <v-btn small rounded color="error" class="mr-2"> <v-icon>mdi-delete</v-icon></v-btn> -->
            </template>
            <template v-slot:item.id="{ index }">
                {{ index + 1 }}
            </template>
            <template v-slot:no-data>
                <v-btn color="primary"> Reset </v-btn>
            </template>
            <template v-slot:item.owner="{ item }">
                <v-icon v-if="item.owner" color="success"> mdi-check </v-icon>
                <v-icon v-else color="error"> mdi-cancel </v-icon>
            </template>
        </v-data-table>
    </div>
</template>

<script lang="ts">
import Vue from "vue"
import { FeatureModel } from '../../types'

export default Vue.extend({
    name: 'Files',

    components: {},

    props: {},

    data: () => ({
        search: "",
        dialog: false,
        dialogDelete: false,
        editedIndex: -1,
        family: "",
        newFamily: "",
        headers: [
            {
                text: "ID",
                align: "start",
                sortable: false,
                value: "id",
            },
            { text: "Label", value: "label" },
            { text: "Description", value: "description" },
            { text: "License", value: "license" },
            { text: "Tags", value: "tags" },
            { text: "Uploaded on", value: "dateCreated" },
            { text: "Owner", value: "owner" },
            { text: "Family", value: "family" },
            {
                text: "Actions",
                align: "center",
                value: "actions",
                sortable: false,
            },
        ],
        editedItem: {
            label: "",
            description: "",
            license: "",
            tags: [""],
            dateCreated: new Date(),
            owner: true,
            family: ""
        },
        defaultItem: {
            label: "",
            description: "",
            license: "",
            tags: [""],
            dateCreated: new Date(),
            owner: true,
            family: ""
        },
        featureModels: [] as FeatureModel[],
        licenses: [
            "CC-BY Mention",
            "CC-BY-NC Mention Non-Commercial",
            "MIT",
            "Apache 2.0",
        ],
        tags: ["Test", "Auto", "Tagger"],
        check1: false,
        check2: false,
        check3: false,
        removeLoading: false,
    }),

    created() {
        this.initialize();
    },

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? "Upload New Model" : "Edit Model";
        },
        existingFamilies() {
            return this.featureModels.map((x) => x.label);
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
        initialize() {
            this.featureModels = [
                {
                    label: "NPC Model",
                    description: "Test model for demonstration",
                    license: "CC-BY-SA",
                    tags: ["test tag", "exampletag"],
                    dateCreated: new Date(),
                    owner: true,
                    family: "NPC Family"
                },
                {
                    label: "Cars",
                    description: "Test model for demonstration",
                    license: "CC-BY-SA",
                    tags: ["test tag", "exampletag"],
                    dateCreated: new Date(),
                    owner: true,
                    family: "Cars Family"
                },
                {
                    label: "Model",
                    description: "Test model for demonstration",
                    license: "CC-BY-SA",
                    tags: ["test tag", "exampletag"],
                    dateCreated: new Date(),
                    owner: true,
                    family: "Model Family"
                },
                {
                    label: "Berkshire",
                    description: "Test model for demonstration",
                    license: "CC-BY-SA",
                    tags: ["test tag", "exampletag"],
                    dateCreated: new Date(),
                    owner: true,
                    family: "Berkshire Family"
                },
                {
                    label: "MyModel",
                    description: "Test model for demonstration",
                    license: "CC-BY-SA",
                    tags: ["test tag", "exampletag"],
                    dateCreated: new Date(),
                    owner: true,
                    family: "My Family"
                },
                {
                    label: "Pete",
                    description: "Test model for demonstration",
                    license: "CC-BY-SA",
                    tags: ["test tag", "exampletag"],
                    dateCreated: new Date(),
                    owner: true,
                    family: "Petes Family"
                },
            ] as FeatureModel[];
        },
        deleteItemConfirm() {
                this.removeLoading = true;

                //TODO: actually delete the feature model
                // api.delete(`${API_URL}tags/${this.editedID}/`)
                //     .then(() => {
                //         this.$store.commit("updateSnackbar", {
                //             message: "Tag deleted successfully!",
                //             variant: "success",
                //             timeout: 5000,
                //             show: true,
                //         });
                //         this.$store.dispatch("fetchTags");
                //         this.removeLoading = false;
                //     })
                //     .catch((error) => {
                //         this.$store.commit("updateSnackbar", {
                //             message: "Error: " + error.message,
                //             variant: "error",
                //             timeout: 5000,
                //             show: true,
                //         });
                //         this.removeLoading = false;
                //     });

                this.$store.commit("updateSnackbar", {
                    message: "Error: " + "deletion of feature models is not yet implemented!",
                    variant: "error",
                    timeout: 5000,
                    show: true,
                });
                this.removeLoading = false;

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
            });
        },
        deleteItem(item: FeatureModel) {
                this.editedIndex = this.featureModels.indexOf(item);
                this.editedItem = Object.assign({}, item);
                this.dialogDelete = true;
            },
        save() {
            if (this.editedIndex > -1) {
                Object.assign(this.featureModels[this.editedIndex], this.editedItem);
            } else {
                this.featureModels.push(this.editedItem);
            }
            this.close();
        },
    },

    mounted() {
        if (!this.$store.state.loggedIn || !this.$store.state.currentUser) {
            this.$store.commit('updateSnackbar', { message: "Please log in to view this page", variant: "info", timeout: 5000, show: true })
            this.$router.push("/login")
        }
    }
});
</script>

<style scoped>
</style>