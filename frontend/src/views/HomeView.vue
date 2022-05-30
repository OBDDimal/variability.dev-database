<template>
    <div>
        <h3 class="text-h3 mb-2 mt-8">Welcome to Ddueruem</h3>
        <h5 class="text-h5 mb-4">
            A web service for sharing feature model instances and collaborative
            benchmarking
        </h5>
        <v-data-table :headers="headers" :items="desserts" class="elevation-1" :search="search">
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
                </v-toolbar>
            </template>
            <template v-slot:item.actions="{}">
                <v-btn small rounded color="primary" class="mr-2" to="/ViewModel">
                    <v-icon>mdi-eye</v-icon>
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
        </v-data-table>
        <v-btn color="success" class="my-5" :loading="loading" @click="fetchAPI()">
            Fetch Data from API
        </v-btn>
        <v-data-table :headers="headersAPI" :items="itemsAPI" :loading="loading" class="elevation-2">
            <template v-slot:item.logo="{ item }">
                <img :src="item.airline[0].logo" style="width: 10%" />
            </template>
            <template v-slot:item.website="{ item }">
                <a :href="item.airline[0].website">{{ item.airline[0].website }}</a>
            </template>
        </v-data-table>
        <!-- <TableCRUD headline="Test" :add="false" :headers="headers" :items="desserts" /> -->
    </div>
</template>

<script>
import Vue from "vue"
import axios from "axios"
/* import TableCRUD from "../components/TableCRUD.vue" */

export default Vue.extend({
    name: "HomeView",

    components: {
        /* TableCRUD, */
    },

    props: {},

    data: () => ({
        search: "",
        dialog: false,
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
            { text: "Uploaded on", value: "uploaded" },
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
            license: "CC-BY Mention",
            tags: null,
            uploaded: "Today",
        },
        desserts: [],
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
        loading: false,
        info: "",
        headersAPI: [
            { text: "Passenger Name", value: "name" },
            { text: "Number Of Trips", value: "trips" },
            { text: "Airline", value: "airline[0].name" },
            { text: "Logo", value: "logo" },
            { text: "Website", value: "website" },
        ],
        itemsAPI: [],
    }),

    created() {
        this.initialize();
    },

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? "Upload New Model" : "Edit Model";
        },
        existingFamilies() {
            return this.desserts.map((x) => x.label);
        },
    },

    watch: {
        dialog(val) {
            val || this.close();
        },
    },

    methods: {
        fetchAPI() {
            this.loading = true;
            axios
                .get(
                    "https://api.instantwebtools.net/v1/passenger?size=10&page=1"
                )
                .then((response) => {
                    setTimeout(() => {
                        this.itemsAPI = response.data.data;
                        this.loading = false;
                    }, 3000);
                });
        },
        initialize() {
            this.desserts = [
                {
                    label: "NPC Model",
                    description: "Test model for demonstration",
                    license: "CC-BY-SA",
                    tags: 4.0,
                    uploaded: "13.05.2022",
                },
                {
                    label: "Cars",
                    description: "Test model for demonstration",
                    license: "CC-BY-SA",
                    tags: 4.0,
                    uploaded: "13.05.2022",
                },
                {
                    label: "Model",
                    description: "Test model for demonstration",
                    license: "CC-BY-SA",
                    tags: 4.0,
                    uploaded: "13.05.2022",
                },
                {
                    label: "Berkshire",
                    description: "Test model for demonstration",
                    license: "CC-BY-SA",
                    tags: 4.0,
                    uploaded: "13.05.2022",
                },
                {
                    label: "MyModel",
                    description: "Test model for demonstration",
                    license: "CC-BY-SA",
                    tags: 4.0,
                    uploaded: "13.05.2022",
                },
                {
                    label: "Pete",
                    description: "Test model for demonstration",
                    license: "CC-BY-SA",
                    tags: 4.0,
                    uploaded: "13.05.2022",
                },
            ];
        },
        close() {
            this.dialog = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },

        save() {
            if (this.editedIndex > -1) {
                Object.assign(this.desserts[this.editedIndex], this.editedItem);
            } else {
                this.desserts.push(this.editedItem);
            }
            this.close();
        },
    },
});
</script>

<style scoped>
.v-input--selection-controls {
    margin-top: 0 !important;
}
</style>