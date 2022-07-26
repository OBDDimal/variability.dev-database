<template>
    <div class="mainView">
        <h3 class="text-h3 mb-2 mt-8">Welcome to ddueruem</h3>
        <h5 class="text-h5 mb-4">
            A web service for sharing feature model instances and collaborative
            benchmarking
        </h5>
        <v-data-table
            :headers="headers"
            :items="$store.state.files"
            :loading="loading"
            :search="search"
            class="elevation-1"
        >
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title class="hidden-sm-and-down">All Feature Models</v-toolbar-title>
                    <v-divider class="mx-4 hidden-sm-and-down" inset vertical></v-divider>
                    <v-spacer class="hidden-sm-and-down"></v-spacer>
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        hide-details
                        label="Search"
                        single-line
                    >
                    </v-text-field>
                    <v-btn
                        :disabled="!$store.state.loggedIn"
                        class="mb-2 ml-4"
                        color="primary"
                        rounded
                        @click="createDialog = true"
                    >
                        <v-icon left> mdi-plus</v-icon>
                        Upload Model
                    </v-btn>
                </v-toolbar>
            </template>
            <template v-slot:item.actions="{}">
                <v-btn class="mr-2" color="primary" rounded small to="/ViewModel">
                    <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn class="mr-2" color="success" rounded small>
                    <v-icon>mdi-play</v-icon>
                </v-btn>
                <!-- <v-btn small rounded color="error" class="mr-2"> <v-icon>mdi-delete</v-icon></v-btn> -->
            </template>
            <template v-slot:item.id="{ index }">
                {{ index + 1 }}
            </template>
            <template v-slot:item.license="{ item }">
                {{ item.license.label }}
            </template>
            <template v-slot:item.uploaded="{ item }">
                {{ new Date(item.uploaded_at).toLocaleString("en-US") }}
            </template>
            <template v-slot:item.tags="{ item }">
                <v-chip v-for="(tag, index) in item.tags" :key="index" class="mx-1">
                    {{ tag.label }}
                </v-chip>
            </template>
            <template v-slot:no-data> No Files yet</template>
        </v-data-table>
        <v-dialog v-model="createDialog" max-width="850px">
            <file-create @close="createDialog = !createDialog"></file-create>
        </v-dialog>
    </div>
</template>

<script>
import Vue from "vue";
import FileCreate from "@/views/FileCreate.vue";

export default Vue.extend({
    name: "HomeView",

    components: {
        FileCreate,
    },

    props: {},

    data: () => ({
        search: "",
        dialog: false,
        createDialog: false,
        editedIndex: -1,
        headers: [
            {
                text: "ID",
                align: "start",
                sortable: false,
                value: "id",
            },
            {text: "Label", value: "label"},
            {text: "Description", value: "description"},
            {text: "License", value: "license"},
            {text: "Tags", value: "tags"},
            {text: "Uploaded on", value: "uploaded"},
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
        defaultItem: {
            label: "",
            description: "",
            license: "CC-BY Mention",
            tags: null,
            uploaded: "Today",
        },
        files: [],
        licenses: [],
        families: [],
        tags: [],
        check1: false,
        check2: false,
        check3: false,
        loading: false,
        info: "",
    }),

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? "Upload New Model" : "Edit Model";
        } /*
    existingFamilies() {
      return this.desserts.map((x) => x.label);
    }, */,
    },

    watch: {
        dialog(val) {
            val || this.close();
        }
    },

    methods: {
        close() {
            this.dialog = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },

        save() {
            /* if (this.editedIndex > -1) {
              Object.assign(this.desserts[this.editedIndex], this.editedItem);
            } else {
              this.desserts.push(this.editedItem);
            } */
            this.close();
        },
    },

    mounted() {
        this.loading = true;
        this.$store.dispatch("fetchFamilies");
        this.families = this.$store.state.families;
        this.$store.dispatch("fetchTags");
        this.tags = this.$store.state.tags;
        this.$store.dispatch("fetchFiles");
        this.files = this.$store.state.files;
        this.loading = false;
    },
});
</script>

<style scoped>
</style>
