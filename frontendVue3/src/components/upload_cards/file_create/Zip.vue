<template>
    <v-container>
        <div class="mb-6">
            <b>License: </b> The chosen license will be
            applied to each individual Feature Model. <br />
            <b>Version: </b> Version will be incremented
            automatically. <br />
            <b>Tags: </b> The chosen tags will be applied to
            each individual Feature Model. <br />
        </div>
        <v-form
            ref="zipform"
            v-model="valid_zip"
            lazy-validation
        >
            <v-row>
                <v-col class="py-0" cols="12" md="6">
                    <v-text-field
                        data-cy="file-create-zip-label-textfield"
                        v-model="label_zip"
                        :rules="labelRules"
                        accept=".zip"
                        dense
                        variant="outlined"
                        density="comfortable"
                        small-chips
                        hint="Name your feature models"
                        label="File name"
                        placeholder="Leave a filename"
                        required
                    ></v-text-field>
                </v-col>
                <v-col class="py-0" cols="12">
                    <v-textarea
                        data-cy="file-create-zip-description-textfield"
                        v-model="description_zip"
                        :rules="descriptionRules"
                        counter="250"
                        dense
                        variant="outlined"
                        density="comfortable"
                        hint="Add a description to your feature models"
                        label="Description"
                        outlined
                        placeholder="Leave a comment here"
                        rows="2"
                    >
                    </v-textarea>
                </v-col>
                <v-col class="py-0" cols="12" md="6">
                    <v-file-input
                        data-cy="file-create-zip-file-input"
                        v-model="file_zip"
                        :rules="fileRules"
                        accept=".zip"
                        dense
                        variant="outlined"
                        density="comfortable"
                        hint="Select the files as .zip"
                        label="File Upload"
                        outlined
                        required
                        show-size
                    ></v-file-input>
                </v-col>
                <v-col class="py-0" cols="12" md="6">
                    <v-select
                        data-cy="file-create-zip-license-select"
                        v-model="license_zip"
                        :items="getLicenses"
                        :rules="licenseRules"
                        dense
                        variant="outlined"
                        density="comfortable"
                        hint="Select the license of the feature model"
                        label="License"
                        outlined
                        required
                    >
                    </v-select>
                </v-col>
                <v-col class="py-0" cols="12" md="6">
                    <!-- Change back to v-combobox when new family upload is working properly -->
                    <v-text-field
                        data-cy="file-create-zip-family-label-textfield"
                        v-model="family_zip"
                        :required="true"
                        dense
                        variant="outlined"
                        density="comfortable"
                        hint="Create new family"
                        label="New Family"
                        outlined
                    ></v-text-field>
                </v-col>
                <v-col class="py-0" cols="12" md="6">
                    <v-text-field
                        data-cy="file-create-zip-family-description-textfield"
                        v-model="newFamilyDescription_zip"
                        dense
                        variant="outlined"
                        density="comfortable"
                        hint="Describe your new family"
                        label="New Family Description"
                        outlined
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="py-0" cols="12">
                    <!-- Change back to v-combobox once sequential axios requests are implemented -->
                    <v-autocomplete
                        v-model="tags_zip"
                        :items="getTags"
                        append-outer-icon="mdi-plus"
                        chips
                        dense
                        variant="outlined"
                        density="comfortable"
                        hide-details
                        hint="Choose or create tags for your feature model"
                        label="Tags"
                        multiple
                        outlined
                        small-chips
                        @click:append-outer="
                            editTagMenu = !editTagMenu
                        "
                    ></v-autocomplete>
                </v-col>
                <v-col class="pb-0" cols="12">
                    <v-checkbox
                        data-cy="file-create-zip-legal-share-checkbox"
                        v-model="legalShare_zip"
                        class="mt-0"
                        hide-details
                        label="I am legally allowed to share this model"
                        outlined
                        required
                    >
                    </v-checkbox>
                </v-col>
                <v-col class="py-0" cols="12">
                    <v-checkbox
                        data-cy="file-create-zip-user-data-checkbox"
                        v-model="userData_zip"
                        class="mt-0"
                        hide-details
                        label="My email and a date will always be tied to the file upload (even after account deletion)"
                        outlined
                        required
                    >
                    </v-checkbox>
                </v-col>
                <v-col class="py-0" cols="12">
                    <v-checkbox
                        data-cy="file-create-zip-open-source-checkbox"
                        v-model="openSource_zip"
                        class="mt-0"
                        hide-details
                        label="All information will be published according to your chosen license"
                        outlined
                        required
                    >
                    </v-checkbox>
                </v-col>
                <v-col class="pb-0" cols="12">
                    <div class="d-flex align-center">
                        <v-spacer></v-spacer>
                        <span
                            v-if="uploadStatus !== ''"
                            class="text-subtitle-1"
                            >{{ uploadStatus }}</span
                        >
                        <action-buttons
                        :data="formData"
                  :valid="valid_bulk"
                  @close="$emit('close')"
                  @submit-click="showDetails = true"
                ></action-buttons>
                    </div>
                </v-col>
            </v-row>
        </v-form>
    </v-container>
</template>
<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useFileStore } from '@/store/file';
import { storeToRefs } from 'pinia';
import TagCreate from '@/components/upload_cards/TagCreate.vue';
import FamilyCreate from '@/components/upload_cards/FamilyCreate.vue';
import ActionButtons from '@/components/upload_cards/file_create/ActionButtons.vue';

const fileStore = useFileStore();

const emit = defineEmits(['close']);

const valid_bulk = ref(null);

let formData = reactive({
  label: '',
  description: '',
  files: null,
  license: null,
  family: '1',
  version: '1.0.0',
  tags: [],
  legalShare: false,
  userData: false,
  openSource: false,
});
</script>