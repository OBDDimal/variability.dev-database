<template>
    <v-container>
        <v-form ref="form" @submit.prevent>
            <v-row>
                <v-col class="py-1" cols="12">
                    <v-text-field
                        v-model="formData.label"
                        :rules="labelRules"
                        hint="Name your feature model"
                        label="File name"
                        variant="outlined"
                        density="comfortable"
                        placeholder="Leave a filename"
                        required
                    ></v-text-field>
                </v-col>
                <v-col class="py-1" cols="12">
                    <v-textarea
                        v-model="formData.description"
                        :rules="descriptionRules"
                        counter="250"
                        hint="Add a description to your feature model"
                        label="Description"
                        variant="outlined"
                        density="comfortable"
                        placeholder="Leave a comment here"
                        rows="2"
                    >
                    </v-textarea>
                </v-col>
                <v-col class="py-1" cols="12" md="6">
                    <v-file-input
                        v-model="formData.files"
                        :rules="fileRules"
                        accept=".xml"
                        small-chips
                        variant="outlined"
                        density="comfortable"
                        hint="Select the file as .xml"
                        label="File Upload"
                        required
                        show-size
                    ></v-file-input>
                </v-col>
                <v-col class="py-1" cols="12" md="6">
                    <v-select
                        v-model="formData.license"
                        :items="licenses"
                        item-title="label"
                        item-value="id"
                        :rules="licenseRules"
                        hint="Select the license of the feature model"
                        label="License"
                        variant="outlined"
                        density="comfortable"
                        required
                    >
                    </v-select>
                </v-col>
            </v-row>
            <v-row align="end" justify="space-between">
                <v-col class="py-1" cols="12" md="6">
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
                <v-col class="py-1" cols="12" md="6">
                    <!--                    <div
                        class="mb-3"
                        v-if="
                            latestFeatureModelVersion == null && family !== null
                        "
                    >
                        No feature models in this family yet
                    </div>
                    <div
                        class="mb-3"
                        v-else-if="
                            latestFeatureModelVersion !== null &&
                            family !== null
                        "
                    >
                        Currently
                        <span style="font-weight: bold">{{
                            numberOfModelsInFamily
                        }}</span>
                        {{
                            numberOfModelsInFamily === 1
                                ? 'Feature Model'
                                : 'Feature Models'
                        }}
                        in
                        <span style="font-weight: bold">{{
                            this.newFamilyIsObject ? family.text : family
                        }}</span>
                        family
                        <br />
                        Latest version:
                        <span style="font-weight: bold">{{
                            latestFeatureModelVersion
                        }}</span>
                    </div>-->
                    <v-text-field
                        v-model="formData.version"
                        :rules="versionRules"
                        :required="true"
                        :disabled="formData.family === null"
                        hint="Version of feature model"
                        :label="
                            formData.family === null
                                ? 'Version (specify family first)'
                                : 'Version'
                        "
                        placeholder="1.0.0"
                        variant="outlined"
                        density="comfortable"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="py-1" cols="12">
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
                <v-col class="pb-1" cols="12">
                    <v-checkbox
                        v-model="formData.legalShare"
                        class="mt-0"
                        label="I am legally allowed to share this model"
                        density="compact"
                        required
                        :hide-details="!showDetails"
                        :rules="checkboxRules"
                    >
                    </v-checkbox>
                </v-col>
                <v-col class="py-1" cols="12">
                    <v-checkbox
                        v-model="formData.userData"
                        class="mt-0"
                        label="My email and a date will always be tied to the file upload (even after account deletion)"
                        density="compact"
                        required
                        :hide-details="!showDetails"
                        :rules="checkboxRules"
                    >
                    </v-checkbox>
                </v-col>
                <v-col class="py-1" cols="12">
                    <v-checkbox
                        v-model="formData.openSource"
                        class="mt-0"
                        label="All information will be published according to your chosen license"
                        density="compact"
                        required
                        :hide-details="!showDetails"
                        :rules="checkboxRules"
                    >
                    </v-checkbox>
                </v-col>
                <action-buttons
                    :data="formData"
                    :valid="form"
                    @close="$emit('close')"
                    @submit-click="showDetails = true"
                    @uploadSuccessfull="(uploadInfo) => $emit('uploadSuccessfull', uploadInfo)"
                ></action-buttons>
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
import { computed, onMounted, reactive, ref, watch } from 'vue';
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

let labelRules = [(v) => !!v || 'Label is required'];

let descriptionRules = [
    (v) => !!v || 'Description is required',
    (v) => v.length <= 250 || 'Max 250 characters please',
];

let fileRules = [(v) => !!v || 'File is required'];

let { licenses, myOwnTags } = storeToRefs(fileStore);
let licenseRules = [(v) => !!v || 'License is required'];

let familyRules = [(v) => !!v || 'Family is required'];

let checkboxRules = [(v) => !!v || 'Checkbox must be checked'];

let versionRules = [(v) => !!v || 'Version is required'];

let addTagMenu = ref(false);
let addFamilyMenu = ref(false);

</script>
