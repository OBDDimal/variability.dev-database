<template>
    <div class="mainView">
        <h3 class="text-h3 mb-2 mt-8">Welcome to variability.dev</h3>
        <h5 class="text-h5 mb-4">
            A web service for sharing feature model instances and collaborative
            benchmarking
        </h5>
        <feature-model-table
            id="feature-model-table"
            :items="confirmedFeatureModels"
            :loading="loading"
            :addable="true"
        />
        <!--    <tutorial-mode
      :show="showTutorial"
      @close="showTutorial = false"
      :next-steps="tutorialSteps"
      local-storage-identifier="homeTutorialCompleted"
    ></tutorial-mode>-->
        <!--        <v-btn
            id="tutorial-mode"
            fab
            fixed
            right
            bottom
            color="primary"
            @click="showTutorial = true"
        >
            <v-icon> mdi-school </v-icon>
        </v-btn>-->
    </div>
</template>

<script setup>
import FeatureModelTable from '@/components/FeatureModelTable.vue';
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useFileStore } from '@/store/file';

const { confirmedFeatureModels } = storeToRefs(useFileStore());
const fileStore = useFileStore();

const search = '';
const dialog = false;
const createDialog = false;
const editedIndex = -1;
const headers = [
    {
        text: 'ID',
        align: 'start',
        sortable: false,
        value: 'id',
    },
    { text: 'Label', value: 'label' },
    { text: 'Description', value: 'description' },
    { text: 'License', value: 'license' },
    { text: 'Tags', value: 'tags' },
    { text: 'Uploaded on', value: 'uploaded' },
    {
        text: 'Actions',
        align: 'center',
        value: 'actions',
        sortable: false,
    },
];
const editedItem = {
    label: '',
    description: '',
    license: 'CC-BY Mention',
    tags: null,
    uploaded: 'Today',
};
const defaultItem = {
    label: '',
    description: '',
    license: 'CC-BY Mention',
    tags: null,
    uploaded: 'Today',
};
const licenses = [];
const families = [];
const tags = [];
const check1 = false;
const check2 = false;
const check3 = false;
const loading = ref(false);
const info = '';
const showTutorial = false;
const tutorialSteps = [
    {
        title: 'Welcome to the tutorial!',
        description:
            'You can restart the tutorial anytime by clicking on this button.',
        elementCssSelector: '#tutorial-mode',
    },
    {
        title: 'All public feature models',
        description:
            'In this table you can see all public feature models. You can view them, or - if you are the owner - check analyses or delete them.',
        elementCssSelector: '#feature-model-table',
    },
    {
        title: 'Search feature models',
        description:
            'If there are already any feature models uploaded, you can search them here.',
        elementCssSelector: '#feature-model-search',
    },
    {
        title: 'Upload feature model',
        description:
            'With this button, you are able to upload a feature model to variability.dev. A wizard will pop up that allows you to either upload a single feature model, or bulk upload many feature models or upload even as a zip.',
        elementCssSelector: '#feature-model-upload',
    },
    {
        title: 'Create new feature model',
        description:
            'You can create a new feature model from scratch with this button.',
        elementCssSelector: '#feature-model-create',
    },
    {
        title: 'Load FM from local storage',
        description:
            'If there is a feature model in the local storage, you can view it by clicking this button.',
        elementCssSelector: '#feature-model-ls',
    },
];

onMounted(() => {
    fileStore.fetchConfirmedFeatureModels();
});
</script>
