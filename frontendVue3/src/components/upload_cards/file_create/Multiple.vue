<template>
    <v-container>
        <div class="mb-6">
          <b>Name: </b> The name of the Feature Model is derived from the individual file name. <br />
          <b>Description: </b> The description of the Feature Model will be a static notice with a timestamp. <br />
          <b>License: </b> The chosen license will be applied to each individual Feature Model. <br />
          <b>Version: </b> Version will be incremented automatically. <br />
          <b>Tags: </b> The chosen tags will be applied to each individual Feature Model. <br />
        </div>
        <v-form ref="form" lazy-validation  @submit.prevent>
          <v-row>
            <v-col class="py-0" cols="12" md="6">
                <v-file-input
                data-cy="file-create-multiple-file-input"
                v-model="formData.files"
                :rules="fileRules"
                accept=".xml"
                multiple
                small-chips
                variant="outlined"
                density="comfortable"
                hint="Select the files as .xml"
                label="File Upload"
                required
                show-size
                ></v-file-input>
            </v-col>
            <v-col class="py-0" cols="12" md="6">
              <v-select
              v-model="formData.license"
                        :items="licenses"
                        item-title="label"
                        item-value="id"
                        hint="Select the license of the feature model"
                        label="License"
                        :rule="licenseRules"
                        variant="outlined"
                        density="comfortable"
                        required
              >
              </v-select>
            </v-col>
            <v-col class="py-0" cols="12" md="6">
              <!-- Change back to v-combobox when new family upload is working properly -->
                    <v-autocomplete
                        v-model="formData.family"
                        :items="fileStore.myOwnFamilies"
                        item-title="label"
                        item-value="id"
                        :required="true"
                        :rules="familyRules"
                        variant="outlined"
                        density="comfortable"
                        hint="Add to or create new family"
                        label="Family"
                        append-icon="mdi-plus"
                        @click:append="addFamilyMenu = !addFamilyMenu"
                    ></v-autocomplete>
            </v-col>

          </v-row>

          <v-row>
            <v-col class="py-0" cols="12">
                <v-combobox
                        v-model="formData.tags"
                        :items="fileStore.myOwnTags"
                        append-icon="mdi-plus"
                        item-value="id"
                        item-title="label"
                        chips
                        variant="outlined"
                        density="comfortable"
                        hide-details
                        hint="Choose or create tags for your feature model"
                        label="Tags"
                        multiple
                        @click:append="addTagMenu = !addTagMenu"
                ></v-combobox>
            </v-col>
            <v-col class="pb-0" cols="12">
              <v-checkbox
                data-cy="file-create-multiple-legal-share-checkbox"
                v-model="formData.legalShare"
                class="mt-0"
                hide-details
                label="I am legally allowed to share this model"
                outlined
                :rules="checkboxRules"
                required
              >
              </v-checkbox>
            </v-col>
            <v-col class="py-0" cols="12">
              <v-checkbox
                data-cy="file-create-multiple-user-data-checkbox"
                v-model="formData.userData"
                class="mt-0"
                hide-details
                :rules="checkboxRules"
                label="My email and a date will always be tied to the file upload (even after account deletion)"
                outlined
                required
              >
              </v-checkbox>
            </v-col>
            <v-col class="py-0" cols="12">
              <v-checkbox
                data-cy="file-create-multiple-open-source-checkbox"
                v-model="formData.openSource"
                class="mt-0"
                hide-details
                :rules="checkboxRules"
                label="All information will be published according to your chosen license"
                outlined
                required
              >
              </v-checkbox>
            </v-col>
            <v-col class="pb-0" cols="12">
              <!--<div class="d-flex align-center">
                <v-spacer></v-spacer>
                <span v-if="uploadStatus !== ''" class="text-subtitle-1">{{ uploadStatus }}</span>

              </div>-->
              <action-buttons
                  :data="formData"
                  :valid="form"
                  @close="$emit('close')"
                  @submit-click="showDetails = true"
                  @uploadSuccessfull="(uploadInfo) => emit('uploadSuccessfull', uploadInfo)"
                ></action-buttons>
            </v-col>
          </v-row>
        </v-form>
      </v-container>
      <v-dialog v-model="addTagMenu" max-width="350">
        <tag-create @close="addTagMenu = false"></tag-create>
    </v-dialog>
    <v-dialog v-model="addFamilyMenu" max-width="350">
        <family-create @close="addFamilyMenu = false"></family-create>
    </v-dialog>
</template>

<script setup>
import {  reactive, ref } from 'vue';
import { useFileStore } from '@/store/file';
import { storeToRefs } from 'pinia';
import TagCreate from '@/components/upload_cards/TagCreate.vue';
import FamilyCreate from '@/components/upload_cards/FamilyCreate.vue';
import ActionButtons from '@/components/upload_cards/file_create/ActionButtons.vue';


const fileStore = useFileStore();

const emit = defineEmits(['close', 'uploadSuccessfull']);

const form = ref(null);

let formData = reactive({
  label: '',
  description: '',
  files: null,
  license: null,
  family: null,
  version: '',
  tags: [],
  legalShare: false,
  userData: false,
  openSource: false,
});

const showDetails = ref(false);

let fileRules = [(v) => !!v || 'File is required'];

let { licenses } = storeToRefs(fileStore);
let licenseRules = [(v) => !!v || 'License is required'];

let familyRules = [(v) => !!v || 'Family is required'];

let checkboxRules = [(v) => !!v || 'Checkbox must be checked'];


let addTagMenu = ref(false);
let addFamilyMenu = ref(false);


</script>
