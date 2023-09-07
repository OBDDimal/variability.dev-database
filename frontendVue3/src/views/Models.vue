<template>
    <div class="mainView">
        <h3 class="text-h3 mb-2 mt-8">My Feature Models</h3>
        <h5 class="text-h5 mb-4">Here you can add new Feature Models</h5>
        <feature-model-table
            v-if="appStore.isOnline"
            :items="confirmedFeatureModels"
            :loading="loading"
            :addable="true"
        />
        <template>
            <v-container v-if="!appStore.isOnline">
                <div
                    class="d-flex justify-space-around align-center"
                    :class="breakpoints.smAndDown ? 'flex-column' : ''"
                >
                    <v-btn
                        class="mb-2 ml-4"
                        color="success"
                        rounded
                        link
                        to="/feature-model/new"
                    >
                        <v-icon left> mdi-plus</v-icon>
                        Create new model
                    </v-btn>
                    <v-btn
                        :disabled="!checkLocalStorage"
                        class="mb-2 ml-4"
                        color="secondary"
                        rounded
                        link
                        to="/feature-model/local"
                    >
                        <v-icon left> mdi-server</v-icon>
                        Edit Model from local storage
                    </v-btn>
                </div>
            </v-container>
        </template>
    </div>
</template>

<script setup>
import FeatureModelTable from '@/components/FeatureModelTable.vue';
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useFileStore } from '@/store/file';
import { useAppStore } from '@/store/app';
import { useDisplay } from 'vuetify';

const breakpoints = useDisplay();
const appStore = useAppStore();
const { confirmedFeatureModels } = storeToRefs(useFileStore());
const fileStore = useFileStore();


const loading = ref(false);
/*const showTutorial = false;
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
];*/

onMounted(() => {
    fileStore.fetchConfirmedFeatureModels();
});
</script>

<style scoped>
.analysis-width {
    margin: 0 2rem;
}
</style>
