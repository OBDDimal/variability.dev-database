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
            ref="valid_zip"
            v-model="valid_zip"
            lazy-validation
        >
            <v-row>
                <v-col class="py-0" cols="12" md="6">
                    <v-text-field
                        data-cy="file-create-zip-label-textfield"
                        v-model="formData.label"
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
                        v-model="formData.description"
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
                        v-model="formData.files"
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
                        v-model="formData.license"
                        :items="licenses"
                        :rules="licenseRules"
                        item-title="label"
                        item-value="id"
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
                        @change="familyChange"
                    ></v-autocomplete>
                </v-col>
                <!--
                <v-col class="py-0" cols="12" md="6">
                    <v-text-field
                        data-cy="file-create-zip-family-description-textfield"
                        v-model="formData."
                        dense
                        variant="outlined"
                        density="comfortable"
                        hint="Describe your new family"
                        label="New Family Description"
                        outlined
                    ></v-text-field>
                </v-col>
                -->
            </v-row>
            
            <v-row>
                <v-col class="py-0" cols="12">
                    <!-- Change back to v-combobox once sequential axios requests are implemented -->
                    <v-autocomplete
                        v-model="formData.tags"
                        :items="myOwnTags"
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
                    ></v-autocomplete>
                </v-col>
                <v-col class="pb-0" cols="12">
                    <v-checkbox
                        data-cy="file-create-zip-legal-share-checkbox"
                        v-model="formData.legalShare"
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
                        v-model="formData.userData"
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
                        v-model="formData.openSource"
                        class="mt-0"
                        hide-details
                        label="All information will be published according to your chosen license"
                        outlined
                        required
                    >
                    </v-checkbox>
                </v-col>
                <v-col class="pb-0" cols="12">
                <action-buttons
                    :data="formData"
                  :valid="valid_zip"
                  @close="$emit('close')"
                  @submit-click="showDetails = true"
                ></action-buttons>
                </v-col>
            </v-row>
        </v-form>
    </v-container>
    <v-dialog v-model="addTagMenu" max-width="350">
        <tag-create @close="addTagMenu = false"></tag-create>
    </v-dialog>
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

const valid_zip = ref(null);

let formData = reactive({
  label: '',
  description: '',
  files: null,
  license: null,
  family: '11',
  version: '1.0.0',
  tags: [],
  legalShare: false,
  userData: false,
  openSource: false,
});

const showDetails = ref(false);

let labelRules = [(v) => !!v || 'Label is required'];

let descriptionRules = [
    (v) => !!v || 'Description is required',
    (v) => v.length <= 250 || 'Max 250 characters please',
];

let fileRules = [(v) => !!v || 'File is required'];

let { licenses, tags, myOwnTags } = storeToRefs(fileStore);
let licenseRules = [(v) => !!v || 'License is required'];

let familyRules = [(v) => !!v || 'Family is required'];

let checkboxRules = [(v) => !!v || 'Checkbox must be checked'];

let gottenFamilies = ref([]);
let gottenFiles = ref([]);

let allVersions = ref([]);
let latestFeatureModelVersion = ref(null);
let numberOfModelsInFamily = ref(0);

let versionRules = [(v) => !!v || 'Version is required'];

let gottenTags = ref([]);
let newTag = { label: '', description: '', is_public: false };

let addTagMenu = ref(false);
let addFamilyMenu = ref(false);

watch(
    () => formData.family,
    (value) => {
        console.log(getFeatureModelOfFamily(value));
    }
);

async function getFeatureModelOfFamily(id) {
    const res = await fileStore.fetchFeatureModelOfFamily(id);
    console.log(res.length);
    return res;
}
</script>

