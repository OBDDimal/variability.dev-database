<template>
  <div class="mainView">
    <h3 class="text-h3 mb-2 mt-8">Upload new File</h3>
    <h5 class="text-h5 mb-4">
      Use this form to upload a new Feature Model publicly
    </h5>
    <v-form v-model="valid">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="label"
            label="Label"
            placeholder="Leave a filename"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="description"
            label="Description"
            placeholder="Leave a comment here"
            counter="250"
            :rules="descriptionRules"
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-file-input
            chips
            label="File Upload"
            accept=".xml"
            show-size
          ></v-file-input>
        </v-col>
        <v-col cols="12" md="6">
          <v-autocomplete
            v-model="license"
            :item-text="
              gottenLicenses.map(function (a) {
                return a.label;
              })
            "
            :item-value="
              gottenLicenses.map(function (a) {
                return a.value;
              })
            "
            label="License"
          >
          </v-autocomplete>
        </v-col>
        <!-- <v-col cols="12" md="6">
                <v-autocomplete :disabled="newFamily != ''" v-model="family" :items="existingFamilies"
                    label="New version of"></v-autocomplete>
            </v-col>
            <v-col cols="12" md="6">
                <v-text-field :disabled="family != null" v-model="newFamily" label="New family"></v-text-field>
            </v-col> -->
        <v-col cols="12">
          <v-combobox
            v-model="tags"
            :items="
              gottenTags.map(function (a) {
                return a.value;
              })
            "
            label="Tags"
            multiple
            chips
          ></v-combobox>
        </v-col>
        <v-col cols="12">
          <v-checkbox
            v-model="legalShare"
            label="I am legally allowed to share this model"
            class="mt-0"
            hide-details
          >
          </v-checkbox>
        </v-col>
        <v-col cols="12">
          <v-checkbox
            v-model="userData"
            label="My email and a date will always be tied to the file
                 upload (even after account deletion)"
            class="mt-0"
            hide-details
          >
          </v-checkbox>
        </v-col>
        <v-col cols="12">
          <v-checkbox
            v-model="openSource"
            label="All information will be published according to your
                 chosen license"
            class="mt-0"
            hide-details
          >
          </v-checkbox>
        </v-col>
        <v-col cols="12">
          <v-btn color="primary" :disabled="!valid">Upload</v-btn>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  name: "FileCreate",

  components: {},

  props: {
    title: String,
  },

  data: () => ({
    valid: false,
    label: "",
    description: "",
    descriptionRules: [(v) => v.length <= 250 || "Max 250 characters please"],
    file: undefined,
    gottenLicenses: [],
    gottenTags: [],
    gottenFiles: [],
    gottenFamilies: [],
    newVersionOf: "",
    featureFamily: "",
    license: "",
    tags: "",
    loading: false,
    legalShare: false,
    userData: false,
    openSource: false,
    newVersionOfSelection: false,
    featureModelFamilySelection: false,
  }),

  computed: {},

  methods: {},
});
</script>

<style scoped></style>
