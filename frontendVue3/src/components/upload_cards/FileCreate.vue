<template>
    <v-card class="pa-2" max-width="1000">
        <v-card-title>
            <span class="text-h5">Upload Feature Model</span>
        </v-card-title>
        <v-card-subtitle>
            Use this form to upload a new Feature Model publicly
        </v-card-subtitle>

        <v-card-text>
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
                    <single @close="$emit('close')"></single>
                </v-window-item>
                <v-window-item value="multiple"> 
                    <multiple @close="$emit('close')"></multiple>
                 </v-window-item>
                <v-window-item value="zip">
                  <zip @close="$emit('close')" ></zip></v-window-item>
            </v-window>

        </v-card-text>
    </v-card>
</template>

<script setup>
import api from '@/services/api.service';
import { onMounted, ref, watch } from 'vue';
import Single from '@/components/upload_cards/file_create/Single.vue';
import Multiple from '@/components/upload_cards/file_create/Multiple.vue';
import Zip from '@/components/upload_cards/file_create/Zip.vue'
import { useAppStore } from '@/store/app';
import { storeToRefs } from 'pinia';
import { useFileStore } from '@/store/file';

const emit = defineEmits(['close']);

const appStore = useAppStore();

const { fileCreateAlert } = storeToRefs(useAppStore());

const API_URL = import.meta.env.VUE_APP_DOMAIN;

let tab = ref(0);
let labelRules = [(v) => !!v || 'Label is required'];

let description = ref('');
let descriptionRules = [
    (v) => !!v || 'Description is required',
    (v) => v.length <= 250 || 'Max 250 characters please',
];

let file = ref(null);
let fileRules = [(v) => !!v || 'File is required'];

let gottenLicenses = ref([]);
let license = ref('');
let licenseRules = [(v) => !!v || 'License is required'];

let gottenFamilies = ref([]);
let gottenFiles = ref([]);

let version = ref('');
let allVersions = ref([]);
let latestFeatureModelVersion = ref(null);
let numberOfModelsInFamily = ref(0);
let newFamilyIsObject = ref(false);
let versionRules = [(v) => !!v || 'Version is required'];

let family = ref(null);
let newFamilyDescription = ref('');
let isNewFamily = ref(false);

let gottenTags = ref([]);
let tags = ref([]);
let newTag = { label: '', description: '', is_public: false };

let legalShare = ref(false);
let userData = ref(false);
let openSource = ref(false);

onMounted(() => {
    const fileStore = useFileStore();
    fileStore.fetchLicenses();
    fileStore.fetchTags();
    fileStore.fetchFamilies();
});

</script>
