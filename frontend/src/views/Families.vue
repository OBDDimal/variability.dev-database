<template>
    <div>
        <h3 class="text-h3 mb-2 mt-8">My Families</h3>
        <h5 class="text-h5 mb-4">Here you can add new families</h5>
        <v-data-table
            :headers="headers"
            :items="desserts"
            class="elevation-1"
            :search="search"
        >
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title>Families</v-toolbar-title>
                    <v-divider class="mx-4" inset vertical></v-divider>
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details
                    ></v-text-field>
                    <v-dialog v-model="dialog" max-width="500px">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                color="primary"
                                dark
                                rounded
                                class="mb-2 ml-4"
                                v-bind="attrs"
                                v-on="on"
                            >
                                <v-icon left> mdi-plus </v-icon>
                                New Family
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
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-checkbox
                                                v-model="editedItem.public"
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
                                <v-btn color="blue darken-1" text @click="save">
                                    Save
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </template>
            <template v-slot:item.actions="{ item }">
                <v-btn
                    small
                    rounded
                    color="primary"
                    class="mr-2"
                    @click="editItem(item)"
                >
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <!-- <v-btn small rounded color="error" class="mr-2"> <v-icon>mdi-delete</v-icon></v-btn> -->
            </template>
            <template v-slot:item.id="{ index }">
                {{ index + 1 }}
            </template>
            <template v-slot:item.public="{ item }">
                <v-icon v-if="item.public" color="success"> mdi-check </v-icon>
                <v-icon v-else color="error"> mdi-cancel </v-icon>
            </template>
        </v-data-table>
    </div>
</template>

<script>
import Vue from "vue"

export default Vue.extend({
    name: "Families",

    components: {},

    props: {},

    data: () => ({
        search: "",
        dialog: false,
        editedIndex: -1,
        headers: [
            {
                text: "ID",
                align: "start",
                sortable: false,
                value: "id",
            },
            { text: "Label", value: "label" },
            { text: "Description", value: "description" },
            { text: "Public", value: "public" },
            {
                text: "Actions",
                align: "center",
                value: "actions",
                sortable: false,
            },
        ],
        editedItem: {
            name: "",
            calories: 0,
            fat: 0,
            carbs: 0,
            protein: 0,
        },
        desserts: [],
    }),

    created() {
        this.initialize();
    },

    computed: {
        formTitle() {
            return this.editedIndex === -1
                ? "Create New Family"
                : "Edit Family";
        },
    },

    watch: {
        dialog(val) {
            val || this.close();
        },
    },

    methods: {
        initialize() {
            this.desserts = [
                {
                    label: "Frozen Yogurt",
                    description: "Test model for demonstration",
                    public: "true",
                },
                {
                    label: "Frozen Yogurt",
                    description: "Test model for demonstration",
                    public: "true",
                },
                {
                    label: "Frozen Yogurt",
                    description: "Test model for demonstration",
                    public: "true",
                },
            ];
        },
        editItem(item) {
            this.editedIndex = this.desserts.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialog = true;
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