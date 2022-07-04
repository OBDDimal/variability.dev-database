<template>
  <div>
    <v-card>
      <v-card-title>
        <span class="text-h5">Upload Feature Model</span>
      </v-card-title>
      <v-card-subtitle>
        Use this form to upload a new Feature Model publicly
      </v-card-subtitle>

      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  outlined
                  dense
                  required
                  :rules="labelRules"
                  v-model="label"
                  label="File name"
                  placeholder="Leave a filename"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  outlined
                  dense
                  rows="2"
                  v-model="description"
                  label="Description"
                  placeholder="Leave a comment here"
                  counter="250"
                  :rules="descriptionRules"
                >
                </v-textarea>
              </v-col>
              <v-col cols="12" md="6">
                <v-file-input
                  outlined
                  chips
                  small-chips
                  required
                  dense
                  v-model="file"
                  :rules="fileRules"
                  label="File Upload"
                  accept=".xml"
                  show-size
                ></v-file-input>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  outlined
                  required
                  dense
                  v-model="license"
                  :rules="licenseRules"
                  :items="getLicenses"
                  label="License"
                >
                </v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-autocomplete
                  :disabled="newFamily != ''"
                  outlined
                  dense
                  :required="newFamily == ''"
                  v-model="family"
                  :items="getFamilies"
                  label="New version of"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :disabled="family != null"
                  :required="family == null"
                  outlined
                  dense
                  v-model="newFamily"
                  label="New family"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-combobox
                  outlined
                  hide-details
                  v-model="tags"
                  :items="getTags"
                  label="Tags"
                  multiple
                  chips
                  small-chips
                  dense
                ></v-combobox>
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  outlined
                  required
                  hide-details
                  v-model="legalShare"
                  label="I am legally allowed to share this model"
                  class="mt-0"
                >
                </v-checkbox>
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  outlined
                  required
                  hide-details
                  v-model="userData"
                  label="My email and a date will always be tied to the file
                 upload (even after account deletion)"
                  class="mt-0"
                >
                </v-checkbox>
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  outlined
                  required
                  hide-details
                  v-model="openSource"
                  label="All information will be published according to your
                 chosen license"
                  class="mt-0"
                >
                </v-checkbox>
              </v-col>
              <v-col cols="12">
                <div class="d-flex">
                  <v-spacer></v-spacer>
                  <v-btn color="primary" text @click="close"> Cancel </v-btn>
                  <v-btn
                    color="primary"
                    @click="upload"
                    :disabled="!valid"
                    :loading="loading"
                  >
                    Upload
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>
          <!-- <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="editedItem.label"
                        label="Label"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="editedItem.description"
                        label="Description"
                      >
                      </v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-file-input
                        chips
                        multiple
                        label="File Upload"
                        show-size
                      ></v-file-input>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-autocomplete
                        v-model="editedItem.license"
                        :items="licenses"
                        label="License"
                      ></v-autocomplete>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-autocomplete
                        :disabled="newFamily != ''"
                        v-model="family"
                        :items="existingFamilies"
                        label="New version of"
                      ></v-autocomplete>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        :disabled="family != null"
                        v-model="newFamily"
                        label="New family"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-combobox
                        v-model="editedItem.tags"
                        :items="tags"
                        label="Tags"
                        multiple
                        chips
                      ></v-combobox>
                    </v-col>
                    <v-col cols="12">
                      <v-checkbox
                        v-model="check1"
                        label="Lorem Ipsum"
                        hide-details
                      ></v-checkbox>
                    </v-col>
                    <v-col cols="12">
                      <v-checkbox
                        v-model="check2"
                        label="Lorem Ipsum 2"
                        hide-details
                      >
                      </v-checkbox>
                    </v-col>
                    <v-col cols="12">
                      <v-checkbox
                        v-model="check3"
                        label="Lorem Ipsum 3"
                        hide-details
                      >
                      </v-checkbox>
                    </v-col>
                    <v-col cols="12">
                      <v-btn
                        color="primary"
                        :disabled="!check1 || !check2 || !check3"
                        >Upload</v-btn
                      >
                    </v-col>
                  </v-row> -->
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import Vue from "vue";
import api from "@/services/api.service";

const API_URL = process.env.VUE_APP_DOMAIN;

export default Vue.extend({
  name: "FileCreate",

  components: {},

  props: {},

  data: () => ({
    valid: false,

    label: "",
    labelRules: [(v) => !!v || "Label is required"],

    description: "",
    descriptionRules: [(v) => v.length <= 250 || "Max 250 characters please"],

    file: null,
    fileRules: [(v) => !!v || "File is required"],

    gottenLicenses: [],
    license: "",
    licenseRules: [(v) => !!v || "License is required"],

    gottenFamilies: [],
    family: null,

    newFamily: "",
    newFamilyRules: [],

    gottenTags: [],
    tags: null,

    legalShare: false,
    userData: false,
    openSource: false,

    loading: false,

    /* gottenFiles: [],
    newVersionOf: "",
    featureFamily: "",
    tags: "",
    loading: false,
    newVersionOfSelection: false,
    featureModelFamilySelection: false, */
  }),

  watch: {
    "$store.state.licenses": function () {
      this.gottenLicenses = this.$store.state.licenses;
    },
    "$store.state.tags": function () {
      this.gottenTags = this.$store.state.tags;
    },
    "$store.state.families": function () {
      this.gottenFamilies = this.$store.state.families;
    },
  },

  computed: {
    getLicenses() {
      var licenses = [];
      for (let i = 0; i < this.gottenLicenses.length; i++) {
        const element = this.gottenLicenses[i];
        licenses.push({ text: element.label, value: element.id });
      }
      return licenses;
    },
    getFamilies() {
      var families = [];
      for (let i = 0; i < this.gottenFamilies.length; i++) {
        const element = this.gottenFamilies[i];
        if (!element.owner) {
          continue;
        }
        families.push({ text: element.label, value: element.id });
      }
      return families;
    },
    getTags() {
      var tags = [];
      for (let i = 0; i < this.gottenTags.length; i++) {
        const element = this.gottenTags[i];
        tags.push({ text: element.label, value: element.id });
      }
      return tags;
    },
  },

  methods: {
    close() {
      this.$emit("close");
    },
    upload() {
      console.log("hi");
      if (this.$refs.form.validate() !== false) {
        this.loading = true;
        const data = new FormData();

        data.append("label", this.label);
        data.append("description", this.description);
        data.append("local_file", this.file);
        console.log("FILE");
        console.log(this.file);
        data.append("license", this.license);
        console.log("LICENSE");
        console.log(this.license);
        if (this.family !== null) {
          data.append("new_version_of", this.family);
          console.log("NEW VERSION OF");
          console.log(this.family);
        }
        /* if (this.newFamily !== "") {
          data.append("family", this.newFamily);
        } */
        for (var i = 0; i < this.tags.length; i++) {
          this.tags[i].label = this.tags[i]["text"];
          delete this.tags[i].text;
          this.tags[i].id = this.tags[i]["value"];
          delete this.tags[i].value;
        }
        data.append("tags", JSON.stringify(this.tags));
        console.log("TAGS");
        console.log(this.tags);

        api
          .post(`${API_URL}files/`, data, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then(() => {
            this.$store.commit("updateSnackbar", {
              message: "File uploaded successfully! Check your mails",
              variant: "success",
              timeout: 5000,
              show: true,
            });
            this.loading = false;
            this.close();
          })
          .catch((error) => {
            this.$store.commit("updateSnackbar", {
              message: "Error: " + error.message,
              variant: "error",
              timeout: 5000,
              show: true,
            });
            this.loading = false;
            this.close();
          });
      }
    },
  },

  mounted() {
    this.$store.dispatch("fetchLicenses");
    this.$store.dispatch("fetchFamilies");
    this.$store.dispatch("fetchTags");
  },
});
</script>

<style scoped></style>
