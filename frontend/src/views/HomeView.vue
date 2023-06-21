<template>
    <div class="mainView">
        <h3 class="text-h3 mb-2 mt-8">Welcome to ddueruem</h3>
        <h5 class="text-h5 mb-4">
            A web service for sharing feature model instances and collaborative
            benchmarking
        </h5>
        <feature-model-table
            id="feature-model-table"
            :items="$store.state.files"
            :loading="loading"
            :addable="true"
        />
        <tutorial-mode
            :show="showTutorial"
            @close="showTutorial = false"
            :next-steps="tutorialSteps"
            local-storage-identifier="homeTutorialCompleted"
        ></tutorial-mode>
        <v-btn
            data-cy="tutorial-mode-button"
            id="tutorial-mode"
            fab
            fixed
            right
            bottom
            color="primary"
            @click="showTutorial = true"
        >
            <v-icon> mdi-school </v-icon>
        </v-btn>
    </div>
</template>

<script>
import Vue from 'vue';
import FeatureModelTable from '@/components/FeatureModelTable';
import TutorialMode from '@/components/TutorialMode';

export default Vue.extend({
    name: 'HomeView',

    components: {
        FeatureModelTable,
        TutorialMode,
    },

    props: {},

    data: () => ({
        search: '',
        dialog: false,
        createDialog: false,
        editedIndex: -1,
        headers: [
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
        ],
        editedItem: {
            label: '',
            description: '',
            license: 'CC-BY Mention',
            tags: null,
            uploaded: 'Today',
        },
        defaultItem: {
            label: '',
            description: '',
            license: 'CC-BY Mention',
            tags: null,
            uploaded: 'Today',
        },
        licenses: [],
        families: [],
        tags: [],
        check1: false,
        check2: false,
        check3: false,
        loading: true,
        info: '',
        showTutorial: false,
        tutorialSteps: [
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
                    'With this button, you are able to upload a feature model to ddueruem-web. A wizard will pop up that allows you to either upload a single feature model, or bulk upload many feature models or upload even as a zip.',
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
        ],
    }),

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Upload New Model' : 'Edit Model';
        } /*
    existingFamilies() {
      return this.desserts.map((x) => x.label);
    }, */,
    },

    watch: {
        dialog(val) {
            val || this.close();
        },

        '$store.state.files': function (newVal) {
            if (newVal !== []) {
                this.loading = false;
            }
        },
    },

    methods: {
        close() {
            this.dialog = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },

        save() {
            /* if (this.editedIndex > -1) {
              Object.assign(this.desserts[this.editedIndex], this.editedItem);
            } else {
              this.desserts.push(this.editedItem);
            } */
            this.close();
        },
    },

    async mounted() {
        this.loading = true;
        await this.$store.dispatch('fetchFamilies');
        this.families = this.$store.state.families;
        await this.$store.dispatch('fetchTags');
        this.tags = this.$store.state.tags;
        await this.$store.dispatch('fetchFiles');
    },

    created() {
        this.showTutorial = !localStorage.homeTutorialCompleted;
    },
});
</script>
