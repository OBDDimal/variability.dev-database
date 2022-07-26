<template>
    <div class="mainView">
        <h3 class="text-h3 mb-2 mt-8">My Feature Models</h3>
        <h5 class="text-h5 mb-4">
            Here you can add new Feature Models
        </h5>
        <v-data-table :headers="headers" :items="featureModelsComp" :loading="loading" :search="search"
                      class="elevation-1">
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title class="hidden-sm-and-down">All Feature Models</v-toolbar-title>
                    <v-divider class="mx-4 hidden-sm-and-down" inset vertical></v-divider>
                    <v-spacer class="hidden-sm-and-down"></v-spacer>
                    <v-text-field v-model="search" append-icon="mdi-magnify" hide-details label="Search" single-line>
                    </v-text-field>
                    <v-btn class="mb-2 ml-4" color="primary" rounded @click="createDialog = true">
                        <v-icon left> mdi-plus</v-icon>
                        Upload Model
                    </v-btn>
                    <v-dialog v-model="dialogDelete" max-width="500px">
                        <v-card>
                            <v-card-title class="text-h5"
                            >Are you sure you want to delete this
                                feature model?
                            </v-card-title
                            >
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" text @click="closeDelete"
                                >Cancel
                                </v-btn
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
                    <v-dialog v-if="editedItem.analysis" v-model="dialogAnalysis" max-width="80%">
                        <v-card>
                            <v-card-title class="text-h5">
                                Order
                            </v-card-title>
                            <v-spacer></v-spacer>
                            <div class="analysis-width" style="word-break: break-all">
                                {{ editedItem.analysis.order }}
                            </div>
                            <v-spacer></v-spacer>
                            <v-divider></v-divider>
                            <v-card-title class="text-h5">
                                Report
                            </v-card-title>
                            <v-spacer></v-spacer>
                            <div class="analysis-width" style="word-break: break-all">
                                {{ editedItem.analysis.report }}
                            </div>
                            <v-spacer></v-spacer>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </template>
            <template v-slot:item.actions="{ item }">
                <v-btn class="mr-2" color="primary" rounded small to="/feature-model">
                    <v-icon>mdi-eye</v-icon>
                </v-btn>
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
                <v-btn :disabled="item.analysis === undefined" class="mr-2" color="success" rounded small
                       @click="showAnalysis(item)">
                    <v-icon>mdi-play</v-icon>
                </v-btn>
                <!-- <v-btn small rounded color="error" class="mr-2"> <v-icon>mdi-delete</v-icon></v-btn> -->
            </template>
            <template v-slot:item.id="{ index }">
                {{ index + 1 }}
            </template>
            <template v-slot:no-data>
                No feature models yet
            </template>
            <template v-slot:item.tags="{ item }">
                <v-chip v-for="(tag, index) in item.tags" :key="index" class="mx-1">
                    {{ tag.label }}
                </v-chip>
            </template>
            <template v-slot:item.owner="{ item }">
                <v-icon v-if="item.owner" color="success"> mdi-check</v-icon>
                <v-icon v-else color="error"> mdi-cancel</v-icon>
            </template>
            <template v-slot:item.uploaded="{ item }">
                {{ new Date(item.uploaded_at).toLocaleString("en-US") }}
            </template>
        </v-data-table>
        <v-dialog v-model="createDialog" max-width="850px">
            <file-create @close="createDialog = !createDialog"></file-create>
        </v-dialog>
    </div>
</template>

<script>
import Vue from "vue"
import FileCreate from "@/views/FileCreate.vue";

export default Vue.extend({
    name: "Files",

    components: {
        FileCreate,
    },

    props: {},

    data: () => ({
        search: "",
        dialog: false,
        createDialog: false,
        dialogDelete: false,
        dialogAnalysis: false,
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
            {text: "Label", value: "label"},
            {text: "Description", value: "description"},
            {text: "License", value: "license.label"},
            {text: "Tags", value: "tags"},
            {text: "Uploaded on", value: "uploaded"},
            {text: "Owner", value: "owner"},
            {text: "Family", value: "family.label"},
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
        featureModels: [],
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
        loading: false,
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
        featureModelsComp() {
            return this.$store.state.featureModels;
        }
    },

    watch: {
        dialog(val) {
            val || this.close();
        },
        dialogDelete(val) {
            val || this.closeDelete();
        },
        dialogAnalysis(val) {
            val || this.closeDelete();
        },
    },

    methods: {
        initialize() {
            this.featureModels = [
                {
                    id: 1,
                    label: "npc",
                    description: "desc",
                    local_file: "/media/files/npc_7sRobIK.xml",
                    family: {
                        id: 1,
                        owner: false,
                        label: "npc family",
                        description: ""
                    },
                    license: {
                        id: 1,
                        label: "CC BY - Mention"
                    },
                    tags: [
                        {
                            id: 1,
                            label: "small model",
                            owner: false,
                            description: "",
                            date_created: "2022-04-25T15:50:17.950262Z",
                            is_public: false
                        }
                    ],
                    owner: false,
                    uploaded_at: "2022-04-25T15:50:23.094505Z",
                    new_version_of: null,
                    transpiled_file: "/media/files/npc_as_g6_OkXoI7q.json",
                    analysis: {
                        id: 1,
                        report: "i am a report",
                        order: "input-name:examples/berkeleydb.dimacs\r\ninput-hash:eb06505ad6e1c838cffc360a5f3940e2\r\norder:1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76"
                    }
                },
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
            ];
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
        deleteItem(item) {
            this.editedIndex = this.featureModels.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialogDelete = true;
        },
        showAnalysis(item) {
            this.editedIndex = this.featureModels.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialogAnalysis = true;
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
            this.$store.commit('updateSnackbar', {
                message: "Please log in to view this page",
                variant: "info",
                timeout: 5000,
                show: true
            })
            this.$router.push("/login")
        } else {
            this.loading = true;
            this.$store.dispatch("fetchFeatureModels");
            this.featureModels = this.$store.state.featureModels;
            console.log(this.featureModels);
            this.loading = false;
        }
    }
});
</script>
<style scoped>
.analysis-width {
    margin: 0 2rem;
}
</style>
