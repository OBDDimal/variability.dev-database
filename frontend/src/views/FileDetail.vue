<template>
    <div class="mainView">
        <h3 class="text-h3 mb-2 mt-8">
            Feature Model:
            <span v-if="loading">
                <v-progress-circular
                    indeterminate
                    v-if="loading"
                ></v-progress-circular>
            </span>
            <span v-else>
                {{ file.label }}
            </span>
        </h3>
        <v-row justify="space-between">
            <v-col cols="12" md="6" id="feature-model-details">
                <h5 class="text-h5 mb-4">Details and more information</h5>

                <v-list two-line>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon color="primary"> mdi-information </v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>
                                {{ loading ? '...' : file.label }}
                            </v-list-item-title>
                            <v-list-item-subtitle>Label</v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-action>
                            <v-btn icon>
                                <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>

                    <v-list-item>
                        <v-list-item-icon></v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>
                                {{ loading ? '...' : file.description }}
                            </v-list-item-title>
                            <v-list-item-subtitle
                                >Description</v-list-item-subtitle
                            >
                        </v-list-item-content>

                        <v-list-item-action>
                            <v-btn icon>
                                <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>

                    <v-divider inset></v-divider>

                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon color="primary"> mdi-license </v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>
                                {{ loading ? '...' : file.license.label }}
                            </v-list-item-title>
                            <v-list-item-subtitle>License</v-list-item-subtitle>
                        </v-list-item-content>

                        <!--						<v-list-item-action>
							<v-btn icon>
								<v-icon>mdi-pencil</v-icon>
							</v-btn>
						</v-list-item-action>-->
                    </v-list-item>

                    <v-divider inset></v-divider>

                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon color="primary"> mdi-tag </v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>
                                <v-chip
                                    class="mr-2"
                                    v-for="tag in file.tags"
                                    :key="tag.id"
                                >
                                    {{ tag.label }}
                                </v-chip>
                            </v-list-item-title>
                            <v-list-item-subtitle>Tags</v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-action>
                            <v-btn icon>
                                <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                    <v-divider inset></v-divider>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon color="primary"> mdi-calendar </v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>
                                {{
                                    new Date(file.uploaded_at).toLocaleString(
                                        'en-US'
                                    )
                                }}
                            </v-list-item-title>
                            <v-list-item-subtitle
                                >Uploaded on</v-list-item-subtitle
                            >
                        </v-list-item-content>

                        <!--						<v-list-item-action>
							<v-btn icon>
								<v-icon>mdi-pencil</v-icon>
							</v-btn>
						</v-list-item-action>-->
                    </v-list-item>
                    <v-divider inset></v-divider>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon color="primary">
                                mdi-human-male-female-child
                            </v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>
                                {{ loading ? '...' : file.family.label }} ({{
                                    loading ? '...' : file.version
                                }})
                            </v-list-item-title>
                            <v-list-item-subtitle
                                >Family and version</v-list-item-subtitle
                            >
                        </v-list-item-content>

                        <!--						<v-list-item-action>
							<v-btn icon>
								<v-icon>mdi-pencil</v-icon>
							</v-btn>
						</v-list-item-action>-->
                    </v-list-item>
                </v-list>
                <div
                    class="mt-3 d-flex justify-space-between align-center"
                    id="feature-model-actions"
                >
                    <div>
                        <div class="d-inline-block mr-2">
                            <v-btn
                                color="primary"
                                outlined
                                :to="'/feature-model/' + file.id"
                            >
                                <v-icon dark left>mdi-eye</v-icon>
                                View Model
                            </v-btn>
                        </div>
                        <div class="d-inline-block">
                            <v-btn
                                outlined
                                color="primary"
                                @click="
                                    $router.push({
                                        name: 'FamilyDetail',
                                        params: {
                                            id: file.family.id,
                                            slug: file.family.slug,
                                        },
                                    })
                                "
                            >
                                <v-icon dark left>
                                    mdi-human-male-female-child
                                </v-icon>
                                See Family
                            </v-btn>
                        </div>
                    </div>
                    <div class="d-inline-block">
                        <v-btn
                            outlined
                            color="error"
                            :disabled="file.owner === false"
                            @click="deleteItem(item)"
                        >
                            Delete Model
                        </v-btn>
                    </div>
                </div>
            </v-col>
            <v-col cols="12" md="6">
                <div id="feature-model-artifacts">
                    <h5 class="text-h5 mb-4">Artifacts (tbd)</h5>
                    <div class="my-3">
                        <v-list rounded>
                            <v-subheader>REPORTS</v-subheader>
                            <v-list-item
                                v-for="(item, i) in artifacts"
                                :key="i"
                            >
                                <v-list-item-avatar>
                                    <v-icon> mdi-file-document-outline </v-icon>
                                </v-list-item-avatar>
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{ item.title }}
                                    </v-list-item-title>
                                    <v-list-item-subtitle>
                                        {{ item.subtitle }}
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-action>
                                    <v-btn
                                        icon
                                        @click.stop="showArtifactDialog(item)"
                                    >
                                        <v-icon> mdi-eye </v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </v-list-item>
                        </v-list>
                    </div>
                </div>
                <div class="my-3" id="feature-model-analysis-progress">
                    <div
                        class="d-flex justify-center flex-column align-center my-3"
                    >
                        <span>Analyses Progress:</span>
                        <div class="pa-0" style="width: 100%">
                            <div
                                :style="`width: ${getStati.success.percentage}%!important`"
                                class="d-inline-block"
                            >
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-progress-linear
                                            height="15"
                                            value="100"
                                            color="green"
                                            v-bind="attrs"
                                            v-on="on"
                                        />
                                    </template>
                                    <span>
                                        Success:
                                        {{ getStati.success.absolute }} /
                                        {{ getStati.amount }}
                                    </span>
                                </v-tooltip>
                            </div>
                            <div
                                :style="`width: ${getStati.error.percentage}%!important`"
                                class="d-inline-block"
                            >
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-progress-linear
                                            height="15"
                                            value="100"
                                            color="error"
                                            v-bind="attrs"
                                            v-on="on"
                                        />
                                    </template>
                                    <span>
                                        Error:
                                        {{ getStati.error.absolute }} /
                                        {{ getStati.amount }}
                                    </span>
                                </v-tooltip>
                            </div>
                            <div
                                :style="`width: ${getStati.progress.percentage}%!important`"
                                class="d-inline-block"
                            >
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-progress-linear
                                            height="15"
                                            value="100"
                                            color="primary"
                                            v-bind="attrs"
                                            v-on="on"
                                        />
                                    </template>
                                    <span>
                                        In progress:
                                        {{ getStati.progress.absolute }} /
                                        {{ getStati.amount }}
                                    </span>
                                </v-tooltip>
                            </div>
                        </div>
                    </div>
                    <v-data-table
                        :headers="headersAnalysis"
                        :items="itemsAnalysis"
                        :loading="loading"
                        :search="searchAnalysis"
                        class="elevation-1"
                    >
                        <template v-slot:top>
                            <v-toolbar flat>
                                <v-toolbar-title class="hidden-sm-and-down"
                                    >Analyses</v-toolbar-title
                                >
                                <v-divider
                                    class="mx-4 hidden-sm-and-down"
                                    inset
                                    vertical
                                ></v-divider>
                                <v-spacer class="hidden-sm-and-down"></v-spacer>
                                <v-text-field
                                    v-model="searchAnalysis"
                                    append-icon="mdi-magnify"
                                    hide-details
                                    label="Search"
                                    single-line
                                >
                                </v-text-field>
                            </v-toolbar>
                        </template>
                        <template v-slot:item.status="{ item }">
                            <v-progress-circular
                                v-if="item.status === 0"
                                size="24"
                                width="3"
                                indeterminate
                                color="primary"
                            ></v-progress-circular>
                            <v-icon
                                v-else-if="item.status === 1"
                                color="success"
                            >
                                mdi-check
                            </v-icon>
                            <v-icon v-else color="error"> mdi-cancel</v-icon>
                        </template>
                        <template v-slot:item.id="{ index }">
                            {{ index + 1 }}
                        </template>
                    </v-data-table>
                </div>
            </v-col>
        </v-row>
        <v-dialog v-model="dialogDelete" max-width="400px">
            <v-card>
                <v-card-title class="text-h5" style="word-break: break-word">
                    Are you sure you want to delete this feature model?
                </v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="closeDelete"
                        >Cancel
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn
                        :loading="removeLoading"
                        color="primary"
                        text
                        @click="deleteItemConfirm"
                    >
                        Delete
                    </v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogArtifact" max-width="1200px" width="90vw">
            <v-card>
                <v-card-title class="text-h5">
                    Analysis: {{ selectedArtifact.title }}
                    <v-spacer></v-spacer>
                    <v-btn icon @click="dialogArtifact = false">
                        <v-icon> mdi-close </v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <v-row class="ma-1">
                        <v-col
                            cols="12"
                            :md="isRightFmSelected ? 6 : 8"
                            :lg="isRightFmSelected ? 6 : 9"
                            class="pa-2"
                        >
                            <h6 class="text-h6">{{ file.label }}</h6>
                            <v-skeleton-loader type="card"> </v-skeleton-loader>
                        </v-col>
                        <v-col
                            v-if="!isRightFmSelected"
                            cols="12"
                            md="4"
                            lg="3"
                            class="pa-2"
                            style="border: 2px dashed grey"
                        >
                            <v-sheet
                                v-if="!shouldCompare"
                                height="300px"
                                min-height="190px"
                                width="100%"
                                class="d-flex justify-center align-center pointer-on-hover"
                                @click="compare"
                            >
                                <div class="text-h6 text-info text-center">
                                    Click to compare with another feature model
                                </div>
                            </v-sheet>
                            <div v-else>
                                <v-btn
                                    icon
                                    @click="shouldCompare = false"
                                    class="mr-2"
                                >
                                    <v-icon>mdi-arrow-left</v-icon>
                                </v-btn>
                                <span class="text-subtitle-1"
                                    >My Feature Models</span
                                >
                                <v-progress-circular
                                    style="display: block"
                                    indeterminate
                                    color="primary"
                                    v-if="loadingComparableFM"
                                ></v-progress-circular>
                                <v-list
                                    rounded
                                    v-else
                                    height="300px"
                                    style="overflow-y: auto"
                                >
                                    <v-list-item-group
                                        v-model="selectedRightFM"
                                        color="primary"
                                    >
                                        <v-list-item
                                            v-for="(item, i) in getMyFM"
                                            :key="i"
                                        >
                                            <v-list-item-avatar>
                                                <v-icon>
                                                    mdi-family-tree
                                                </v-icon>
                                            </v-list-item-avatar>
                                            <v-list-item-content>
                                                <v-list-item-title>
                                                    {{ item.label }}
                                                </v-list-item-title>
                                                <v-list-item-subtitle>
                                                    {{
                                                        new Date(
                                                            item.uploaded_at
                                                        ).toLocaleString(
                                                            'en-US'
                                                        )
                                                    }}
                                                </v-list-item-subtitle>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list-item-group>
                                </v-list>
                            </div>
                        </v-col>
                        <v-col v-else cols="12" md="6" lg="6" class="pa-2">
                            <h6 class="text-h6">
                                <v-btn
                                    color="inherit"
                                    icon
                                    @click="selectedRightFM = -1"
                                    class="mr-2"
                                >
                                    <v-icon>mdi-arrow-left</v-icon>
                                </v-btn>
                                {{ getMyFM[selectedRightFM].label }}
                            </h6>
                            <v-skeleton-loader type="card"> </v-skeleton-loader>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-dialog>
        <tutorial-mode
            :show="showTutorial"
            @close="showTutorial = false"
            :next-steps="tutorialSteps"
            local-storage-identifier="fileDetailTutorialCompleted"
        ></tutorial-mode>
        <v-btn
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
import api from '@/services/api.service';
import TutorialMode from '@/components/TutorialMode';

const API_URL = process.env.VUE_APP_DOMAIN;

export default Vue.extend({
    name: 'FileDetail',

    components: {
        TutorialMode,
    },

    props: {},

    data: () => ({
        file: {},
        loading: true,
        dialogDelete: false,
        dialogArtifact: false,
        shouldCompare: false,
        loadingComparableFM: false,
        selectedRightFM: -1,
        selectedArtifact: {},
        rightFmIsSelected: false,
        removeLoading: false,
        searchAnalysis: '',
        headersAnalysis: [
            {
                text: 'ID',
                align: 'start',
                sortable: false,
                value: 'id',
            },
            { text: 'Name', value: 'name' },
            { text: 'Query', value: 'query' },
            { text: 'Status', value: 'status' },
        ],
        itemsAnalysis: [
            {
                id: 1,
                name: 'first analysis',
                query: 'count nodes',
                status: 0,
            },
            {
                id: 2,
                name: 'complex analysis',
                query: 'calculate purpose of life --force',
                status: 1,
            },
            {
                id: 42,
                name: 'another analysis',
                query: 'foo bar',
                status: 0,
            },
        ],
        showTutorial: false,
        tutorialSteps: [
            {
                title: 'Welcome to the tutorial!',
                description:
                    'You can restart the tutorial anytime by clicking on this button.',
                elementCssSelector: '#tutorial-mode',
            },
            {
                title: 'Feature model details',
                description:
                    'Here you can see details and more information about the feature model. You can also view the model and the family. If you are the owner of the model, you can also edit aspects like name or description.',
                elementCssSelector: '#feature-model-details',
            },
            {
                title: 'Feature model actions',
                description:
                    'With those action buttons, you are able to view the model or the family, or - if you are the owner of the model - delete it.',
                elementCssSelector: '#feature-model-actions',
            },
            {
                title: 'The Analyses and progress',
                description:
                    "After uploading a feature model, some predefined analyses will run on them automatically. In this table you'll see those analyses as well as the progress (done, in progress, failed).",
                elementCssSelector: '#feature-model-analysis-progress',
            },
            {
                title: 'Feature model artifacts',
                description:
                    "In this section you'll find artifacts of the feature model. Those artifacts - which are basically files - are automatically generated after the analyses are done. You can view them here.",
                elementCssSelector: '#feature-model-artifacts',
            },
        ],
        artifacts: [
            {
                title: 'Binary',
                subtitle: 'Displaying binaries of feature model',
            },
            {
                title: 'Purpose of life',
                subtitle: 'What is it even?',
            },
            {
                title: 'Complex Document',
                subtitle: 'Generated from analysis: complex analysis',
            },
            {
                title: 'Final.docx',
                subtitle: 'Test file',
            },
        ],
    }),

    async mounted() {
        this.loading = true;
        await this.getFile();
        this.loading = false;
        //await this.fetchFeatureModelOfFamily(this.family.id)
    },

    watch: {
        selectedRightFM: function (newValue) {
            console.log(newValue);
        },
    },

    created() {
        this.showTutorial = !localStorage.fileDetailTutorialCompleted;
    },

    computed: {
        isRightFmSelected() {
            return this.selectedRightFM !== -1;
        },
        getMyFM() {
            return this.$store.state.featureModels.filter((item) => item.owner);
        },
        getStati() {
            /*function compute(amount) {
                return (
                    (this.itemsAnalysis.filter((obj) => obj.status === amount)
                        .length /
                        this.itemsAnalysis.length) *
                    100
                );
            }*/
            return {
                success: {
                    percentage:
                        (this.itemsAnalysis.filter((obj) => obj.status === 1)
                            .length /
                            this.itemsAnalysis.length) *
                        100,
                    absolute: this.itemsAnalysis.filter(
                        (obj) => obj.status === 1
                    ).length,
                },
                error: {
                    percentage:
                        (this.itemsAnalysis.filter((obj) => obj.status === -1)
                            .length /
                            this.itemsAnalysis.length) *
                        100,
                    absolute: this.itemsAnalysis.filter(
                        (obj) => obj.status === -1
                    ).length,
                },
                progress: {
                    percentage:
                        (this.itemsAnalysis.filter((obj) => obj.status === 0)
                            .length /
                            this.itemsAnalysis.length) *
                        100,
                    absolute: this.itemsAnalysis.filter(
                        (obj) => obj.status === 0
                    ).length,
                },
                amount: this.itemsAnalysis.length,
            };
        },
    },

    methods: {
        async getFile() {
            const id = this.$route.params.id;
            await api
                .get(`${API_URL}files/uploaded/confirmed/${id}/`)
                .then((response) => {
                    this.file = response.data;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        deleteItem() {
            this.dialogDelete = true;
        },
        closeDelete() {
            this.dialogDelete = false;
        },
        async deleteItemConfirm() {
            this.removeLoading = true;
            await this.$store.dispatch('deleteFeatureModel', this.file.id);
            await this.$store.dispatch('fetchFiles');
            this.removeLoading = false;
            await this.$router.push('/');
        },
        showArtifactDialog(item) {
            this.selectedArtifact = item;
            this.dialogArtifact = true;
        },
        async compare() {
            this.shouldCompare = true;
            this.loadingComparableFM = true;
            await this.$store.dispatch('fetchFeatureModels');
            this.loadingComparableFM = false;
        },
        /*async fetchFeatureModelOfFamily(value) {
			await api
				.get(`${API_URL}files/uploaded/confirmed/?family=${value}`)
				.then((response) => {
					this.files = response.data
					this.loadingTable = false
				})
		},*/
    },
});
</script>

<style>
.pointer-on-hover:hover {
    cursor: pointer;
}
</style>
