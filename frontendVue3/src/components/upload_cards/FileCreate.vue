<template>
    <v-card class="pa-2" max-width="1000">
        <v-card-title v-if="showSummary" class="text-h5">
            Upload Summary
        </v-card-title>
        <v-card-title v-else>
            <span class="text-h5">Upload Feature Model</span>
        </v-card-title>
        <v-card-subtitle v-if="!showSummary">
            Use this form to upload a new Feature Model publicly
        </v-card-subtitle>
        <v-card-text v-if="showSummary">
            <upload-summary
                :data="uploadInfot"
                @close-summary="closeSummary"
                @close="closeSummary"
        />
        </v-card-text>
        <v-card-text v-else>
            <v-alert
                :type="fileCreateAlert.variant"
                variant="tonal"
                v-model="fileCreateAlert.show"
                closable
                density="comfortable"
            >
                {{ fileCreateAlert.message }}
                <v-spacer></v-spacer>
            </v-alert>
            <v-tabs v-model="tab" class="mb-3" align-tabs="center">
                <v-tab value="single"> Single Upload </v-tab>
                <v-tab value="multiple"> Multiple Upload </v-tab>
                <v-tab value="zip"> Zip Upload </v-tab>
            </v-tabs>

            <v-window v-model="tab">
                <v-window-item value="single">
                    <single @close="$emit('close')" @uploadSuccessfull="(uploadInfo)=>handleUploadSuccess(uploadInfo)"></single>
                </v-window-item>
                <v-window-item value="multiple">
                    <multiple @close="$emit('close')" @uploadSuccessfull="(uploadInfo)=>handleUploadSuccess(uploadInfo)"></multiple>
                 </v-window-item>
                <v-window-item value="zip">
                  <zip @close="$emit('close')" @uploadSuccessfull="(uploadInfo)=>handleUploadSuccess(uploadInfo)"></zip></v-window-item>
            </v-window>

        </v-card-text>
    </v-card>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import Single from '@/components/upload_cards/file_create/Single.vue';
import Multiple from '@/components/upload_cards/file_create/Multiple.vue';
import Zip from '@/components/upload_cards/file_create/Zip.vue'
import UploadSummary from './file_create/UploadSummary.vue';
import { useAppStore } from '@/store/app';
import { storeToRefs } from 'pinia';
import { useFileStore } from '@/store/file';

const emit = defineEmits(['close']);

const showSummary = ref(false);
let uploadInfot = null;
const { fileCreateAlert } = storeToRefs(useAppStore());
function handleUploadSuccess(uploadInfo) {
      uploadInfot = uploadInfo;
      showSummary.value = true;
    }
let tab = ref(0);
function closeSummary() {
      showSummary.value = false;
      emit('close');
    }
onMounted(() => {
    const fileStore = useFileStore();
    fileStore.fetchLicenses();
    fileStore.fetchTags();
    fileStore.fetchFamilies();
});

</script>
