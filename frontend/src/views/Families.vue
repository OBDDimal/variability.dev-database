<template>
  <div>
    <h3 class="text-h3 mb-2 mt-8">My Families</h3>
    <h5 class="text-h5 mb-4">Here you can add new families</h5>
    <v-data-table
      :headers="headers"
      :loading="loading"
      :items="$store.state.families"
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
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn
          small
          rounded
          color="primary"
          class="mr-2"
          @click="editItem(item)"
          :disabled="item.owner === false"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <!-- <v-btn small rounded color="error" class="mr-2"> <v-icon>mdi-delete</v-icon></v-btn> -->
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
      { text: "Owner", value: "owner" },
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
      owner: false,
    },
    defaultItem: {
      label: "",
      description: "",
      owner: false,
    },
    families: [],
    loading: false,
    addLoading: false,
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Create New Family" : "Edit Family";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  methods: {
    initialize() {
      /* this.families = [
                    {
                        label: "My first family",
                        description: "Test family 1 for demonstration",
                        owner: true,
                    },
                    {
                        label: "My second family",
                        description: "Test family 2 for demonstration",
                        owner: true,
                    },
                    {
                        label: "Not my family",
                        description: "Test family 3 for demonstration",
                        owner: false,
                    },
                    {
                        label: "Not my family 2",
                        description: "Test family 4 for demonstration",
                        owner: false,
                    },
                    {
                        label: "Not my family 3",
                        description: "Test family 5 for demonstration",
                        owner: false,
                    },
                ]; */
    },
    editItem(item) {
      this.editedIndex = item.id;
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        //this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    addFamily() {
      this.addLoading = true;
      api
        .post(`${API_URL}families/`, this.editedItem)
        .then(() => {
          this.$store.commit("updateSnackbar", {
            message: "Family added successfully!",
            variant: "success",
            timeout: 5000,
            show: true,
          });
          this.$store.dispatch("fetchFamilies");
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

    updateFamily() {
      this.addLoading = true;
      api
        .put(`${API_URL}families/${this.editedIndex}/`, this.editedItem)
        .then(() => {
          this.$store.commit("updateSnackbar", {
            message: "Family updated successfully!",
            variant: "success",
            timeout: 5000,
            show: true,
          });
          this.$store.dispatch("fetchFamilies");
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
        this.updateFamily();
      } else {
        this.addFamily();
      }
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
      this.$store.dispatch("fetchFamilies");
      this.families = this.$store.state.families;
      this.loading = false;
    }
  },
});
</script>

<style scoped></style>
