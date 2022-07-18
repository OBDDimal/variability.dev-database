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
              <v-col cols="12" class="py-0">
                <v-text-field
                  outlined
                  dense
                  required
                  :rules="labelRules"
                  v-model="label"
                  label="File name"
                  placeholder="Leave a filename"
                  hint="Name your feature model"
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="py-0">
                <v-textarea
                  outlined
                  dense
                  rows="2"
                  v-model="description"
                  label="Description"
                  placeholder="Leave a comment here"
                  counter="250"
                  :rules="descriptionRules"
                  hint="Add a description to your feature model"
                >
                </v-textarea>
              </v-col>
              <v-col cols="12" md="6" class="py-0">
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
                  hint="Select the file as .xml"
                ></v-file-input>
              </v-col>
              <v-col cols="12" md="6" class="py-0">
                <v-select
                  outlined
                  required
                  dense
                  v-model="license"
                  :rules="licenseRules"
                  :items="getLicenses"
                  label="License"
                  hint="Select the license of the feature model"
                >
                </v-select>
              </v-col>
            </v-row>
            <v-row justify="space-between" align="center">
              <v-col cols="12" md="5" class="py-0 mb-7">
                <v-autocomplete
                  :disabled="family != null"
                  outlined
                  dense
                  hide-details
                  :required="family == null"
                  v-model="newVersionOf"
                  :items="gottenFiles"
                  label="New version of"
                  hint="If your feature model is a new version of an existing one"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="auto" class="py-0 mb-7 text-center">
                OR
              </v-col>
              <v-col cols="12" md="5" class="py-0">
                <!-- Change back to v-combobox when new family upload is working properly -->
                <v-autocomplete
                  :disabled="newVersionOf != null"
                  :required="newVersionOf == null"
                  outlined
                  dense
                  hide-details
                  v-model="family"
                  class="mb-7"
                  :items="gottenFamilies"
                  label="Family"
                  hint="Add to or create new family"
                ></v-autocomplete>
                <v-text-field
                    v-if="isNewFamily"
                    outlined
                    hide-details
                    dense
                    v-model="newFamilyDescription"
                    label="New Family Description"
                    hint="Describe your new family"
                    class="mb-7"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" class="py-0">
                <!-- Change back to v-combobox once sequential axios requests are implemented -->
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
                  hint="Choose or create tags for your feature model"
                ></v-combobox>
              </v-col>
              <v-col cols="12" class="pb-0">
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
              <v-col cols="12" class="py-0">
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
              <v-col cols="12" class="py-0">
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
              <v-col cols="12" class="pb-0">
                <div class="d-flex">
                  <v-spacer></v-spacer>
                  <v-btn color="primary" text @click="close"> Cancel </v-btn>
                  <v-btn
                    color="primary"
                    @click="upload"
                    :disabled="!valid || !openSource || !userData || !legalShare"
                    :loading="loading"
                  >
                    Upload
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>
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
    descriptionRules: [(v) => !!v || "Description is required", (v) => v.length <= 250 || "Max 250 characters please"],

    file: null,
    fileRules: [(v) => !!v || "File is required"],

    gottenLicenses: [],
    license: "",
    licenseRules: [(v) => !!v || "License is required"],

    gottenFamilies: [],
    gottenFiles: [],
    newVersionOf: null,

    family: null,
    newFamilyDescription: "",
    isNewFamily: false,

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
    "$store.state.files": function () {
      this.gottenFiles = this.$store.state.files;
    },
    family: function(newValue) {
      console.log(newValue)
      if (typeof(newValue) == "string") {
        /*console.log("its a string")
        console.log(!this.gottenFamilies.map(x => x.text).includes(newValue))*/
        this.isNewFamily = !this.gottenFamilies.map(x => x.text).includes(newValue)
      } else if (typeof(newValue) == "object" && newValue != null) {
        /*console.log("its an object")
        console.log(!this.gottenFamilies.map(x => x.text).includes(newValue.text))*/
        this.isNewFamily = !this.gottenFamilies.map(x => x.text).includes(newValue.text)
      } else {
        this.isNewFamily = false
      }
    }
  },

  computed: {
    getLicenses() {
      const licenses = [];
      for (let i = 0; i < this.gottenLicenses.length; i++) {
        const element = this.gottenLicenses[i];
        licenses.push({ text: element.label, value: element.id });
      }
      return licenses;
    },
    getFamilies() {
      const families = [];
      for (let i = 0; i < this.gottenFamilies.length; i++) {
        const element = this.gottenFamilies[i];
        if (!element.owner) {
          continue;
        }
        families.push({ text: element.label, value: element.id });
      }
      return families;
    },
    getFiles() {
      const files = [];
      for (let i = 0; i < this.gottenFiles.length; i++) {
        /*console.log(this.gottenFiles)*/
        const element = this.gottenFiles[i];
        if (!element.owner) {
          continue;
        }
        files.push({ text: element.label, value: element.id });
      }
      return files;
    },
    getTags() {
      const tags = [];
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
    transferToDropdown(objects) {
      const temp = [];
      for (let i = 0; i < objects.length; i++) {
        const element = objects[i];
        if (!element.owner) {
          continue;
        }
        temp.push({ text: element.label, value: element.id });
      }
      return temp;
    },
    upload() {
      if (this.$refs.form.validate() !== false) {
        this.loading = true;
        const data = new FormData();

        data.append("label", this.label);
        console.log("LABEL");
        console.log(this.label);
        data.append("description", this.description);
        console.log("DESCRIPTION");
        console.log(this.description);
        data.append("local_file", this.file);
        console.log("FILE");
        console.log(this.file);
        data.append("license", this.license);
        console.log("LICENSE");
        console.log(this.license);
        if (this.newVersionOf !== null && this.newVersionOf) {
          data.append("new_version_of", this.newVersionOf);
          console.log("NEW VERSION OF");
          console.log(this.newVersionOf);
        }
        if (this.family !== "" && this.family) {
          if (!this.isNewFamily) {
            //change back to this.family.value when using v-combobox again
            data.append("family", this.family);
            console.log("FEATURE FAMILY (not new)")
            console.log(this.family)
          } /*else {
            api
              .post(`${API_URL}families/`, {label: this.family, description: this.newFamilyDescription})
              .then(async () => {
                await this.$store.dispatch("fetchFamilies");
                await data.append("family", null);
                console.log("FEATURE FAMILY (didnt work)")
              })
              .catch((error) => {
                this.$store.commit("updateSnackbar", {
                  message: "Error while creating new family: " + error.message,
                  variant: "error",
                  timeout: 5000,
                  show: true,
                });
                data.append("family", null);
                console.log("FEATURE FAMILY (didnt work)")
              });
          }*/
        }
        for (let i = 0; i < this.tags.length; i++) {
          this.tags[i].label = this.tags[i]["text"];
          delete this.tags[i].text;
          this.tags[i].id = this.tags[i]["value"];
          delete this.tags[i].value;
        }
        data.append("tags", JSON.stringify(this.tags));
        console.log("TAGS");
        console.log(this.tags);

        /*console.log(data)*/

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
    if (this.$store.state.families !== []) {
      /*console.log("already there fam")
      console.log(this.$store.state.families)*/
      this.gottenFamilies = this.$store.state.families.map(x => {return {text: x.label, value: x.id}})
    } else {
      this.$store.dispatch("fetchFamilies");
    }
    if (this.$store.state.files !== []) {
      /*console.log("already there file")
      console.log(this.$store.state.files)*/
      this.gottenFiles = this.$store.state.files.map(x => {return {text: x.label, value: x.id}})
    } else {
      this.$store.dispatch("fetchFiles");
    }
    this.$store.dispatch("fetchTags");
  },
});
</script>

<style scoped></style>
