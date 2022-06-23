<template>
  <div>
    <h3 class="text-h3 mb-2 mt-8">My Tags</h3>
    <h5 class="text-h5 mb-4">
      Here you can add new tags for your Feature Models
    </h5>
    <v-data-table
      :headers="headers"
      :items="$store.state.tags"
      :loading="loading"
      class="elevation-1"
      :search="search"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Tags</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          >
          </v-text-field>
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
                        v-model="editedItem.public"
                        label="Public"
                      ></v-checkbox>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">
                  Cancel
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="save"
                  :loading="addLoading"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5"
                >Are you sure you want to delete this tag?</v-card-title
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="closeDelete">Cancel</v-btn>
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
        <!-- <v-btn small rounded color="primary" class="mr-2" @click="editItem(item)"
                    :disabled="item.owner === false">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn> -->
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
        <!-- <v-btn small rounded color="error" class="mr-2"> <v-icon>mdi-delete</v-icon></v-btn> -->
      </template>
      <template v-slot:item.is_public="{ item }">
        <v-icon v-if="item.is_public" color="success"> mdi-check </v-icon>
        <v-icon v-else color="error"> mdi-cancel </v-icon>
      </template>
      <template v-slot:item.date_created="{ item }">
        {{ new Date(item.date_created).toLocaleString("en-US") }}
      </template>
      <template v-slot:item.id="{ index }">
        {{ index + 1 }}
      </template>
      <template v-slot:item.owner="{ item }">
        <v-icon v-if="item.owner" color="success"> mdi-check </v-icon>
        <v-icon v-else color="error"> mdi-cancel </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import Vue from "vue";
import api from "@/services/api.service";

const API_URL = process.env.VUE_APP_DOMAIN;

export default Vue.extend({
  name: "Tags",

  components: {},

  props: {},

  data: () => ({
    search: "",
    dialog: false,
    dialogDelete: false,
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
      { text: "Owner", value: "owner" },
      { text: "Public", value: "is_public" },
      { text: "Date Created", value: "date_created" },
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
      public: false,
    },
    defaultItem: {
      label: "",
      description: "",
      public: false,
    },
    editedID: -1,
    tags: [],
    loading: false,
    addLoading: false,
    removeLoading: false,
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Create New Tag" : "Edit Tag";
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
      /* this.tags = [
                        {
                            label: "My first public tag",
                            description: "Test tag 1 for demonstration",
                            owner: true,
                            dateCreated: new Date(),
                            public: true
                        },
                        {
                            label: "My second private tag",
                            description: "Test tag 2 for demonstration",
                            owner: true,
                            dateCreated: new Date(),
                            public: false
                        },
                        {
                            label: "Not my public tag",
                            description: "Test tag 3 for demonstration",
                            owner: false,
                            dateCreated: new Date(),
                            public: true
                        },
                        // {   private tags from other users should not be fetched from the server!
                        //     label: "Not my private tag",
                        //     description: "Test tag 4 for demonstration",
                        //     owner: false,
                        //     dateCreated: new Date(),
                        //     public: false
                        // },
                        {
                            label: "Not my public tag 2",
                            description: "Test tag 4 for demonstration",
                            owner: false,
                            dateCreated: new Date(),
                            public: true
                        },
                    ]; */
    },
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

      api
        .delete(`${API_URL}tags/${this.editedID}/`)
        .then(() => {
          this.$store.commit("updateSnackbar", {
            message: "Tag deleted successfully!",
            variant: "success",
            timeout: 5000,
            show: true,
          });
          this.$store.dispatch("fetchTags");
          this.removeLoading = false;
        })
        .catch((error) => {
          this.$store.commit("updateSnackbar", {
            message: "Error: " + error.message,
            variant: "error",
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
      api
        .post(`${API_URL}tags/`, this.editedItem)
        .then(() => {
          this.$store.commit("updateSnackbar", {
            message: "Tag added successfully!",
            variant: "success",
            timeout: 5000,
            show: true,
          });
          this.$store.dispatch("fetchTags");
          this.addLoading = false;
        })
        .catch((error) => {
          this.$store.commit("updateSnackbar", {
            message: "Error: " + error.message,
            variant: "error",
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
      this.$store.commit("updateSnackbar", {
        message: "Please log in to view this page",
        variant: "info",
        timeout: 5000,
        show: true,
      });
      this.$router.push("/login");
    } else {
      this.loading = true;
      this.$store.dispatch("fetchTags");
      this.tags = this.$store.state.tags;
      this.loading = false;
    }
  },
});
</script>

<style scoped></style>
