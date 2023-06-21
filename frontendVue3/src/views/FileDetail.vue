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

                <v-list lines="two">
                    <v-list-item>
                        <template v-slot:prepend>
                            <v-icon
                                color="primary"
                                icon="mdi-information"
                            ></v-icon>
                        </template>

                        <v-list-item-title>
                            {{ loading ? '...' : file.label }}
                        </v-list-item-title>
                        <v-list-item-subtitle>Label</v-list-item-subtitle>

                        <template v-slot:append>
                            <v-list-item-action end>
                                <v-btn
                                    icon="mdi-pencil"
                                    variant="tonal"
                                    color="primary"
                                    size="small"
                                >
                                </v-btn>
                            </v-list-item-action>
                        </template>
                    </v-list-item>

                    <v-list-item>
                        <template v-slot:prepend>
                            <v-icon></v-icon>
                        </template>
                        <v-list-item-title>
                            {{ loading ? '...' : file.description }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                            Description
                        </v-list-item-subtitle>

                        <template v-slot:append>
                            <v-list-item-action>
                                <v-btn
                                    icon="mdi-pencil"
                                    variant="tonal"
                                    color="primary"
                                    size="small"
                                >
                                </v-btn>
                            </v-list-item-action>
                        </template>
                    </v-list-item>

                    <v-divider inset></v-divider>

                    <v-list-item>
                        <template v-slot:prepend>
                            <v-icon color="primary" icon="mdi-license"></v-icon>
                        </template>
                        <v-list-item-title>
                            {{ loading ? '...' : file.license.label }}
                        </v-list-item-title>
                        <v-list-item-subtitle>License</v-list-item-subtitle>

                        <!--						<v-list-item-action>
  <v-btn icon>
    <v-icon>mdi-pencil</v-icon>
  </v-btn>
</v-list-item-action>-->
                    </v-list-item>

                    <v-divider inset></v-divider>

                    <v-list-item>
                        <template v-slot:prepend>
                            <v-icon color="primary" icon="mdi-tag"></v-icon>
                        </template>

                        <v-list-item-title v-if="!loading">
                            <v-chip
                                class="mr-2"
                                v-for="tag in file.tags"
                                :key="tag.id"
                                size="small"
                            >
                                {{ tag.label }}
                            </v-chip>
                        </v-list-item-title>
                        <v-list-item-title v-else>...</v-list-item-title>
                        <v-list-item-subtitle>Tags</v-list-item-subtitle>

                        <template v-slot:append>
                            <v-list-item-action>
                                <v-btn
                                    icon="mdi-pencil"
                                    variant="tonal"
                                    color="primary"
                                    size="small"
                                >
                                </v-btn>
                            </v-list-item-action>
                        </template>
                    </v-list-item>
                    <v-divider inset></v-divider>
                    <v-list-item>
                        <template v-slot:prepend>
                            <v-icon
                                color="primary"
                                icon="mdi-calendar"
                            ></v-icon>
                        </template>

                        <v-list-item-title v-if="!loading">
                            {{
                                new Date(file.uploaded_at).toLocaleString(
                                    'en-US'
                                )
                            }}
                        </v-list-item-title>
                        <v-list-item-title v-else>...</v-list-item-title>
                        <v-list-item-subtitle>
                            Uploaded on
                        </v-list-item-subtitle>
                    </v-list-item>
                    <v-divider inset></v-divider>
                    <v-list-item>
                        <template v-slot:prepend>
                            <v-icon
                                color="primary"
                                icon="mdi-human-male-female-child"
                            ></v-icon>
                        </template>

                        <v-list-item-content>
                            <v-list-item-title>
                                {{ loading ? '...' : file.family.label }} ({{
                                    loading ? '...' : file.version
                                }})
                            </v-list-item-title>
                            <v-list-item-subtitle>
                                Family and version
                            </v-list-item-subtitle>
                        </v-list-item-content>
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
                                variant="tonal"
                                prepend-icon="mdi-eye"
                                :to="'/feature-model/' + file.id"
                            >
                                View Model
                            </v-btn>
                        </div>
                        <div class="d-inline-block">
                            <v-btn
                                variant="tonal"
                                color="primary"
                                @click="
                                    router.push({
                                        name: 'FamilyDetail',
                                        params: {
                                            id: file.family.id,
                                            slug: file.family.slug,
                                        },
                                    })
                                "
                                prepend-icon="mdi-human-male-female-child"
                            >
                                See Family
                            </v-btn>
                        </div>
                    </div>
                    <div class="d-inline-block">
                        <v-btn
                            variant="tonal"
                            color="error"
                            :disabled="file.owner === false"
                            @click="deleteItem(item)"
                            prepend-icon="mdi-delete"
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
                                <template v-slot:prepend>
                                    <v-icon
                                        color="primary"
                                        icon="mdi-file-document-outline"
                                    ></v-icon>
                                </template>
                                <v-list-item-title>
                                    {{ item.title }}
                                </v-list-item-title>
                                <v-list-item-subtitle>
                                    {{ item.subtitle }}
                                </v-list-item-subtitle>
                                <template v-slot:append>
                                    <v-list-item-action
                                        style="flex-direction: row"
                                    >
                                        <v-btn
                                            icon="mdi-download"
                                            variant="tonal"
                                            color="success"
                                            size="small"
                                            class="mr-2"
                                        >
                                        </v-btn>
                                        <v-btn
                                            icon="mdi-eye"
                                            variant="tonal"
                                            color="primary"
                                            size="small"
                                            @click.stop="
                                                showArtifactDialog(item)
                                            "
                                        >
                                        </v-btn>
                                    </v-list-item-action>
                                </template>
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
                                <v-tooltip location="bottom">
                                    <template v-slot:activator="{ props }">
                                        <v-progress-linear
                                            height="15"
                                            model-value="100"
                                            color="success"
                                            v-bind="props"
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
                                <v-tooltip location="bottom">
                                    <template v-slot:activator="{ props }">
                                        <v-progress-linear
                                            height="15"
                                            model-value="100"
                                            color="error"
                                            v-bind="props"
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
                                <v-tooltip location="bottom">
                                    <template v-slot:activator="{ props }">
                                        <v-progress-linear
                                            height="15"
                                            model-value="100"
                                            color="primary"
                                            v-bind="props"
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
                        items-per-page="5"
                        class="elevation-1"
                    >
                        <template v-slot:top>
                            <v-toolbar
                                flat
                                style="background-color: transparent"
                            >
                                <v-toolbar-title class="hidden-sm-and-down"
                                    >Analyses
                                </v-toolbar-title>
                                <v-divider
                                    class="mx-4 hidden-sm-and-down"
                                    inset
                                    vertical
                                ></v-divider>
                                <v-spacer class="hidden-sm-and-down"></v-spacer>
                                <v-text-field
                                    density="comfortable"
                                    v-model="searchAnalysis"
                                    append-inner-icon="mdi-magnify"
                                    variant="filled"
                                    clear-icon="mdi-download"
                                    hide-details
                                    label="Search"
                                    single-line
                                    class="mr-4"
                                >
                                </v-text-field>
                            </v-toolbar>
                        </template>
                        <template v-slot:item.status="{ item }">
                            <v-progress-circular
                                v-if="item.raw.status === 0"
                                size="24"
                                width="3"
                                indeterminate
                                color="primary"
                            ></v-progress-circular>
                            <v-icon
                                v-else-if="item.raw.status === 1"
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
        <v-dialog
            v-model="dialogArtifact"
            fullscreen
            transition="dialog-bottom-transition"
        >
            <v-toolbar dark color="primary">
                <!--                <v-icon icon="mdi-file-compare" class="mx-2"></v-icon>-->
                <v-toolbar-title>
                    View and compare Feature Model artifacts:
                    <span class="font-weight-bold">
                        {{ selectedArtifact.title }}
                    </span>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-items>
                    <v-btn
                        icon="mdi-close"
                        dark
                        @click="dialogArtifact = false"
                    >
                    </v-btn>
                </v-toolbar-items>
            </v-toolbar>
            <v-card>
                <v-card-text>
                    <v-row>
                        <v-col cols="12" class="pb-0">
                            <div class="text-subtitle-2">Toggle Headers</div>
                        </v-col>
                        <v-col cols="12" class="d-flex">
                            <v-btn-toggle
                                v-model="selectedCols"
                                multiple
                                density="compact"
                                rounded="xl"
                            >
                                <v-btn
                                    v-for="(
                                        item, index
                                    ) in headerCsvArtifactFull"
                                    :key="index"
                                    size="small"
                                    variant="outlined"
                                    :value="item.key"
                                    :prepend-icon="
                                        selectedCols.includes(item.key)
                                            ? 'mdi-check'
                                            : null
                                    "
                                >
                                    {{ item.title }}
                                </v-btn>
                            </v-btn-toggle>
                            <v-spacer></v-spacer>
                            <v-btn
                                :disabled="selectedCols.length === 0"
                                variant="tonal"
                                value="collapse"
                                rounded="xl"
                                @click="selectedCols = []"
                            >
                                Collapse all
                            </v-btn>
                            <v-btn
                                :disabled="
                                    selectedCols.length ===
                                    headerCsvArtifactFull.length
                                "
                                variant="tonal"
                                value="collapse"
                                rounded="xl"
                                class="ml-2"
                                @click="
                                    selectedCols = headerCsvArtifactFull.map(
                                        (el) => el.key
                                    )
                                "
                            >
                                Expand all
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-divider class="mt-4"></v-divider>
                    <v-row class="ma-1">
                        <v-col
                            cols="12"
                            :md="isRightFmSelected ? 6 : 12"
                            :lg="isRightFmSelected ? 6 : 12"
                            class="pa-2"
                        >
                            <h6 class="text-h6">
                                Feature Model: {{ file.label }}
                            </h6>
                            <v-data-table
                                v-if="selectedArtifact.value.title === 'CSV'"
                                :headers="headerCsvArtifact"
                                :items="itemsCsvArtifact"
                                :items-per-page="10"
                            ></v-data-table>
                            <div v-else>
                                <textarea
                                    v-model="xmlFile"
                                    style="
                                        border: none;
                                        width: 100%;
                                        height: 500px;
                                        color: white;
                                    "
                                >
                                </textarea>
                            </div>
                            <div
                                class="d-flex justify-space-between"
                                style="width: 100%"
                            >
                                <v-btn
                                    color="success"
                                    prepend-icon="mdi-download"
                                >
                                    Download Artifact
                                </v-btn>
                                <v-btn
                                    color="primary"
                                    prepend-icon="mdi-compare-horizontal"
                                >
                                    Compare
                                </v-btn>
                            </div>
                        </v-col>
                        <!--                        <v-col
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
                        </v-col>-->
                        <v-col
                            v-if="isRightFmSelected"
                            cols="12"
                            md="6"
                            lg="6"
                            class="pa-2"
                            style="border-left: 2px solid white"
                        >
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
                            <v-data-table
                                v-if="selectedArtifact.title === 'CSV'"
                                :headers="headerCsvArtifact"
                                :items="itemsCsvArtifact"
                                :items-per-page="10"
                            ></v-data-table>
                            <div v-else>
                                <textarea
                                    v-model="xmlFile"
                                    style="
                                        border: none;
                                        width: 100%;
                                        height: 500px;
                                        color: white;
                                    "
                                >
                                </textarea>
                            </div>
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
            position="fixed"
            color="primary"
            @click="showTutorial = true"
            icon="mdi-school"
            style="bottom: 70px; right: 20px"
        >
        </v-btn>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import api from '@/services/api.service';
import { useFileStore } from '@/store/file';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const fileStore = useFileStore();

const API_URL = import.meta.env.VITE_APP_DOMAIN;

let file = reactive({});
const loading = ref(true);
const dialogDelete = ref(false);
const dialogArtifact = ref(false);
const shouldCompare = ref(false);
const loadingComparableFM = ref(false);
const selectedRightFM = ref(-1);
const selectedArtifact = {};
const rightFmIsSelected = ref(false);
const removeLoading = ref(false);
const searchAnalysis = ref('');
const headersAnalysis = [
    /*{
        title: 'ID',
        align: 'start',
        sortable: false,
        key: 'id',
    },*/
    { title: 'Name', key: 'name' },
    { title: 'Query', key: 'query' },
    { title: 'Status', key: 'status' },
];
const itemsAnalysis = [
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
];
const showTutorial = ref(false);
const tutorialSteps = [
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
];
const artifacts = [
    {
        title: 'CSV',
        subtitle: 'Displaying CSV of feature model',
    },
    {
        title: 'XML',
        subtitle: 'Displaying XML of feature model',
    },
    {
        title: 'Complex Document',
        subtitle: 'Generated from analysis: complex analysis',
    },
];
const headerCsvArtifactFull = [
    { title: 'Input File', key: 'input_file' },
    { title: 'Input Hash', key: 'input_hash' },
    { title: 'SVO', key: 'svo' },
    { title: 'DVO', key: 'dvo' },
    { title: 'DVO Time', key: 'dvo_time' },
    { title: 'BDD Compiler', key: 'bdd_compiler' },
    { title: 'BDD Bootstrap', key: 'bdd_bootstrap' },
    { title: 'BDD Compile', key: 'bdd_compile' },
    { title: 'BDD Timeout', key: 'bdd_timeout' },
    { title: 'BDD Size', key: 'bdd_size' },
];
const headerCsvArtifact = ref([
    { title: 'Input File', key: 'input_file' },
    { title: 'Input Hash', key: 'input_hash' },
    { title: 'SVO', key: 'svo' },
    { title: 'DVO', key: 'dvo' },
    { title: 'DVO Time', key: 'dvo_time' },
    { title: 'BDD Compiler', key: 'bdd_compiler' },
    { title: 'BDD Bootstrap', key: 'bdd_bootstrap' },
    { title: 'BDD Compile', key: 'bdd_compile' },
    { title: 'BDD Timeout', key: 'bdd_timeout' },
    { title: 'BDD Size', key: 'bdd_size' },
]);
const itemsCsvArtifact = [
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.006,
        bdd_compile: 44.813,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force',
        dvo: '',
        dvo_time: '',
        bdd_compiler: '',
        bdd_bootstrap: null,
        bdd_compile: null,
        bdd_timeout: null,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.008,
        bdd_compile: 45.037,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force',
        dvo: '',
        dvo_time: '',
        bdd_compiler: '',
        bdd_bootstrap: null,
        bdd_compile: null,
        bdd_timeout: null,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.01,
        bdd_compile: 32.266,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.006,
        bdd_compile: 31.951,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force',
        dvo: '',
        dvo_time: '',
        bdd_compiler: '',
        bdd_bootstrap: null,
        bdd_compile: null,
        bdd_timeout: null,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.006,
        bdd_compile: 37.242,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force',
        dvo: '',
        dvo_time: '',
        bdd_compiler: '',
        bdd_bootstrap: null,
        bdd_compile: null,
        bdd_timeout: null,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force',
        dvo: '',
        dvo_time: '',
        bdd_compiler: '',
        bdd_bootstrap: null,
        bdd_compile: null,
        bdd_timeout: null,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-best',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.006,
        bdd_compile: 36.179,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-best',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.01,
        bdd_compile: 34.675,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-best',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.009,
        bdd_compile: 46.592,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-best',
        dvo: '',
        dvo_time: '',
        bdd_compiler: '',
        bdd_bootstrap: null,
        bdd_compile: null,
        bdd_timeout: null,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-best',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.007,
        bdd_compile: 40.298,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-best',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.005,
        bdd_compile: 44.059,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-best',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.006,
        bdd_compile: 36.9,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-best',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.006,
        bdd_compile: 41.094,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-best',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.008,
        bdd_compile: 35.726,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-best',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.01,
        bdd_compile: 27.533,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-avg',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.01,
        bdd_compile: 32.349,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-avg',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.01,
        bdd_compile: 41.088,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-avg',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.005,
        bdd_compile: 34.342,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-avg',
        dvo: '',
        dvo_time: '',
        bdd_compiler: '',
        bdd_bootstrap: null,
        bdd_compile: null,
        bdd_timeout: null,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-avg',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.01,
        bdd_compile: 30.061,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-avg',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.009,
        bdd_compile: 35.78,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-avg',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.011,
        bdd_compile: 36.598,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-avg',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.009,
        bdd_compile: 36.843,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-avg',
        dvo: 'SIFTC',
        dvo_time: '',
        bdd_compiler: 'cudd',
        bdd_bootstrap: 0.01,
        bdd_compile: 31.673,
        bdd_timeout: false,
        bdd_size: '',
    },
    {
        input_file: 'busybox.dimacs',
        input_hash: '287b501faf4c816afd0fe517c85ab7ed',
        svo: 'force-avg',
        dvo: '',
        dvo_time: '',
        bdd_compiler: '',
        bdd_bootstrap: null,
        bdd_compile: null,
        bdd_timeout: null,
        bdd_size: '',
    },
];
const xmlFile = `
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<feature_model name="FeatureIDE model">
    <feature_tree>
:r __Root__(__Root__)
\t:o FEATURE_INSMOD_VERSION_CHECKING(FEATURE_INSMOD_VERSION_CHECKING)
\t:o NC_EXTRA(NC_EXTRA)
\t:o FEATURE_SH_STANDALONE(FEATURE_SH_STANDALONE)
\t:o STATIC(STATIC)
\t:o FEATURE_LESS_LINENUMS(FEATURE_LESS_LINENUMS)
\t:o RAIDAUTORUN(RAIDAUTORUN)
\t:o GETENFORCE(GETENFORCE)
\t:o FEATURE_CHAT_TTY_HIFI(FEATURE_CHAT_TTY_HIFI)
\t:o HEXDUMP(HEXDUMP)
\t:o FEATURE_MOUNT_VERBOSE(FEATURE_MOUNT_VERBOSE)
\t:o FEATURE_FIND_INUM(FEATURE_FIND_INUM)
\t:o EXPAND(EXPAND)
\t:o RUNLEVEL(RUNLEVEL)
\t:o HDPARM(HDPARM)
\t:o INIT_TERMINAL_TYPE(INIT_TERMINAL_TYPE)
\t:o AR(AR)
\t:o FEATURE_EJECT_SCSI(FEATURE_EJECT_SCSI)
\t:o SED(SED)
\t:o SENDMAIL(SENDMAIL)
\t:o SETFILES(SETFILES)
\t:o FEATURE_VI_SEARCH(FEATURE_VI_SEARCH)
\t:o SEQ(SEQ)
\t:o FEATURE_FBSET_FANCY(FEATURE_FBSET_FANCY)
\t:o WATCH(WATCH)
\t:o TFTP(TFTP)
\t:o FEATURE_TOP_SMP_PROCESS(FEATURE_TOP_SMP_PROCESS)
\t:o HUSH_FUNCTIONS(HUSH_FUNCTIONS)
\t:o FEATURE_CROND_DIR(FEATURE_CROND_DIR)
\t:o FEATURE_FBSET_READMODE(FEATURE_FBSET_READMODE)
\t:o HALT(HALT)
\t:o INSTALL_APPLET_SCRIPT_WRAPPERS(INSTALL_APPLET_SCRIPT_WRAPPERS)
\t:o FLASHCP(FLASHCP)
\t:o FEATURE_WGET_TIMEOUT(FEATURE_WGET_TIMEOUT)
\t:o BRCTL(BRCTL)
\t:o FEATURE_DF_FANCY(FEATURE_DF_FANCY)
\t:o CP(CP)
\t:o FEATURE_LS_FILETYPES(FEATURE_LS_FILETYPES)
\t:o NBDCLIENT(NBDCLIENT)
\t:o FEATURE_ADDUSER_LONG_OPTIONS(FEATURE_ADDUSER_LONG_OPTIONS)
\t:o FEATURE_UDHCP_PORT(FEATURE_UDHCP_PORT)
\t:o DNSD(DNSD)
\t:o HUSH_LOCAL(HUSH_LOCAL)
\t:o DC(DC)
\t:o DD(DD)
\t:o STTY(STTY)
\t:o DF(DF)
\t:o UNICODE_BIDI_SUPPORT(UNICODE_BIDI_SUPPORT)
\t:o FEATURE_TAR_TO_COMMAND(FEATURE_TAR_TO_COMMAND)
\t:o LOAD_POLICY(LOAD_POLICY)
\t:o TUNE2FS(TUNE2FS)
\t:o FEATURE_FANCY_TAIL(FEATURE_FANCY_TAIL)
\t:o IPADDR(IPADDR)
\t:o DU(DU)
\t:o FEATURE_SHOW_THREADS(FEATURE_SHOW_THREADS)
\t:o FEATURE_READLINK_FOLLOW(FEATURE_READLINK_FOLLOW)
\t:o LOGNAME(LOGNAME)
\t:o FEATURE_FIND_PRUNE(FEATURE_FIND_PRUNE)
\t:o INSTALL_SH_APPLET_SCRIPT_WRAPPER(INSTALL_SH_APPLET_SCRIPT_WRAPPER)
\t:o ED(ED)
\t:o FEATURE_TFTP_GET(FEATURE_TFTP_GET)
\t:o MDEV(MDEV)
\t:o HUSH_SAVEHISTORY(HUSH_SAVEHISTORY)
\t:o NC_110_COMPAT(NC_110_COMPAT)
\t:o FEATURE_STAT_FORMAT(FEATURE_STAT_FORMAT)
\t:o FEATURE_XARGS_SUPPORT_TERMOPT(FEATURE_XARGS_SUPPORT_TERMOPT)
\t:o PASSWORD_MINLEN(PASSWORD_MINLEN)
\t:o CHROOT(CHROOT)
\t:o SETSID(SETSID)
\t:o FEATURE_LAST_SMALL_alt(FEATURE_LAST_SMALL_alt)
\t:o UBIATTACH(UBIATTACH)
\t:o FEATURE_COMPRESS_USAGE(FEATURE_COMPRESS_USAGE)
\t:o UNLZMA(UNLZMA)
\t:o FEATURE_HDPARM_GET_IDENTITY(FEATURE_HDPARM_GET_IDENTITY)
\t:o FEATURE_FIND_NEWER(FEATURE_FIND_NEWER)
\t:o TUNCTL(TUNCTL)
\t:o FEATURE_KILL_REMOVED(FEATURE_KILL_REMOVED)
\t:o BASENAME(BASENAME)
\t:o MKFIFO(MKFIFO)
\t:o UNCOMPRESS(UNCOMPRESS)
\t:o MD5SUM(MD5SUM)
\t:o FEATURE_LS_COLOR_IS_DEFAULT(FEATURE_LS_COLOR_IS_DEFAULT)
\t:o UNEXPAND(UNEXPAND)
\t:o REMOVE_SHELL(REMOVE_SHELL)
\t:o root(root)
\t:o FEATURE_AUTOWIDTH(FEATURE_AUTOWIDTH)
\t:o FEATURE_MOUNT_NFS(FEATURE_MOUNT_NFS)
\t:o HUSH_IF(HUSH_IF)
\t:o BB_SYSCTL(BB_SYSCTL)
\t:o FEATURE_FIND_TYPE(FEATURE_FIND_TYPE)
\t:o FEATURE_HTTPD_SET_REMOTE_PORT_TO_ENV(FEATURE_HTTPD_SET_REMOTE_PORT_TO_ENV)
\t:o FEATURE_MINIX2(FEATURE_MINIX2)
\t:o FEATURE_BOOTCHARTD_BLOATED_HEADER(FEATURE_BOOTCHARTD_BLOATED_HEADER)
\t:o TELNET(TELNET)
\t:o FEATURE_SEAMLESS_LZMA(FEATURE_SEAMLESS_LZMA)
\t:o FEATURE_IP_RULE(FEATURE_IP_RULE)
\t:o HOSTNAME(HOSTNAME)
\t:o FEATURE_HTTPD_RANGES(FEATURE_HTTPD_RANGES)
\t:o FGCONSOLE(FGCONSOLE)
\t:o FEATURE_FIND_GROUP(FEATURE_FIND_GROUP)
\t:o HD(HD)
\t:o TRACEROUTE(TRACEROUTE)
\t:o HUSH_MODE_X(HUSH_MODE_X)
\t:o DMALLOC_alt(DMALLOC_alt)
\t:o FEATURE_XARGS_SUPPORT_ZERO_TERM(FEATURE_XARGS_SUPPORT_ZERO_TERM)
\t:o FEATURE_FIND_REGEX(FEATURE_FIND_REGEX)
\t:o UDHCPC_DEFAULT_SCRIPT(UDHCPC_DEFAULT_SCRIPT)
\t:o MODPROBE_SMALL(MODPROBE_SMALL)
\t:o DELUSER(DELUSER)
\t:o FEATURE_FLOAT_SLEEP(FEATURE_FLOAT_SLEEP)
\t:o ASH_MAIL(ASH_MAIL)
\t:o CTTYHACK(CTTYHACK)
\t:o SETCONSOLE(SETCONSOLE)
\t:o FEATURE_VI_DOT_CMD(FEATURE_VI_DOT_CMD)
\t:o BASE64(BASE64)
\t:o FDISK(FDISK)
\t:o UNZIP(UNZIP)
\t:o ID(ID)
\t:o FEATURE_DEVFS(FEATURE_DEVFS)
\t:o NOMMU(NOMMU)
\t:o FEATURE_VOLUMEID_FAT(FEATURE_VOLUMEID_FAT)
\t:o FEATURE_SH_IS_HUSH_alt(FEATURE_SH_IS_HUSH_alt)
\t:o IP(IP)
\t:o USE_BB_PWD_GRP(USE_BB_PWD_GRP)
\t:o FEATURE_SUID(FEATURE_SUID)
\t:o DUMPKMAP(DUMPKMAP)
\t:o MAN(MAN)
\t:o FEATURE_TRACEROUTE_VERBOSE(FEATURE_TRACEROUTE_VERBOSE)
\t:o PIVOT_ROOT(PIVOT_ROOT)
\t:o FEATURE_NAMEIF_EXTENDED(FEATURE_NAMEIF_EXTENDED)
\t:o FEATURE_VOLUMEID_HFS(FEATURE_VOLUMEID_HFS)
\t:o RPM2CPIO(RPM2CPIO)
\t:o FEATURE_VI_8BIT(FEATURE_VI_8BIT)
\t:o MONOTONIC_SYSCALL(MONOTONIC_SYSCALL)
\t:o FEATURE_MDEV_RENAME(FEATURE_MDEV_RENAME)
\t:o TFTPD(TFTPD)
\t:o FEATURE_LS_USERNAME(FEATURE_LS_USERNAME)
\t:o PING(PING)
\t:o INOTIFYD(INOTIFYD)
\t:o FEATURE_IP_TUNNEL(FEATURE_IP_TUNNEL)
\t:o START_STOP_DAEMON(START_STOP_DAEMON)
\t:o INCLUDE_SUSv2(INCLUDE_SUSv2)
\t:o FEATURE_LESS_MARKS(FEATURE_LESS_MARKS)
\t:o FEATURE_MDEV_LOAD_FIRMWARE(FEATURE_MDEV_LOAD_FIRMWARE)
\t:o FEATURE_SPLIT_FANCY(FEATURE_SPLIT_FANCY)
\t:o SELINUX(SELINUX)
\t:o FEATURE_TOP_DECIMALS(FEATURE_TOP_DECIMALS)
\t:o FEATURE_VI_YANKMARK(FEATURE_VI_YANKMARK)
\t:o GZIP(GZIP)
\t:o FEATURE_FTP_WRITE(FEATURE_FTP_WRITE)
\t:o LN(LN)
\t:o MPSTAT(MPSTAT)
\t:o LS(LS)
\t:o RESET(RESET)
\t:o LOGREAD(LOGREAD)
\t:o PING6(PING6)
\t:o UNICODE_WIDE_WCHARS(UNICODE_WIDE_WCHARS)
\t:o FLOCK(FLOCK)
\t:o LSATTR(LSATTR)
\t:o FEATURE_CALL_TELINIT(FEATURE_CALL_TELINIT)
\t:o FEATURE_INDIVIDUAL(FEATURE_INDIVIDUAL)
\t:o LAST_SYSTEM_ID(LAST_SYSTEM_ID)
\t:o FEATURE_TFTP_PROGRESS_BAR(FEATURE_TFTP_PROGRESS_BAR)
\t:o FEATURE_DPKG_DEB_EXTRACT_ONLY(FEATURE_DPKG_DEB_EXTRACT_ONLY)
\t:o READPROFILE(READPROFILE)
\t:o UNIQ(UNIQ)
\t:o MT(MT)
\t:o ADDUSER(ADDUSER)
\t:o MV(MV)
\t:o FEATURE_NOLOGIN(FEATURE_NOLOGIN)
\t:o WHOAMI(WHOAMI)
\t:o FEATURE_LESS_REGEXP(FEATURE_LESS_REGEXP)
\t:o NC(NC)
\t:o ACPID(ACPID)
\t:o LESS(LESS)
\t:o CHATTR(CHATTR)
\t:o TFTP_DEBUG(TFTP_DEBUG)
\t:o XARGS(XARGS)
\t:o FEATURE_WC_LARGE(FEATURE_WC_LARGE)
\t:o FEATURE_VOLUMEID_LUKS(FEATURE_VOLUMEID_LUKS)
\t:o BOOTCHARTD(BOOTCHARTD)
\t:o FEATURE_LOGREAD_REDUCED_LOCKING(FEATURE_LOGREAD_REDUCED_LOCKING)
\t:o FEATURE_VOLUMEID_UDF(FEATURE_VOLUMEID_UDF)
\t:o TCPSVD(TCPSVD)
\t:o FEATURE_TAB_COMPLETION(FEATURE_TAB_COMPLETION)
\t:o FEATURE_MDEV_RENAME_REGEXP(FEATURE_MDEV_RENAME_REGEXP)
\t:o FSCK(FSCK)
\t:o SHA512SUM(SHA512SUM)
\t:o EXPR(EXPR)
\t:o OD(OD)
\t:o DPKG_DEB(DPKG_DEB)
\t:o FEATURE_HWIB(FEATURE_HWIB)
\t:o MKTEMP(MKTEMP)
\t:o WALL(WALL)
\t:o FEATURE_FIND_PAREN(FEATURE_FIND_PAREN)
\t:o FEATURE_TAR_AUTODETECT(FEATURE_TAR_AUTODETECT)
\t:o ADD_SHELL(ADD_SHELL)
\t:o FEATURE_DATE_ISOFMT(FEATURE_DATE_ISOFMT)
\t:o FEATURE_IP_LINK(FEATURE_IP_LINK)
\t:o PRINTENV(PRINTENV)
\t:o SLEEP(SLEEP)
\t:o PS(PS)
\t:o ECHO(ECHO)
\t:o FEATURE_VOLUMEID_REISERFS(FEATURE_VOLUMEID_REISERFS)
\t:o SMEMCAP(SMEMCAP)
\t:o FEATURE_SU_SYSLOG(FEATURE_SU_SYSLOG)
\t:o FEATURE_SH_EXTRA_QUIET(FEATURE_SH_EXTRA_QUIET)
\t:o DIRNAME(DIRNAME)
\t:o INETD(INETD)
\t:o READAHEAD(READAHEAD)
\t:o NTPD(NTPD)
\t:o FEATURE_MD5_SHA1_SUM_CHECK(FEATURE_MD5_SHA1_SUM_CHECK)
\t:o LSUSB(LSUSB)
\t:o FEATURE_LAST_FANCY(FEATURE_LAST_FANCY)
\t:o FEATURE_EDITING_VI(FEATURE_EDITING_VI)
\t:o SUM(SUM)
\t:o FLASH_ERASEALL(FLASH_ERASEALL)
\t:o FEATURE_BUFFERS_USE_MALLOC(FEATURE_BUFFERS_USE_MALLOC)
\t:o IOCTL_HEX2STR_ERROR(IOCTL_HEX2STR_ERROR)
\t:o DEFAULT_SETFONT_DIR(DEFAULT_SETFONT_DIR)
\t:o FEATURE_INETD_SUPPORT_BUILTIN_TIME(FEATURE_INETD_SUPPORT_BUILTIN_TIME)
\t:o MAKEMIME(MAKEMIME)
\t:o RM(RM)
\t:o FEATURE_TOP_CPU_USAGE_PERCENTAGE(FEATURE_TOP_CPU_USAGE_PERCENTAGE)
\t:o FEATURE_VOLUMEID_LINUXSWAP(FEATURE_VOLUMEID_LINUXSWAP)
\t:o FEATURE_MODUTILS_SYMBOLS(FEATURE_MODUTILS_SYMBOLS)
\t:o HUSH_BASH_COMPAT(HUSH_BASH_COMPAT)
\t:o FEATURE_MIME_CHARSET(FEATURE_MIME_CHARSET)
\t:o PSCAN(PSCAN)
\t:o RX(RX)
\t:o SETKEYCODES(SETKEYCODES)
\t:o FEATURE_BASH_IS_ASH(FEATURE_BASH_IS_ASH)
\t:o CPIO(CPIO)
\t:o FEATURE_ALLOW_EXEC(FEATURE_ALLOW_EXEC)
\t:o FEATURE_CP_LONG_OPTIONS(FEATURE_CP_LONG_OPTIONS)
\t:o FEATURE_IFUPDOWN_IFCONFIG_BUILTIN(FEATURE_IFUPDOWN_IFCONFIG_BUILTIN)
\t:o SH_MATH_SUPPORT_64(SH_MATH_SUPPORT_64)
\t:o FEATURE_VOLUMEID_CRAMFS(FEATURE_VOLUMEID_CRAMFS)
\t:o FTPPUT(FTPPUT)
\t:o FEATURE_VI_READONLY(FEATURE_VI_READONLY)
\t:o FEATURE_TUNCTL_UG(FEATURE_TUNCTL_UG)
\t:o MKFS_EXT2(MKFS_EXT2)
\t:o ASH_OPTIMIZE_FOR_SIZE(ASH_OPTIMIZE_FOR_SIZE)
\t:o SU(SU)
\t:o SV(SV)
\t:o IFCONFIG(IFCONFIG)
\t:o FEATURE_GZIP_LONG_OPTIONS(FEATURE_GZIP_LONG_OPTIONS)
\t:o FEATURE_ADDUSER_TO_GROUP(FEATURE_ADDUSER_TO_GROUP)
\t:o PRINTF(PRINTF)
\t:o SWAPONOFF(SWAPONOFF)
\t:o UPTIME(UPTIME)
\t:o FEATURE_INSMOD_LOADINKMEM(FEATURE_INSMOD_LOADINKMEM)
\t:o FEATURE_RUNCON_LONG_OPTIONS(FEATURE_RUNCON_LONG_OPTIONS)
\t:o FEATURE_DC_LIBM(FEATURE_DC_LIBM)
\t:o TR(TR)
\t:o FEATURE_LOADFONT_RAW(FEATURE_LOADFONT_RAW)
\t:o FEATURE_SORT_BIG(FEATURE_SORT_BIG)
\t:o FEATURE_EDITING_MAX_LEN(FEATURE_EDITING_MAX_LEN)
\t:o FEATURE_TRACEROUTE_USE_ICMP(FEATURE_TRACEROUTE_USE_ICMP)
\t:o FEATURE_HDPARM_HDIO_UNREGISTER_HWIF(FEATURE_HDPARM_HDIO_UNREGISTER_HWIF)
\t:o FEATURE_BUFFERS_GO_IN_BSS_alt(FEATURE_BUFFERS_GO_IN_BSS_alt)
\t:o VOLUMEID(VOLUMEID)
\t:o SETLOGCONS(SETLOGCONS)
\t:o FEATURE_LS_FOLLOWLINKS(FEATURE_LS_FOLLOWLINKS)
\t:o FEATURE_HTTPD_CONFIG_WITH_SCRIPT_INTERPR(FEATURE_HTTPD_CONFIG_WITH_SCRIPT_INTERPR)
\t:o DEFAULT_MODULES_DIR(DEFAULT_MODULES_DIR)
\t:o NANDWRITE(NANDWRITE)
\t:o FEATURE_BOOTCHARTD_CONFIG_FILE(FEATURE_BOOTCHARTD_CONFIG_FILE)
\t:o FEATURE_HTTPD_AUTH_MD5(FEATURE_HTTPD_AUTH_MD5)
\t:o FEATURE_IPCALC_FANCY(FEATURE_IPCALC_FANCY)
\t:o LOADFONT(LOADFONT)
\t:o FEATURE_TELNETD_STANDALONE(FEATURE_TELNETD_STANDALONE)
\t:o FEATURE_DATE_COMPAT(FEATURE_DATE_COMPAT)
\t:o FEATURE_CHAT_SEND_ESCAPES(FEATURE_CHAT_SEND_ESCAPES)
\t:o PASSWD(PASSWD)
\t:o FEATURE_SU_CHECKS_SHELLS(FEATURE_SU_CHECKS_SHELLS)
\t:o IFUPDOWN(IFUPDOWN)
\t:o NMETER(NMETER)
\t:o MATCHPATHCON(MATCHPATHCON)
\t:o VI(VI)
\t:o SESTATUS(SESTATUS)
\t:o SETFONT(SETFONT)
\t:o LAST(LAST)
\t:o ARPING(ARPING)
\t:o SYNC(SYNC)
\t:o FEATURE_TELNET_TTYPE(FEATURE_TELNET_TTYPE)
\t:o FEATURE_TFTP_BLOCKSIZE(FEATURE_TFTP_BLOCKSIZE)
\t:o RESTORECON(RESTORECON)
\t:o INSTALL_APPLET_DONT(INSTALL_APPLET_DONT)
\t:o WC(WC)
\t:o FEATURE_MOUNT_FLAGS(FEATURE_MOUNT_FLAGS)
\t:o SHA256SUM(SHA256SUM)
\t:o FEATURE_TELNETD_INETD_WAIT(FEATURE_TELNETD_INETD_WAIT)
\t:o FEATURE_ADDGROUP_LONG_OPTIONS(FEATURE_ADDGROUP_LONG_OPTIONS)
\t:o FEATURE_DIFF_LONG_OPTIONS(FEATURE_DIFF_LONG_OPTIONS)
\t:o FEATURE_PS_WIDE(FEATURE_PS_WIDE)
\t:o FEATURE_START_STOP_DAEMON_FANCY(FEATURE_START_STOP_DAEMON_FANCY)
\t:o FEATURE_LS_RECURSIVE(FEATURE_LS_RECURSIVE)
\t:o FEATURE_GREP_FGREP_ALIAS(FEATURE_GREP_FGREP_ALIAS)
\t:o TIME(TIME)
\t:o FEATURE_IP_SHORT_FORMS(FEATURE_IP_SHORT_FORMS)
\t:o CRYPTPW(CRYPTPW)
\t:o FEATURE_MOUNT_HELPERS(FEATURE_MOUNT_HELPERS)
\t:o BUNZIP2(BUNZIP2)
\t:o HUSH_CASE(HUSH_CASE)
\t:o SYSLOGD(SYSLOGD)
\t:o FEATURE_INETD_SUPPORT_BUILTIN_ECHO(FEATURE_INETD_SUPPORT_BUILTIN_ECHO)
\t:o GREP(GREP)
\t:o SOFTLIMIT(SOFTLIMIT)
\t:o FEATURE_2_4_MODULES(FEATURE_2_4_MODULES)
\t:o FALSE(FALSE)
\t:o FEATURE_VI_ASK_TERMINAL(FEATURE_VI_ASK_TERMINAL)
\t:o FEATURE_IFUPDOWN_EXTERNAL_DHCP(FEATURE_IFUPDOWN_EXTERNAL_DHCP)
\t:o FEATURE_SUID_CONFIG(FEATURE_SUID_CONFIG)
\t:o FEATURE_WTMP(FEATURE_WTMP)
\t:o XZ(XZ)
\t:o CKSUM(CKSUM)
\t:o FEATURE_SH_NOFORK(FEATURE_SH_NOFORK)
\t:o FEATURE_TAR_OLDSUN_COMPATIBILITY(FEATURE_TAR_OLDSUN_COMPATIBILITY)
\t:o FEATURE_CHCON_LONG_OPTIONS(FEATURE_CHCON_LONG_OPTIONS)
\t:o LOGIN(LOGIN)
\t:o IPCRM(IPCRM)
\t:o FLASH_UNLOCK(FLASH_UNLOCK)
\t:o FEATURE_SGI_LABEL(FEATURE_SGI_LABEL)
\t:o FEATURE_FANCY_HEAD(FEATURE_FANCY_HEAD)
\t:o FEATURE_MODPROBE_SMALL_CHECK_ALREADY_LOADED(FEATURE_MODPROBE_SMALL_CHECK_ALREADY_LOADED)
\t:o SV_DEFAULT_SERVICE_DIR(SV_DEFAULT_SERVICE_DIR)
\t:o FEATURE_EDITING_SAVEHISTORY(FEATURE_EDITING_SAVEHISTORY)
\t:o VCONFIG(VCONFIG)
\t:o SCRIPTREPLAY(SCRIPTREPLAY)
\t:o FEATURE_CLEAN_UP(FEATURE_CLEAN_UP)
\t:o FEATURE_INSMOD_TRY_MMAP(FEATURE_INSMOD_TRY_MMAP)
\t:o FEATURE_BASH_IS_HUSH(FEATURE_BASH_IS_HUSH)
\t:o FEATURE_INITRD(FEATURE_INITRD)
\t:o FEATURE_ENV_LONG_OPTIONS(FEATURE_ENV_LONG_OPTIONS)
\t:o FEATURE_HEXDUMP_REVERSE(FEATURE_HEXDUMP_REVERSE)
\t:o FEATURE_FIND_LINKS(FEATURE_FIND_LINKS)
\t:o CHAT(CHAT)
\t:o LENGTH(LENGTH)
\t:o FEATURE_MKSWAP_UUID(FEATURE_MKSWAP_UUID)
\t:o FEATURE_IFCONFIG_BROADCAST_PLUS(FEATURE_IFCONFIG_BROADCAST_PLUS)
\t:o EFENCE(EFENCE)
\t:o FEATURE_HWCLOCK_LONG_OPTIONS(FEATURE_HWCLOCK_LONG_OPTIONS)
\t:o FEATURE_MODPROBE_BLACKLIST(FEATURE_MODPROBE_BLACKLIST)
\t:o FEATURE_CHAT_SWALLOW_OPTS(FEATURE_CHAT_SWALLOW_OPTS)
\t:o FEATURE_SH_IS_HUSH(FEATURE_SH_IS_HUSH)
\t:o MSH(MSH)
\t:o FEATURE_FIND_USER(FEATURE_FIND_USER)
\t:o FEATURE_UDHCPD_WRITE_LEASES_EARLY(FEATURE_UDHCPD_WRITE_LEASES_EARLY)
\t:o FEATURE_CROND_CALL_SENDMAIL(FEATURE_CROND_CALL_SENDMAIL)
\t:o FEATURE_BRCTL_SHOW(FEATURE_BRCTL_SHOW)
\t:o FEATURE_AIX_LABEL(FEATURE_AIX_LABEL)
\t:o KBD_MODE(KBD_MODE)
\t:o FEATURE_VOLUMEID_SYSV(FEATURE_VOLUMEID_SYSV)
\t:o MORE(MORE)
\t:o TAC(TAC)
\t:o UNXZ(UNXZ)
\t:o KILL(KILL)
\t:o CATV(CATV)
\t:o FEATURE_CHAT_IMPLICIT_CR(FEATURE_CHAT_IMPLICIT_CR)
\t:o INSTALL_SH_APPLET_SCRIPT_WRAPPER_alt(INSTALL_SH_APPLET_SCRIPT_WRAPPER_alt)
\t:o FEATURE_INETD_SUPPORT_BUILTIN_DISCARD(FEATURE_INETD_SUPPORT_BUILTIN_DISCARD)
\t:o FEATURE_CPIO_P(FEATURE_CPIO_P)
\t:o TAR(TAR)
\t:o FEATURE_CPIO_O(FEATURE_CPIO_O)
\t:o ASH_CMDCMD(ASH_CMDCMD)
\t:o DEBUG_PESSIMIZE(DEBUG_PESSIMIZE)
\t:o HUSH_JOB(HUSH_JOB)
\t:o RTCWAKE(RTCWAKE)
\t:o UNICODE_NEUTRAL_TABLE(UNICODE_NEUTRAL_TABLE)
\t:o FEATURE_LOADFONT_PSF2(FEATURE_LOADFONT_PSF2)
\t:o FEATURE_FIND_MAXDEPTH(FEATURE_FIND_MAXDEPTH)
\t:o FREERAMDISK(FREERAMDISK)
\t:o FEATURE_TEE_USE_BLOCK_IO(FEATURE_TEE_USE_BLOCK_IO)
\t:o MKSWAP(MKSWAP)
\t:o FEATURE_PS_ADDITIONAL_COLUMNS(FEATURE_PS_ADDITIONAL_COLUMNS)
\t:o HOSTID(HOSTID)
\t:o FEATURE_TAR_OLDGNU_COMPATIBILITY(FEATURE_TAR_OLDGNU_COMPATIBILITY)
\t:o RDATE(RDATE)
\t:o RUNCON(RUNCON)
\t:o CHPASSWD(CHPASSWD)
\t:o LSMOD(LSMOD)
\t:o CAL(CAL)
\t:o MODPROBE(MODPROBE)
\t:o IPROUTE(IPROUTE)
\t:o LAST_SUPPORTED_WCHAR(LAST_SUPPORTED_WCHAR)
\t:o FEATURE_EXTRA_QUIET(FEATURE_EXTRA_QUIET)
\t:o LZOP_COMPR_HIGH(LZOP_COMPR_HIGH)
\t:o PREFIX(PREFIX)
\t:o UNICODE_USING_LOCALE(UNICODE_USING_LOCALE)
\t:o CAT(CAT)
\t:o INSTALL_SH_APPLET_HARDLINK(INSTALL_SH_APPLET_HARDLINK)
\t:o FEATURE_IFCONFIG_HW(FEATURE_IFCONFIG_HW)
\t:o FEATURE_UTMP(FEATURE_UTMP)
\t:o HAVE_DOT_CONFIG(HAVE_DOT_CONFIG)
\t:o FEATURE_ROTATE_LOGFILE(FEATURE_ROTATE_LOGFILE)
\t:o FEATURE_FIND_PATH(FEATURE_FIND_PATH)
\t:o FEATURE_RUNSVDIR_LOG(FEATURE_RUNSVDIR_LOG)
\t:o FEATURE_DIFF_DIR(FEATURE_DIFF_DIR)
\t:o FEATURE_SHADOWPASSWDS(FEATURE_SHADOWPASSWDS)
\t:o LOGIN_SCRIPTS(LOGIN_SCRIPTS)
\t:o SLATTACH(SLATTACH)
\t:o FEATURE_AR_CREATE(FEATURE_AR_CREATE)
\t:o FEATURE_DD_SIGNAL_HANDLING(FEATURE_DD_SIGNAL_HANDLING)
\t:o FEATURE_SYSLOG(FEATURE_SYSLOG)
\t:o TOUCH(TOUCH)
\t:o FSYNC(FSYNC)
\t:o FEATURE_MOUNT_LABEL(FEATURE_MOUNT_LABEL)
\t:o FEATURE_SUID_CONFIG_QUIET(FEATURE_SUID_CONFIG_QUIET)
\t:o ENVUIDGID(ENVUIDGID)
\t:o FEATURE_VI_WIN_RESIZE(FEATURE_VI_WIN_RESIZE)
\t:o ASH_RANDOM_SUPPORT(ASH_RANDOM_SUPPORT)
\t:o DOS2UNIX(DOS2UNIX)
\t:o IPCS(IPCS)
\t:o TEE(TEE)
\t:o FEATURE_HTTPD_USE_SENDFILE(FEATURE_HTTPD_USE_SENDFILE)
\t:o RUNSVDIR(RUNSVDIR)
\t:o FEATURE_USE_TERMIOS(FEATURE_USE_TERMIOS)
\t:o FEATURE_LESS_WINCH(FEATURE_LESS_WINCH)
\t:o CHPST(CHPST)
\t:o CROSS_COMPILER_PREFIX(CROSS_COMPILER_PREFIX)
\t:o FEATURE_EDITING(FEATURE_EDITING)
\t:o HUSH(HUSH)
\t:o SVLOGD(SVLOGD)
\t:o IFENSLAVE(IFENSLAVE)
\t:o ASH_BUILTIN_ECHO(ASH_BUILTIN_ECHO)
\t:o SETSEBOOL(SETSEBOOL)
\t:o FEATURE_MAKEDEVS_TABLE(FEATURE_MAKEDEVS_TABLE)
\t:o FEATURE_HTTPD_ERROR_PAGES(FEATURE_HTTPD_ERROR_PAGES)
\t:o FEATURE_VOLUMEID_LINUXRAID(FEATURE_VOLUMEID_LINUXRAID)
\t:o PIDOF(PIDOF)
\t:o FEATURE_KILL_DELAY(FEATURE_KILL_DELAY)
\t:o NSLOOKUP(NSLOOKUP)
\t:o FEATURE_XARGS_SUPPORT_QUOTES(FEATURE_XARGS_SUPPORT_QUOTES)
\t:o FEATURE_IPCALC_LONG_OPTIONS(FEATURE_IPCALC_LONG_OPTIONS)
\t:o FEATURE_PIDOF_OMIT(FEATURE_PIDOF_OMIT)
\t:o GUNZIP(GUNZIP)
\t:o FEATURE_TR_CLASSES(FEATURE_TR_CLASSES)
\t:o FOLD(FOLD)
\t:o UNICODE_PRESERVE_BROKEN(UNICODE_PRESERVE_BROKEN)
\t:o ASH_BASH_COMPAT(ASH_BASH_COMPAT)
\t:o DIFF(DIFF)
\t:o FEATURE_FDISK_WRITABLE(FEATURE_FDISK_WRITABLE)
\t:o MKNOD(MKNOD)
\t:o SHOWKEY(SHOWKEY)
\t:o LOCALE_SUPPORT(LOCALE_SUPPORT)
\t:o FEATURE_SEAMLESS_BZ2(FEATURE_SEAMLESS_BZ2)
\t:o KLOGD(KLOGD)
\t:o BEEP(BEEP)
\t:o GETTY(GETTY)
\t:o FSCK_MINIX(FSCK_MINIX)
\t:o FEATURE_GREP_CONTEXT(FEATURE_GREP_CONTEXT)
\t:o NAMEIF(NAMEIF)
\t:o FEATURE_HTTPD_SETUID(FEATURE_HTTPD_SETUID)
\t:o FEATURE_LZMA_FAST(FEATURE_LZMA_FAST)
\t:o FEATURE_MAKEDEVS_TABLE_alt(FEATURE_MAKEDEVS_TABLE_alt)
\t:o EXTRA_CFLAGS(EXTRA_CFLAGS)
\t:o FIRST_SYSTEM_ID(FIRST_SYSTEM_ID)
\t:o FEATURE_VOLUMEID_OCFS2(FEATURE_VOLUMEID_OCFS2)
\t:o FEATURE_BASH_IS_HUSH_alt(FEATURE_BASH_IS_HUSH_alt)
\t:o PLATFORM_LINUX(PLATFORM_LINUX)
\t:o UNIX2DOS(UNIX2DOS)
\t:o FEATURE_XARGS_SUPPORT_CONFIRMATION(FEATURE_XARGS_SUPPORT_CONFIRMATION)
\t:o FEATURE_REFORMIME_COMPAT(FEATURE_REFORMIME_COMPAT)
\t:o FEATURE_INIT_SYSLOG(FEATURE_INIT_SYSLOG)
\t:o FEATURE_AR_LONG_FILENAMES(FEATURE_AR_LONG_FILENAMES)
\t:o EXPR_MATH_SUPPORT_64(EXPR_MATH_SUPPORT_64)
\t:o FEATURE_INSTALLER(FEATURE_INSTALLER)
\t:o FEATURE_FIND_MMIN(FEATURE_FIND_MMIN)
\t:o FEATURE_FIND_PRINT0(FEATURE_FIND_PRINT0)
\t:o DESKTOP(DESKTOP)
\t:o DMALLOC(DMALLOC)
\t:o READLINK(READLINK)
\t:o TAIL(TAIL)
\t:o RFKILL(RFKILL)
\t:o HUSH_TICK(HUSH_TICK)
\t:o PAM(PAM)
\t:o ASH_BUILTIN_PRINTF(ASH_BUILTIN_PRINTF)
\t:o REV(REV)
\t:o FEATURE_FIND_PERM(FEATURE_FIND_PERM)
\t:o FEATURE_USERNAME_COMPLETION(FEATURE_USERNAME_COMPLETION)
\t:o IONICE(IONICE)
\t:o UNICODE_COMBINING_WCHARS(UNICODE_COMBINING_WCHARS)
\t:o FEATURE_GREP_EGREP_ALIAS(FEATURE_GREP_EGREP_ALIAS)
\t:o FEATURE_DD_IBS_OBS(FEATURE_DD_IBS_OBS)
\t:o FEATURE_IP_ADDRESS(FEATURE_IP_ADDRESS)
\t:o SELINUXENABLED(SELINUXENABLED)
\t:o FEATURE_LAST_SMALL(FEATURE_LAST_SMALL)
\t:o FEATURE_FIND_DELETE(FEATURE_FIND_DELETE)
\t:o CROND(CROND)
\t:o HTTPD(HTTPD)
\t:o PATCH(PATCH)
\t:o FEATURE_FIND_CONTEXT(FEATURE_FIND_CONTEXT)
\t:o FEATURE_FTPGETPUT_LONG_OPTIONS(FEATURE_FTPGETPUT_LONG_OPTIONS)
\t:o UNAME(UNAME)
\t:o FEATURE_PREFER_IPV4_ADDRESS(FEATURE_PREFER_IPV4_ADDRESS)
\t:o TEST(TEST)
\t:o FEATURE_BASH_IS_NONE(FEATURE_BASH_IS_NONE)
\t:o IPLINK(IPLINK)
\t:o STRINGS(STRINGS)
\t:o FEATURE_UNIX_LOCAL(FEATURE_UNIX_LOCAL)
\t:o ENV(ENV)
\t:o FEATURE_FIND_DEPTH(FEATURE_FIND_DEPTH)
\t:o FEATURE_ACPID_COMPAT(FEATURE_ACPID_COMPAT)
\t:o FEATURE_BEEP_LENGTH_MS(FEATURE_BEEP_LENGTH_MS)
\t:o IFPLUGD(IFPLUGD)
\t:o HUSH_EXPORT_N(HUSH_EXPORT_N)
\t:o FEATURE_VERBOSE_USAGE(FEATURE_VERBOSE_USAGE)
\t:o FEATURE_VERBOSE_CP_MESSAGE(FEATURE_VERBOSE_CP_MESSAGE)
\t:o UUENCODE(UUENCODE)
\t:o FEATURE_HTTPD_BASIC_AUTH(FEATURE_HTTPD_BASIC_AUTH)
\t:o FEATURE_INSMOD_KSYMOOPS_SYMBOLS(FEATURE_INSMOD_KSYMOOPS_SYMBOLS)
\t:o FEATURE_DATE_NANO(FEATURE_DATE_NANO)
\t:o FEATURE_IP_ROUTE(FEATURE_IP_ROUTE)
\t:o RMDIR(RMDIR)
\t:o FEATURE_NTPD_SERVER(FEATURE_NTPD_SERVER)
\t:o FEATURE_IP_RARE_PROTOCOLS(FEATURE_IP_RARE_PROTOCOLS)
\t:o MAKEDEVS(MAKEDEVS)
\t:o FEATURE_MODUTILS_ALIAS(FEATURE_MODUTILS_ALIAS)
\t:o FEATURE_SETFILES_CHECK_OPTION(FEATURE_SETFILES_CHECK_OPTION)
\t:o USE_BB_SHADOW(USE_BB_SHADOW)
\t:o FEATURE_IFCONFIG_SLIP(FEATURE_IFCONFIG_SLIP)
\t:o FEATURE_INSMOD_LOAD_MAP_FULL(FEATURE_INSMOD_LOAD_MAP_FULL)
\t:o FEATURE_PASSWD_WEAK_CHECK(FEATURE_PASSWD_WEAK_CHECK)
\t:o IFUPDOWN_UDHCPC_CMD_OPTIONS(IFUPDOWN_UDHCPC_CMD_OPTIONS)
\t:o CHCON(CHCON)
\t:o FEATURE_MODPROBE_SMALL_OPTIONS_ON_CMDLINE(FEATURE_MODPROBE_SMALL_OPTIONS_ON_CMDLINE)
\t:o FUSER(FUSER)
\t:o FEATURE_SH_IS_ASH(FEATURE_SH_IS_ASH)
\t:o NO_DEBUG_LIB(NO_DEBUG_LIB)
\t:o FEATURE_HUMAN_READABLE(FEATURE_HUMAN_READABLE)
\t:o WHICH(WHICH)
\t:o FEATURE_FAST_TOP(FEATURE_FAST_TOP)
\t:o FEATURE_SEAMLESS_XZ(FEATURE_SEAMLESS_XZ)
\t:o CMP(CMP)
\t:o FEATURE_UDHCP_RFC3397(FEATURE_UDHCP_RFC3397)
\t:o WATCHDOG(WATCHDOG)
\t:o FEATURE_VOLUMEID_NTFS(FEATURE_VOLUMEID_NTFS)
\t:o INIT(INIT)
\t:o INSTALL_APPLET_DONT_alt(INSTALL_APPLET_DONT_alt)
\t:o KILLALL(KILLALL)
\t:o TOP(TOP)
\t:o FEATURE_IFUPDOWN_IPV6(FEATURE_IFUPDOWN_IPV6)
\t:o HWCLOCK(HWCLOCK)
\t:o GETSEBOOL(GETSEBOOL)
\t:o FEATURE_IFUPDOWN_IPV4(FEATURE_IFUPDOWN_IPV4)
\t:o TIMEOUT(TIMEOUT)
\t:o FEATURE_DMESG_PRETTY(FEATURE_DMESG_PRETTY)
\t:o FEATURE_POPMAILDIR_DELIVERY(FEATURE_POPMAILDIR_DELIVERY)
\t:o FEATURE_CHAT_CLR_ABORT(FEATURE_CHAT_CLR_ABORT)
\t:o EXTRA_COMPAT(EXTRA_COMPAT)
\t:o FEATURE_HWCLOCK_ADJTIME_FHS(FEATURE_HWCLOCK_ADJTIME_FHS)
\t:o FEATURE_UMOUNT_ALL(FEATURE_UMOUNT_ALL)
\t:o INSMOD(INSMOD)
\t:o FEATURE_MV_LONG_OPTIONS(FEATURE_MV_LONG_OPTIONS)
\t:o FEATURE_DD_THIRD_STATUS_LINE(FEATURE_DD_THIRD_STATUS_LINE)
\t:o LOSETUP(LOSETUP)
\t:o FEATURE_TFTP_PUT(FEATURE_TFTP_PUT)
\t:o IOSTAT(IOSTAT)
\t:o FEATURE_TOP_CPU_GLOBAL_PERCENTS(FEATURE_TOP_CPU_GLOBAL_PERCENTS)
\t:o FEATURE_START_STOP_DAEMON_LONG_OPTIONS(FEATURE_START_STOP_DAEMON_LONG_OPTIONS)
\t:o PIE(PIE)
\t:o DHCPD_LEASES_FILE(DHCPD_LEASES_FILE)
\t:o FEATURE_KLOGD_KLOGCTL(FEATURE_KLOGD_KLOGCTL)
\t:o CHRT(CHRT)
\t:o FEATURE_VOLUMEID_XFS(FEATURE_VOLUMEID_XFS)
\t:o FEATURE_HDPARM_HDIO_TRISTATE_HWIF(FEATURE_HDPARM_HDIO_TRISTATE_HWIF)
\t:o TELNETD(TELNETD)
\t:o MODINFO(MODINFO)
\t:o FEATURE_MAKEDEVS_LEAF(FEATURE_MAKEDEVS_LEAF)
\t:o FEATURE_IPC_SYSLOG_BUFFER_SIZE(FEATURE_IPC_SYSLOG_BUFFER_SIZE)
\t:o UBIDETACH(UBIDETACH)
\t:o FEATURE_SECURETTY(FEATURE_SECURETTY)
\t:o CHGRP(CHGRP)
\t:o DEVFSD_VERBOSE(DEVFSD_VERBOSE)
\t:o FEATURE_NETSTAT_PRG(FEATURE_NETSTAT_PRG)
\t:o FIND(FIND)
\t:o LSPCI(LSPCI)
\t:o FEATURE_HDPARM_HDIO_GETSET_DMA(FEATURE_HDPARM_HDIO_GETSET_DMA)
\t:o TRUE(TRUE)
\t:o FEATURE_LESS_MAXLINES(FEATURE_LESS_MAXLINES)
\t:o UMOUNT(UMOUNT)
\t:o REALPATH(REALPATH)
\t:o KILLALL5(KILLALL5)
\t:o SCRIPT(SCRIPT)
\t:o SORT(SORT)
\t:o BBCONFIG(BBCONFIG)
\t:o IPRULE(IPRULE)
\t:o VERBOSE_RESOLUTION_ERRORS(VERBOSE_RESOLUTION_ERRORS)
\t:o HEAD(HEAD)
\t:o VOLNAME(VOLNAME)
\t:o MESG(MESG)
\t:o MD5_SIZE_VS_SPEED(MD5_SIZE_VS_SPEED)
\t:o FEATURE_INIT_SCTTY(FEATURE_INIT_SCTTY)
\t:o RPM(RPM)
\t:o TTY(TTY)
\t:o BLKID(BLKID)
\t:o FEATURE_VI_OPTIMIZE_CURSOR(FEATURE_VI_OPTIMIZE_CURSOR)
\t:o FEATURE_BUFFERS_GO_IN_BSS(FEATURE_BUFFERS_GO_IN_BSS)
\t:o OPENVT(OPENVT)
\t:o FEATURE_EDITING_HISTORY(FEATURE_EDITING_HISTORY)
\t:o HUSH_INTERACTIVE(HUSH_INTERACTIVE)
\t:o FEATURE_SHARED_BUSYBOX(FEATURE_SHARED_BUSYBOX)
\t:o DEBUG(DEBUG)
\t:o FEATURE_TEST_64(FEATURE_TEST_64)
\t:o FEATURE_INIT_COREDUMPS(FEATURE_INIT_COREDUMPS)
\t:o FEATURE_TAR_SELINUX(FEATURE_TAR_SELINUX)
\t:o FEATURE_INETD_RPC(FEATURE_INETD_RPC)
\t:o NETSTAT(NETSTAT)
\t:o DEVFSD_FG_NP(DEVFSD_FG_NP)
\t:o FEATURE_VI_COLON(FEATURE_VI_COLON)
\t:o CHVT(CHVT)
\t:o CLEAR(CLEAR)
\t:o FBSET(FBSET)
\t:o FEATURE_RUN_PARTS_FANCY(FEATURE_RUN_PARTS_FANCY)
\t:o INSTALL(INSTALL)
\t:o FEATURE_SWAPON_PRI(FEATURE_SWAPON_PRI)
\t:o FEATURE_IFUPDOWN_IP_BUILTIN(FEATURE_IFUPDOWN_IP_BUILTIN)
\t:o FEATURE_TAR_UNAME_GNAME(FEATURE_TAR_UNAME_GNAME)
\t:o FEATURE_VI_MAX_LEN(FEATURE_VI_MAX_LEN)
\t:o SETENFORCE(SETENFORCE)
\t:o FEATURE_CHAT_VAR_ABORT_LEN(FEATURE_CHAT_VAR_ABORT_LEN)
\t:o SWITCH_ROOT(SWITCH_ROOT)
\t:o FEATURE_IFCONFIG_MEMSTART_IOADDR_IRQ(FEATURE_IFCONFIG_MEMSTART_IOADDR_IRQ)
\t:o FEATURE_USE_INITTAB(FEATURE_USE_INITTAB)
\t:o FEATURE_VOLUMEID_ISO9660(FEATURE_VOLUMEID_ISO9660)
\t:o NANDDUMP(NANDDUMP)
\t:o MOUNTPOINT(MOUNTPOINT)
\t:o INSTALL_SH_APPLET_SYMLINK(INSTALL_SH_APPLET_SYMLINK)
\t:o LFS(LFS)
\t:o FDFLUSH(FDFLUSH)
\t:o FEATURE_SH_IS_NONE(FEATURE_SH_IS_NONE)
\t:o SULOGIN(SULOGIN)
\t:o ASH_EXPAND_PRMT(ASH_EXPAND_PRMT)
\t:o CUT(CUT)
\t:o FEATURE_RMDIR_LONG_OPTIONS(FEATURE_RMDIR_LONG_OPTIONS)
\t:o FEATURE_TAR_NOPRESERVE_TIME(FEATURE_TAR_NOPRESERVE_TIME)
\t:o CONSPY(CONSPY)
\t:o FEATURE_FIND_EXEC(FEATURE_FIND_EXEC)
\t:o FEATURE_CROND_D(FEATURE_CROND_D)
\t:o IFUPDOWN_IFSTATE_PATH(IFUPDOWN_IFSTATE_PATH)
\t:o FEATURE_TR_EQUIV(FEATURE_TR_EQUIV)
\t:o FEATURE_SETFONT_TEXTUAL_MAP(FEATURE_SETFONT_TEXTUAL_MAP)
\t:o SUBST_WCHAR(SUBST_WCHAR)
\t:o MKFS_VFAT(MKFS_VFAT)
\t:o FEATURE_FIND_XDEV(FEATURE_FIND_XDEV)
\t:o FEATURE_MOUNT_LOOP_CREATE(FEATURE_MOUNT_LOOP_CREATE)
\t:o FEATURE_RUN_PARTS_LONG_OPTIONS(FEATURE_RUN_PARTS_LONG_OPTIONS)
\t:o ZCIP(ZCIP)
\t:o FEATURE_HTTPD_PROXY(FEATURE_HTTPD_PROXY)
\t:o FEATURE_BUFFERS_GO_ON_STACK(FEATURE_BUFFERS_GO_ON_STACK)
\t:o FEATURE_IPV6(FEATURE_IPV6)
\t:o ARP(ARP)
\t:o FEATURE_TOP_SMP_CPU(FEATURE_TOP_SMP_CPU)
\t:o USLEEP(USLEEP)
\t:o LOADKMAP(LOADKMAP)
\t:o RDEV(RDEV)
\t:o FEATURE_MDEV_CONF(FEATURE_MDEV_CONF)
\t:o FREE(FREE)
\t:o SPLIT(SPLIT)
\t:o FEATURE_PIDOF_SINGLE(FEATURE_PIDOF_SINGLE)
\t:o ASH(ASH)
\t:o USE_PORTABLE_CODE(USE_PORTABLE_CODE)
\t:o FEATURE_SYSLOGD_DUP(FEATURE_SYSLOGD_DUP)
\t:o FEATURE_LESS_FLAGS(FEATURE_LESS_FLAGS)
\t:o MKFS_MINIX(MKFS_MINIX)
\t:o FEATURE_VOLUMEID_EXT(FEATURE_VOLUMEID_EXT)
\t:o VLOCK(VLOCK)
\t:o DEVMEM(DEVMEM)
\t:o TELINIT_PATH(TELINIT_PATH)
\t:o RMMOD(RMMOD)
\t:o DEVFSD_MODLOAD(DEVFSD_MODLOAD)
\t:o FEATURE_COMPRESS_BBCONFIG(FEATURE_COMPRESS_BBCONFIG)
\t:o FEATURE_LS_TIMESTAMPS(FEATURE_LS_TIMESTAMPS)
\t:o FEATURE_EXPAND_LONG_OPTIONS(FEATURE_EXPAND_LONG_OPTIONS)
\t:o FEATURE_HTTPD_GZIP(FEATURE_HTTPD_GZIP)
\t:o MKDIR(MKDIR)
\t:o FEATURE_IFUPDOWN_MAPPING(FEATURE_IFUPDOWN_MAPPING)
\t:o FEATURE_FIND_MTIME(FEATURE_FIND_MTIME)
\t:o FEATURE_IPC_SYSLOG(FEATURE_IPC_SYSLOG)
\t:o STAT(STAT)
\t:o FEATURE_AWK_LIBM(FEATURE_AWK_LIBM)
\t:o ROUTE(ROUTE)
\t:o GETOPT(GETOPT)
\t:o CRONTAB(CRONTAB)
\t:o FTPGET(FTPGET)
\t:o FEATURE_SETCONSOLE_LONG_OPTIONS(FEATURE_SETCONSOLE_LONG_OPTIONS)
\t:o FEATURE_HTTPD_CGI(FEATURE_HTTPD_CGI)
\t:o FDFORMAT(FDFORMAT)
\t:o FEATURE_FANCY_ECHO(FEATURE_FANCY_ECHO)
\t:o FEATURE_EDITING_ASK_TERMINAL(FEATURE_EDITING_ASK_TERMINAL)
\t:o FEATURE_MOUNT_CIFS(FEATURE_MOUNT_CIFS)
\t:o FEATURE_LESS_DASHCMD(FEATURE_LESS_DASHCMD)
\t:o RUNSV(RUNSV)
\t:o DEALLOCVT(DEALLOCVT)
\t:o UUDECODE(UUDECODE)
\t:o ASH_BUILTIN_TEST(ASH_BUILTIN_TEST)
\t:o SETUIDGID(SETUIDGID)
\t:o BUSYBOX_EXEC_PATH(BUSYBOX_EXEC_PATH)
\t:o ETHER_WAKE(ETHER_WAKE)
\t:o ENVDIR(ENVDIR)
\t:o TTYSIZE(TTYSIZE)
\t:o BUILD_LIBBUSYBOX(BUILD_LIBBUSYBOX)
\t:o FEATURE_TELNET_AUTOLOGIN(FEATURE_TELNET_AUTOLOGIN)
\t:o SETARCH(SETARCH)
\t:o FEATURE_DEL_USER_FROM_GROUP(FEATURE_DEL_USER_FROM_GROUP)
\t:o NC_SERVER(NC_SERVER)
\t:o FEATURE_CHOWN_LONG_OPTIONS(FEATURE_CHOWN_LONG_OPTIONS)
\t:o YES(YES)
\t:o POPMAILDIR(POPMAILDIR)
\t:o FEATURE_SUN_LABEL(FEATURE_SUN_LABEL)
\t:o DPKG(DPKG)
\t:o PMAP(PMAP)
\t:o DELGROUP(DELGROUP)
\t:o USE_BB_CRYPT(USE_BB_CRYPT)
\t:o FEATURE_DEVPTS(FEATURE_DEVPTS)
\t:o FEATURE_VOLUMEID_JFS(FEATURE_VOLUMEID_JFS)
\t:o REFORMIME(REFORMIME)
\t:o TRACEROUTE6(TRACEROUTE6)
\t:o DUMPLEASES(DUMPLEASES)
\t:o USE_BB_CRYPT_SHA(USE_BB_CRYPT_SHA)
\t:o AWK(AWK)
\t:o FEATURE_SEAMLESS_Z(FEATURE_SEAMLESS_Z)
\t:o FEATURE_RESIZE_PRINT(FEATURE_RESIZE_PRINT)
\t:o HUSH_HELP(HUSH_HELP)
\t:o FEATURE_VI_USE_SIGNALS(FEATURE_VI_USE_SIGNALS)
\t:o HUSH_BRACE_EXPANSION(HUSH_BRACE_EXPANSION)
\t:o FAKEIDENTD(FAKEIDENTD)
\t:o FEATURE_MTAB_SUPPORT(FEATURE_MTAB_SUPPORT)
\t:o FEATURE_PS_TIME(FEATURE_PS_TIME)
\t:o IPCALC(IPCALC)
\t:o SH_MATH_SUPPORT(SH_MATH_SUPPORT)
\t:o ASH_ALIAS(ASH_ALIAS)
\t:o FEATURE_HAVE_RPC(FEATURE_HAVE_RPC)
\t:o FEATURE_INETD_SUPPORT_BUILTIN_DAYTIME(FEATURE_INETD_SUPPORT_BUILTIN_DAYTIME)
\t:o UDHCP_DEBUG(UDHCP_DEBUG)
\t:o DEVFSD(DEVFSD)
\t:o FEATURE_OSF_LABEL(FEATURE_OSF_LABEL)
\t:o SHOW_USAGE(SHOW_USAGE)
\t:o FEATURE_MOUNT_FAKE(FEATURE_MOUNT_FAKE)
\t:o FEATURE_UDHCPC_ARPING(FEATURE_UDHCPC_ARPING)
\t:o FEATURE_FTPD_ACCEPT_BROKEN_LIST(FEATURE_FTPD_ACCEPT_BROKEN_LIST)
\t:o FEATURE_TAR_FROM(FEATURE_TAR_FROM)
\t:o FEATURE_BEEP_FREQ(FEATURE_BEEP_FREQ)
\t:o ADDGROUP(ADDGROUP)
\t:o COMM(COMM)
\t:o FEATURE_LSMOD_PRETTY_2_6_OUTPUT(FEATURE_LSMOD_PRETTY_2_6_OUTPUT)
\t:o FEATURE_PS_UNUSUAL_SYSTEMS(FEATURE_PS_UNUSUAL_SYSTEMS)
\t:o FEATURE_TAR_LONG_OPTIONS(FEATURE_TAR_LONG_OPTIONS)
\t:o PWD(PWD)
\t:o IPTUNNEL(IPTUNNEL)
\t:o FEATURE_NON_POSIX_CP(FEATURE_NON_POSIX_CP)
\t:o PKILL(PKILL)
\t:o FEATURE_VI_SETOPTS(FEATURE_VI_SETOPTS)
\t:o FEATURE_GPT_LABEL(FEATURE_GPT_LABEL)
\t:o FEATURE_GETOPT_LONG(FEATURE_GETOPT_LONG)
\t:o CHOWN(CHOWN)
\t:o FEATURE_EDITING_FANCY_PROMPT(FEATURE_EDITING_FANCY_PROMPT)
\t:o FBSPLASH(FBSPLASH)
\t:o FEATURE_INSTALL_LONG_OPTIONS(FEATURE_INSTALL_LONG_OPTIONS)
\t:o HUSH_LOOPS(HUSH_LOOPS)
\t:o LPD(LPD)
\t:o FEATURE_VI_SET(FEATURE_VI_SET)
\t:o FEATURE_VOLUMEID_BTRFS(FEATURE_VOLUMEID_BTRFS)
\t:o FLASH_LOCK(FLASH_LOCK)
\t:o DEFAULT_DEPMOD_FILE(DEFAULT_DEPMOD_FILE)
\t:o LPQ(LPQ)
\t:o FEATURE_PREFER_APPLETS(FEATURE_PREFER_APPLETS)
\t:o LPR(LPR)
\t:o RESIZE(RESIZE)
\t:o FEATURE_VOLUMEID_ROMFS(FEATURE_VOLUMEID_ROMFS)
\t:o WGET(WGET)
\t:o FEATURE_SEAMLESS_GZ(FEATURE_SEAMLESS_GZ)
\t:o ADJTIMEX(ADJTIMEX)
\t:o FEATURE_WGET_LONG_OPTIONS(FEATURE_WGET_LONG_OPTIONS)
\t:o EJECT(EJECT)
\t:o BZIP2(BZIP2)
\t:o ASH_GETOPTS(ASH_GETOPTS)
\t:o BLOCKDEV(BLOCKDEV)
\t:o MICROCOM(MICROCOM)
\t:o FTPD(FTPD)
\t:o FEATURE_FANCY_SLEEP(FEATURE_FANCY_SLEEP)
\t:o DEPMOD(DEPMOD)
\t:o FEATURE_HTTPD_ENCODE_URL_STR(FEATURE_HTTPD_ENCODE_URL_STR)
\t:o FEATURE_TAR_GNU_EXTENSIONS(FEATURE_TAR_GNU_EXTENSIONS)
\t:o FEATURE_WGET_STATUSBAR(FEATURE_WGET_STATUSBAR)
\t:o FEATURE_CHECK_TAINTED_MODULE(FEATURE_CHECK_TAINTED_MODULE)
\t:o FEATURE_FIND_NOT(FEATURE_FIND_NOT)
\t:o FEATURE_TRACEROUTE_SOURCE_ROUTE(FEATURE_TRACEROUTE_SOURCE_ROUTE)
\t:o LONG_OPTS(LONG_OPTS)
\t:o FEATURE_WGET_AUTHENTICATION(FEATURE_WGET_AUTHENTICATION)
\t:o NICE(NICE)
\t:o FEATURE_MKDIR_LONG_OPTIONS(FEATURE_MKDIR_LONG_OPTIONS)
\t:o FEATURE_LS_SORTFILES(FEATURE_LS_SORTFILES)
\t:o FEATURE_INETD_SUPPORT_BUILTIN_CHARGEN(FEATURE_INETD_SUPPORT_BUILTIN_CHARGEN)
\t:o LZMA(LZMA)
\t:o FEATURE_INSMOD_LOAD_MAP(FEATURE_INSMOD_LOAD_MAP)
\t:o FEATURE_UNEXPAND_LONG_OPTIONS(FEATURE_UNEXPAND_LONG_OPTIONS)
\t:o FEATURE_IFCONFIG_STATUS(FEATURE_IFCONFIG_STATUS)
\t:o FEATURE_TOPMEM(FEATURE_TOPMEM)
\t:o INSTALL_APPLET_HARDLINKS(INSTALL_APPLET_HARDLINKS)
\t:o MKFS_REISER(MKFS_REISER)
\t:o CHMOD(CHMOD)
\t:o RUN_PARTS(RUN_PARTS)
\t:o FEATURE_FIND_SIZE(FEATURE_FIND_SIZE)
\t:o INSTALL_NO_USR(INSTALL_NO_USR)
\t:o WERROR(WERROR)
\t:o MOUNT(MOUNT)
\t:o INSTALL_APPLET_SYMLINKS(INSTALL_APPLET_SYMLINKS)
\t:o WHO(WHO)
\t:o FEATURE_MDEV_EXEC(FEATURE_MDEV_EXEC)
\t:o FEATURE_MOUNT_FSTAB(FEATURE_MOUNT_FSTAB)
\t:o PIPE_PROGRESS(PIPE_PROGRESS)
\t:o FEATURE_REMOTE_LOG(FEATURE_REMOTE_LOG)
\t:o PGREP(PGREP)
\t:o UNICODE_SUPPORT(UNICODE_SUPPORT)
\t:o DATE(DATE)
\t:o FEATURE_ETC_NETWORKS(FEATURE_ETC_NETWORKS)
\t:o FEATURE_SYSLOGD_READ_BUFFER_SIZE(FEATURE_SYSLOGD_READ_BUFFER_SIZE)
\t:o FDISK_SUPPORT_LARGE_DISKS(FDISK_SUPPORT_LARGE_DISKS)
\t:o TASKSET(TASKSET)
\t:o FEATURE_TASKSET_FANCY(FEATURE_TASKSET_FANCY)
\t:o LOGGER(LOGGER)
\t:o FEATURE_HDPARM_HDIO_DRIVE_RESET(FEATURE_HDPARM_HDIO_DRIVE_RESET)
\t:o FEATURE_COPYBUF_KB(FEATURE_COPYBUF_KB)
\t:o FEATURE_PRESERVE_HARDLINKS(FEATURE_PRESERVE_HARDLINKS)
\t:o SHA1SUM(SHA1SUM)
\t:o DHCPRELAY(DHCPRELAY)
\t:o LZOP(LZOP)
\t:o FEATURE_CHECK_NAMES(FEATURE_CHECK_NAMES)
\t:o RENICE(RENICE)
\t:o FEATURE_HDPARM_HDIO_SCAN_HWIF(FEATURE_HDPARM_HDIO_SCAN_HWIF)
\t:o FEATURE_PIDFILE(FEATURE_PIDFILE)
\t:o FEATURE_IFUPDOWN_IP(FEATURE_IFUPDOWN_IP)
\t:o DMESG(DMESG)
\t:o ASH_JOB_CONTROL(ASH_JOB_CONTROL)
\t:o UDHCPD(UDHCPD)
\t:o FEATURE_MOUNT_LOOP(FEATURE_MOUNT_LOOP)
\t:o UDHCPC(UDHCPC)
\t:o FEATURE_LESS_BRACKETS(FEATURE_LESS_BRACKETS)
\t:o FINDFS(FINDFS)
\t:o FEATURE_FDISK_ADVANCED(FEATURE_FDISK_ADVANCED)
\t:o POWERTOP(POWERTOP)
\t:o FEATURE_LS_COLOR(FEATURE_LS_COLOR)
\t:o FEATURE_TAR_CREATE(FEATURE_TAR_CREATE)
\t:o FEATURE_BRCTL_FANCY(FEATURE_BRCTL_FANCY)
\t:o HUSH_RANDOM_SUPPORT(HUSH_RANDOM_SUPPORT)
\t:o UDHCPC_SLACK_FOR_BUGGY_SERVERS(UDHCPC_SLACK_FOR_BUGGY_SERVERS)
\t:o FEATURE_CHAT_NOFAIL(FEATURE_CHAT_NOFAIL)
\t:o UDPSVD(UDPSVD)
\t:o NOHUP(NOHUP)
\t:o FEATURE_FANCY_PING(FEATURE_FANCY_PING)
\t:o FEATURE_DU_DEFAULT_BLOCKSIZE_1K(FEATURE_DU_DEFAULT_BLOCKSIZE_1K)
\t:o FEATURE_NETSTAT_WIDE(FEATURE_NETSTAT_WIDE)
\t:o FEATURE_CHECK_UNICODE_IN_ENV(FEATURE_CHECK_UNICODE_IN_ENV)
</feature_tree>
    <constraints>
C1:root
C2:STATIC  or  ~PIE
C3:HEXDUMP  or  ~FEATURE_HEXDUMP_REVERSE
C4:HEXDUMP  or  ~HD
C5:EXPAND  or  ~FEATURE_EXPAND_LONG_OPTIONS
C6:HDPARM  or  ~FEATURE_HDPARM_HDIO_TRISTATE_HWIF
C7:HDPARM  or  ~FEATURE_HDPARM_GET_IDENTITY
C8:HDPARM  or  ~FEATURE_HDPARM_HDIO_SCAN_HWIF
C9:HDPARM  or  ~FEATURE_HDPARM_HDIO_GETSET_DMA
C10:HDPARM  or  ~FEATURE_HDPARM_HDIO_UNREGISTER_HWIF
C11:HDPARM  or  ~FEATURE_HDPARM_HDIO_DRIVE_RESET
C12:AR  or  ~FEATURE_AR_LONG_FILENAMES
C13:AR  or  ~FEATURE_AR_CREATE
C14:SETFILES  or  ~FEATURE_SETFILES_CHECK_OPTION
C15:HUSH_FUNCTIONS  or  ~HUSH_LOCAL
C16:HALT  or  ~FEATURE_CALL_TELINIT
C17:BRCTL  or  ~FEATURE_BRCTL_FANCY
C18:CP  or  ~FEATURE_CP_LONG_OPTIONS
C19:DC  or  ~FEATURE_DC_LIBM
C20:DD  or  ~FEATURE_DD_IBS_OBS
C21:DD  or  ~FEATURE_DD_SIGNAL_HANDLING
C22:DF  or  ~FEATURE_DF_FANCY
C23:UNICODE_BIDI_SUPPORT  or  ~UNICODE_NEUTRAL_TABLE
C24:DU  or  ~FEATURE_DU_DEFAULT_BLOCKSIZE_1K
C25:MDEV  or  ~FEATURE_MDEV_LOAD_FIRMWARE
C26:MDEV  or  ~FEATURE_MDEV_CONF
C27:FEATURE_LAST_SMALL_alt  or  ~FEATURE_LAST_SMALL
C28:FEATURE_LAST_SMALL_alt  or  ~FEATURE_LAST_FANCY
C29:FEATURE_LAST_SMALL  or  FEATURE_LAST_FANCY  or  ~FEATURE_LAST_SMALL_alt
C30:~FEATURE_LAST_SMALL  or  ~FEATURE_LAST_FANCY
C31:UNLZMA  or  ~FEATURE_LZMA_FAST
C32:UNLZMA  or  ~LZMA
C33:TUNCTL  or  ~FEATURE_TUNCTL_UG
C34:FEATURE_KILL_REMOVED  or  ~FEATURE_KILL_DELAY
C35:FEATURE_KILL_DELAY  or  ~FEATURE_KILL_REMOVED
C36:UNEXPAND  or  ~FEATURE_UNEXPAND_LONG_OPTIONS
C37:root  or  ~FEATURE_MOUNT_LOOP
C38:root  or  ~RX
C39:root  or  ~CMP
C40:root  or  ~VOLNAME
C41:root  or  ~SMEMCAP
C42:root  or  ~SWAPONOFF
C43:root  or  ~LOGNAME
C44:root  or  ~UNICODE_SUPPORT
C45:root  or  ~TFTP
C46:root  or  ~FEATURE_UNIX_LOCAL
C47:root  or  ~FEATURE_PS_UNUSUAL_SYSTEMS
C48:root  or  ~UNZIP
C49:root  or  ~FBSPLASH
C50:root  or  ~DMESG
C51:root  or  ~UDHCP_DEBUG
C52:root  or  ~ID
C53:root  or  ~VCONFIG
C54:root  or  ~FTPPUT
C55:root  or  ~SED
C56:root  or  ~FEATURE_VOLUMEID_ROMFS
C57:root  or  ~DELUSER
C58:root  or  ~CHAT
C59:root  or  ~GUNZIP
C60:root  or  ~FEATURE_VOLUMEID_LINUXRAID
C61:root  or  ~CPIO
C62:root  or  ~BUSYBOX_EXEC_PATH
C63:root  or  ~PATCH
C64:root  or  ~SV
C65:root  or  ~BASENAME
C66:root  or  ~CATV
C67:root  or  ~MKTEMP
C68:root  or  ~LOADKMAP
C69:root  or  ~SETCONSOLE
C70:root  or  ~PASSWD
C71:root  or  ~FEATURE_VOLUMEID_LINUXSWAP
C72:root  or  ~ETHER_WAKE
C73:root  or  ~BBCONFIG
C74:root  or  ~MKFS_REISER
C75:root  or  ~TR
C76:root  or  ~INCLUDE_SUSv2
C77:root  or  ~GETSEBOOL
C78:root  or  ~WALL
C79:root  or  ~LN
C80:root  or  ~BOOTCHARTD
C81:root  or  ~UNEXPAND
C82:root  or  ~WHOAMI
C83:root  or  ~DEFAULT_MODULES_DIR
C84:root  or  ~FEATURE_FAST_TOP
C85:root  or  ~LPR
C86:root  or  ~GZIP
C87:root  or  ~FEATURE_SH_IS_HUSH_alt
C88:root  or  ~VLOCK
C89:root  or  ~MKFS_EXT2
C90:root  or  ~SHOW_USAGE
C91:root  or  ~SYSLOGD
C92:root  or  ~IPCALC
C93:root  or  ~DIFF
C94:root  or  ~CHGRP
C95:root  or  ~READAHEAD
C96:root  or  ~SELINUX
C97:root  or  ~FEATURE_SHADOWPASSWDS
C98:root  or  ~LZOP
C99:root  or  ~UNLZMA
C100:root  or  ~CONSPY
C101:root  or  ~LONG_OPTS
C102:root  or  ~MSH
C103:root  or  ~FDFORMAT
C104:root  or  ~DUMPKMAP
C105:root  or  ~FEATURE_IPV6
C106:root  or  ~NTPD
C107:root  or  ~SORT
C108:root  or  ~DEFAULT_DEPMOD_FILE
C109:root  or  ~RDATE
C110:root  or  ~EXTRA_CFLAGS
C111:root  or  ~ADDUSER
C112:root  or  ~FAKEIDENTD
C113:root  or  ~FEATURE_VOLUMEID_ISO9660
C114:root  or  ~TRUE
C115:root  or  ~MOUNT
C116:root  or  ~DEVFSD
C117:root  or  ~FEATURE_CLEAN_UP
C118:root  or  ~CTTYHACK
C119:root  or  ~SUM
C120:root  or  ~ZCIP
C121:root  or  ~FEATURE_MODUTILS_ALIAS
C122:root  or  ~UNCOMPRESS
C123:root  or  ~PIDOF
C124:root  or  ~SULOGIN
C125:root  or  ~MDEV
C126:root  or  ~LOAD_POLICY
C127:root  or  ~TAIL
C128:root  or  ~CROND
C129:root  or  ~IPCS
C130:root  or  ~NOMMU
C131:root  or  ~FEATURE_PRESERVE_HARDLINKS
C132:root  or  ~UBIATTACH
C133:root  or  ~DF
C134:root  or  ~UMOUNT
C135:root  or  ~IPROUTE
C136:root  or  ~READLINK
C137:root  or  ~SVLOGD
C138:root  or  ~PASSWORD_MINLEN
C139:root  or  ~CHPST
C140:root  or  ~FREE
C141:root  or  ~SETFILES
C142:root  or  ~FLASH_LOCK
C143:root  or  ~MOUNTPOINT
C144:root  or  ~FEATURE_2_4_MODULES
C145:root  or  ~LSPCI
C146:root  or  ~FEATURE_SEAMLESS_Z
C147:root  or  ~IOCTL_HEX2STR_ERROR
C148:root  or  ~HALT
C149:root  or  ~TASKSET
C150:root  or  ~KILL
C151:root  or  ~IOSTAT
C152:root  or  ~EJECT
C153:root  or  ~HTTPD
C154:root  or  ~ADJTIMEX
C155:root  or  ~USLEEP
C156:root  or  ~MKDIR
C157:root  or  ~LOADFONT
C158:root  or  ~PRINTENV
C159:root  or  ~FSCK_MINIX
C160:root  or  ~FEATURE_INSTALLER
C161:root  or  ~MV
C162:root  or  ~POPMAILDIR
C163:root  or  ~SETENFORCE
C164:root  or  ~RUNSV
C165:root  or  ~NMETER
C166:root  or  ~DNSD
C167:root  or  ~HOSTNAME
C168:root  or  ~CHRT
C169:root  or  ~FEATURE_EDITING
C170:root  or  ~TAR
C171:root  or  ~TCPSVD
C172:root  or  ~GETTY
C173:root  or  ~SESTATUS
C174:root  or  ~PRINTF
C175:root  or  ~FEATURE_VOLUMEID_SYSV
C176:root  or  ~FEATURE_VOLUMEID_JFS
C177:root  or  ~RENICE
C178:root  or  ~GREP
C179:root  or  ~MAKEDEVS
C180:root  or  ~IFUPDOWN_UDHCPC_CMD_OPTIONS
C181:root  or  ~TEST
C182:root  or  ~INIT
C183:root  or  ~FEATURE_AUTOWIDTH
C184:root  or  ~DEBUG
C185:root  or  ~COMM
C186:root  or  ~BEEP
C187:root  or  ~ACPID
C188:root  or  ~FEATURE_VOLUMEID_XFS
C189:root  or  ~SETARCH
C190:root  or  ~FLASHCP
C191:root  or  ~LPQ
C192:root  or  ~TELNETD
C193:root  or  ~FDFLUSH
C194:root  or  ~FEATURE_SH_NOFORK
C195:root  or  ~DIRNAME
C196:root  or  ~FEATURE_VOLUMEID_OCFS2
C197:root  or  ~WGET
C198:root  or  ~SETLOGCONS
C199:root  or  ~CP
C200:root  or  ~INSTALL_SH_APPLET_SCRIPT_WRAPPER_alt
C201:root  or  ~HAVE_DOT_CONFIG
C202:root  or  ~PIVOT_ROOT
C203:root  or  ~UNXZ
C204:root  or  ~NSLOOKUP
C205:root  or  ~FTPGET
C206:root  or  ~MATCHPATHCON
C207:root  or  ~HUSH
C208:root  or  ~NANDWRITE
C209:root  or  ~SCRIPT
C210:root  or  ~STTY
C211:root  or  ~PMAP
C212:root  or  ~TFTPD
C213:root  or  ~OPENVT
C214:root  or  ~BUILD_LIBBUSYBOX
C215:root  or  ~FOLD
C216:root  or  ~UUENCODE
C217:root  or  ~HEAD
C218:root  or  ~BB_SYSCTL
C219:root  or  ~UDHCPC_SLACK_FOR_BUGGY_SERVERS
C220:root  or  ~ADD_SHELL
C221:root  or  ~SLATTACH
C222:root  or  ~FEATURE_DEVFS
C223:root  or  ~SHOWKEY
C224:root  or  ~LOCALE_SUPPORT
C225:root  or  ~SH_MATH_SUPPORT
C226:root  or  ~UNAME
C227:root  or  ~CHOWN
C228:root  or  ~SETUIDGID
C229:root  or  ~START_STOP_DAEMON
C230:root  or  ~FINDFS
C231:root  or  ~HDPARM
C232:root  or  ~MAN
C233:root  or  ~FEATURE_NON_POSIX_CP
C234:root  or  ~REFORMIME
C235:root  or  ~PIPE_PROGRESS
C236:root  or  ~RAIDAUTORUN
C237:root  or  ~STRINGS
C238:root  or  ~RDEV
C239:root  or  ~DPKG_DEB
C240:root  or  ~REALPATH
C241:root  or  ~MKFS_VFAT
C242:root  or  ~CAL
C243:root  or  ~SENDMAIL
C244:root  or  ~IFPLUGD
C245:root  or  ~MD5SUM
C246:root  or  ~FUSER
C247:root  or  ~UBIDETACH
C248:root  or  ~GETOPT
C249:root  or  ~INSTALL
C250:root  or  ~UDHCPC
C251:root  or  ~FEATURE_BUFFERS_GO_IN_BSS_alt
C252:root  or  ~TAC
C253:root  or  ~FEATURE_LOADFONT_PSF2
C254:root  or  ~DD
C255:root  or  ~FEATURE_HUMAN_READABLE
C256:root  or  ~RUN_PARTS
C257:root  or  ~FEATURE_VERBOSE_CP_MESSAGE
C258:root  or  ~WERROR
C259:root  or  ~BUNZIP2
C260:root  or  ~FTPD
C261:root  or  ~TRACEROUTE
C262:root  or  ~RFKILL
C263:root  or  ~FALSE
C264:root  or  ~CHATTR
C265:root  or  ~LFS
C266:root  or  ~FSYNC
C267:root  or  ~REV
C268:root  or  ~FEATURE_BASH_IS_HUSH_alt
C269:root  or  ~CHPASSWD
C270:root  or  ~RESTORECON
C271:root  or  ~DU
C272:root  or  ~FEATURE_INSMOD_LOADINKMEM
C273:root  or  ~EXTRA_COMPAT
C274:root  or  ~USE_PORTABLE_CODE
C275:root  or  ~PSCAN
C276:root  or  ~SHA512SUM
C277:root  or  ~DATE
C278:root  or  ~SETFONT
C279:root  or  ~RUNLEVEL
C280:root  or  ~IONICE
C281:root  or  ~RESIZE
C282:root  or  ~FLASH_UNLOCK
C283:root  or  ~FEATURE_LOADFONT_RAW
C284:root  or  ~IFUPDOWN
C285:root  or  ~FEATURE_SUID
C286:root  or  ~ARP
C287:root  or  ~CHCON
C288:root  or  ~AR
C289:root  or  ~READPROFILE
C290:root  or  ~ENVUIDGID
C291:root  or  ~LENGTH
C292:root  or  ~ADDGROUP
C293:root  or  ~BASE64
C294:root  or  ~RUNCON
C295:root  or  ~DMALLOC_alt
C296:root  or  ~IP
C297:root  or  ~SEQ
C298:root  or  ~FEATURE_SYSLOG
C299:root  or  ~FEATURE_PREFER_APPLETS
C300:root  or  ~DEALLOCVT
C301:root  or  ~MKSWAP
C302:root  or  ~MICROCOM
C303:root  or  ~GETENFORCE
C304:root  or  ~LS
C305:root  or  ~ROUTE
C306:root  or  ~UUDECODE
C307:root  or  ~TTYSIZE
C308:root  or  ~EXPR
C309:root  or  ~IPRULE
C310:root  or  ~WATCH
C311:root  or  ~FGCONSOLE
C312:root  or  ~FSCK
C313:root  or  ~CRYPTPW
C314:root  or  ~ED
C315:root  or  ~WHO
C316:root  or  ~FEATURE_SEAMLESS_GZ
C317:root  or  ~MAKEMIME
C318:root  or  ~FLOCK
C319:root  or  ~BRCTL
C320:root  or  ~DESKTOP
C321:root  or  ~PLATFORM_LINUX
C322:root  or  ~LOGGER
C323:root  or  ~TIMEOUT
C324:root  or  ~LSUSB
C325:root  or  ~FEATURE_SEAMLESS_LZMA
C326:root  or  ~MT
C327:root  or  ~DEVMEM
C328:root  or  ~POWERTOP
C329:root  or  ~TEE
C330:root  or  ~FEATURE_SH_STANDALONE
C331:root  or  ~FEATURE_DEVPTS
C332:root  or  ~HEXDUMP
C333:root  or  ~SWITCH_ROOT
C334:root  or  ~TUNCTL
C335:root  or  ~FEATURE_INSMOD_KSYMOOPS_SYMBOLS
C336:root  or  ~LAST
C337:root  or  ~MODPROBE_SMALL
C338:root  or  ~LOGIN
C339:root  or  ~BLOCKDEV
C340:root  or  ~FDISK
C341:root  or  ~MORE
C342:root  or  ~KLOGD
C343:root  or  ~CROSS_COMPILER_PREFIX
C344:root  or  ~RUNSVDIR
C345:root  or  ~RTCWAKE
C346:root  or  ~FIND
C347:root  or  ~FEATURE_MD5_SHA1_SUM_CHECK
C348:root  or  ~DC
C349:root  or  ~RPM2CPIO
C350:root  or  ~SLEEP
C351:root  or  ~MESG
C352:root  or  ~IPTUNNEL
C353:root  or  ~INSTALL_APPLET_DONT_alt
C354:root  or  ~PWD
C355:root  or  ~AWK
C356:root  or  ~ENV
C357:root  or  ~SPLIT
C358:root  or  ~ASH
C359:root  or  ~WHICH
C360:root  or  ~FEATURE_WTMP
C361:root  or  ~CHMOD
C362:root  or  ~ENVDIR
C363:root  or  ~DELGROUP
C364:root  or  ~CUT
C365:root  or  ~SETSID
C366:root  or  ~SHA1SUM
C367:root  or  ~USE_BB_PWD_GRP
C368:root  or  ~NOHUP
C369:root  or  ~TOP
C370:root  or  ~RPM
C371:root  or  ~BZIP2
C372:root  or  ~FLASH_ERASEALL
C373:root  or  ~LPD
C374:root  or  ~FEATURE_HWIB
C375:root  or  ~FEATURE_PREFER_IPV4_ADDRESS
C376:root  or  ~FEATURE_INSMOD_TRY_MMAP
C377:root  or  ~STAT
C378:root  or  ~FEATURE_VOLUMEID_CRAMFS
C379:root  or  ~FEATURE_VOLUMEID_BTRFS
C380:root  or  ~FEATURE_SH_EXTRA_QUIET
C381:root  or  ~SHA256SUM
C382:root  or  ~IPLINK
C383:root  or  ~FEATURE_VOLUMEID_HFS
C384:root  or  ~IPCRM
C385:root  or  ~SU
C386:root  or  ~FEATURE_INSMOD_VERSION_CHECKING
C387:root  or  ~FEATURE_UDHCP_PORT
C388:root  or  ~UPTIME
C389:root  or  ~TELNET
C390:root  or  ~SETKEYCODES
C391:root  or  ~CLEAR
C392:root  or  ~FBSET
C393:root  or  ~CAT
C394:root  or  ~FEATURE_COPYBUF_KB
C395:root  or  ~FEATURE_SEAMLESS_XZ
C396:root  or  ~SELINUXENABLED
C397:root  or  ~ECHO
C398:root  or  ~IFENSLAVE
C399:root  or  ~USE_BB_CRYPT
C400:root  or  ~WC
C401:root  or  ~FEATURE_VOLUMEID_EXT
C402:root  or  ~FREERAMDISK
C403:root  or  ~INOTIFYD
C404:root  or  ~TUNE2FS
C405:root  or  ~SYNC
C406:root  or  ~UNIQ
C407:root  or  ~FEATURE_INSMOD_LOAD_MAP
C408:root  or  ~REMOVE_SHELL
C409:root  or  ~SETSEBOOL
C410:root  or  ~BLKID
C411:root  or  ~NANDDUMP
C412:root  or  ~INETD
C413:root  or  ~HOSTID
C414:root  or  ~HWCLOCK
C415:root  or  ~FEATURE_MINIX2
C416:root  or  ~FEATURE_VOLUMEID_UDF
C417:root  or  ~IPADDR
C418:root  or  ~VI
C419:root  or  ~LESS
C420:root  or  ~FEATURE_SEAMLESS_BZ2
C421:root  or  ~FEATURE_USE_TERMIOS
C422:root  or  ~NICE
C423:root  or  ~PING
C424:root  or  ~MKFS_MINIX
C425:root  or  ~OD
C426:root  or  ~EXPAND
C427:root  or  ~UDHCPD
C428:root  or  ~SOFTLIMIT
C429:root  or  ~DPKG
C430:root  or  ~YES
C431:root  or  ~UDHCPC_DEFAULT_SCRIPT
C432:root  or  ~FEATURE_PIDFILE
C433:root  or  ~NBDCLIENT
C434:root  or  ~LSATTR
C435:root  or  ~CHROOT
C436:root  or  ~FEATURE_CHECK_TAINTED_MODULE
C437:root  or  ~TIME
C438:root  or  ~MD5_SIZE_VS_SPEED
C439:root  or  ~FEATURE_UDHCP_RFC3397
C440:root  or  ~CHVT
C441:root  or  ~PGREP
C442:root  or  ~VERBOSE_RESOLUTION_ERRORS
C443:root  or  ~RMDIR
C444:root  or  ~RM
C445:root  or  ~CKSUM
C446:root  or  ~FEATURE_MTAB_SUPPORT
C447:root  or  ~LOSETUP
C448:root  or  ~FEATURE_UTMP
C449:root  or  ~CRONTAB
C450:root  or  ~NC
C451:root  or  ~FEATURE_VOLUMEID_REISERFS
C452:root  or  ~NAMEIF
C453:root  or  ~PREFIX
C454:root  or  ~ARPING
C455:root  or  ~MONOTONIC_SYSCALL
C456:root  or  ~IFCONFIG
C457:root  or  ~UDPSVD
C458:root  or  ~FEATURE_HAVE_RPC
C459:root  or  ~MKFIFO
C460:root  or  ~DOS2UNIX
C461:root  or  ~XARGS
C462:root  or  ~VOLUMEID
C463:root  or  ~FEATURE_VOLUMEID_FAT
C464:root  or  ~KBD_MODE
C465:root  or  ~FEATURE_MODUTILS_SYMBOLS
C466:root  or  ~PS
C467:root  or  ~RESET
C468:root  or  ~SCRIPTREPLAY
C469:root  or  ~NETSTAT
C470:root  or  ~STATIC
C471:root  or  ~FEATURE_ETC_NETWORKS
C472:root  or  ~TTY
C473:root  or  ~TOUCH
C474:root  or  ~PKILL
C475:root  or  ~MKNOD
C476:root  or  ~FEATURE_VOLUMEID_LUKS
C477:root  or  ~MODINFO
C478:root  or  ~FEATURE_VOLUMEID_NTFS
C479:root  or  ~MPSTAT
C480:root  or  ~WATCHDOG
C481:UDHCP_DEBUG  or  ~root
C482:BUSYBOX_EXEC_PATH  or  ~root
C483:DEFAULT_MODULES_DIR  or  ~root
C484:FEATURE_SH_IS_HUSH_alt  or  ~root
C485:DEFAULT_DEPMOD_FILE  or  ~root
C486:EXTRA_CFLAGS  or  ~root
C487:PASSWORD_MINLEN  or  ~root
C488:IFUPDOWN_UDHCPC_CMD_OPTIONS  or  ~root
C489:INSTALL_SH_APPLET_SCRIPT_WRAPPER_alt  or  ~root
C490:UDHCPC_SLACK_FOR_BUGGY_SERVERS  or  ~root
C491:FEATURE_BUFFERS_GO_IN_BSS_alt  or  ~root
C492:FEATURE_BASH_IS_HUSH_alt  or  ~root
C493:DMALLOC_alt  or  ~root
C494:CROSS_COMPILER_PREFIX  or  ~root
C495:INSTALL_APPLET_DONT_alt  or  ~root
C496:FEATURE_COPYBUF_KB  or  ~root
C497:UDHCPC_DEFAULT_SCRIPT  or  ~root
C498:MD5_SIZE_VS_SPEED  or  ~root
C499:PREFIX  or  ~root
C500:TELNET  or  ~FEATURE_TELNET_TTYPE
C501:TELNET  or  ~FEATURE_TELNET_AUTOLOGIN
C502:TRACEROUTE  or  ~FEATURE_TRACEROUTE_USE_ICMP
C503:TRACEROUTE  or  ~FEATURE_TRACEROUTE_VERBOSE
C504:TRACEROUTE  or  ~FEATURE_TRACEROUTE_SOURCE_ROUTE
C505:TRACEROUTE  or  ~TRACEROUTE6
C506:DMALLOC_alt  or  ~NO_DEBUG_LIB
C507:DMALLOC_alt  or  ~DMALLOC
C508:DMALLOC_alt  or  ~EFENCE
C509:NO_DEBUG_LIB  or  DMALLOC  or  EFENCE  or  ~DMALLOC_alt
C510:~NO_DEBUG_LIB  or  ~DMALLOC
C511:~NO_DEBUG_LIB  or  ~EFENCE
C512:~DMALLOC  or  ~EFENCE
C513:MODPROBE_SMALL  or  ~DEPMOD
C514:MODPROBE_SMALL  or  ~FEATURE_MODPROBE_SMALL_OPTIONS_ON_CMDLINE
C515:MODPROBE_SMALL  or  ~LSMOD
C516:MODPROBE_SMALL  or  ~RMMOD
C517:MODPROBE_SMALL  or  ~MODPROBE
C518:MODPROBE_SMALL  or  ~INSMOD
C519:MODPROBE_SMALL  or  ~FEATURE_MODPROBE_SMALL_CHECK_ALREADY_LOADED
C520:SETCONSOLE  or  ~FEATURE_SETCONSOLE_LONG_OPTIONS
C521:FDISK  or  ~FDISK_SUPPORT_LARGE_DISKS
C522:FDISK  or  ~FEATURE_FDISK_WRITABLE
C523:FEATURE_SH_IS_HUSH_alt  or  ~FEATURE_SH_IS_ASH
C524:FEATURE_SH_IS_HUSH_alt  or  ~FEATURE_SH_IS_HUSH
C525:FEATURE_SH_IS_HUSH_alt  or  ~FEATURE_SH_IS_NONE
C526:FEATURE_SH_IS_ASH  or  FEATURE_SH_IS_HUSH  or  FEATURE_SH_IS_NONE  or  ~FEATURE_SH_IS_HUSH_alt
C527:~FEATURE_SH_IS_ASH  or  ~FEATURE_SH_IS_HUSH
C528:~FEATURE_SH_IS_ASH  or  ~FEATURE_SH_IS_NONE
C529:~FEATURE_SH_IS_HUSH  or  ~FEATURE_SH_IS_NONE
C530:IP  or  ~FEATURE_IP_RULE
C531:IP  or  ~FEATURE_IP_LINK
C532:IP  or  ~FEATURE_IP_TUNNEL
C533:IP  or  ~FEATURE_IP_ROUTE
C534:IP  or  ~FEATURE_IP_ADDRESS
C535:IP  or  ~FEATURE_IP_SHORT_FORMS
C536:IP  or  ~FEATURE_IP_RARE_PROTOCOLS
C537:USE_BB_PWD_GRP  or  ~USE_BB_SHADOW
C538:FEATURE_SUID  or  ~FEATURE_SUID_CONFIG
C539:FEATURE_MDEV_RENAME  or  ~FEATURE_MDEV_RENAME_REGEXP
C540:TFTPD  or  ~FEATURE_TFTP_PUT
C541:TFTPD  or  ~FEATURE_TFTP_BLOCKSIZE
C542:TFTPD  or  ~TFTP_DEBUG
C543:TFTPD  or  ~FEATURE_TFTP_GET
C544:PING  or  ~PING6
C545:PING  or  ~FEATURE_FANCY_PING
C546:START_STOP_DAEMON  or  ~FEATURE_START_STOP_DAEMON_LONG_OPTIONS
C547:START_STOP_DAEMON  or  ~FEATURE_START_STOP_DAEMON_FANCY
C548:GZIP  or  ~FEATURE_GZIP_LONG_OPTIONS
C549:LS  or  ~FEATURE_LS_TIMESTAMPS
C550:LS  or  ~FEATURE_LS_FILETYPES
C551:LS  or  ~FEATURE_LS_RECURSIVE
C552:LS  or  ~FEATURE_LS_COLOR
C553:LS  or  ~FEATURE_LS_FOLLOWLINKS
C554:LS  or  ~FEATURE_LS_USERNAME
C555:LS  or  ~FEATURE_LS_SORTFILES
C556:LOGREAD  or  ~FEATURE_LOGREAD_REDUCED_LOCKING
C557:FEATURE_CALL_TELINIT  or  ~TELINIT_PATH
C558:TELINIT_PATH  or  ~FEATURE_CALL_TELINIT
C559:ADDUSER  or  ~LAST_SYSTEM_ID
C560:ADDUSER  or  ~FEATURE_ADDUSER_LONG_OPTIONS
C561:ADDUSER  or  ~FEATURE_CHECK_NAMES
C562:ADDUSER  or  ~FIRST_SYSTEM_ID
C563:LAST_SYSTEM_ID  or  ~ADDUSER
C564:FIRST_SYSTEM_ID  or  ~ADDUSER
C565:MV  or  ~FEATURE_MV_LONG_OPTIONS
C566:NC  or  ~NC_SERVER
C567:NC  or  ~NC_110_COMPAT
C568:NC  or  ~NC_EXTRA
C569:ACPID  or  ~FEATURE_ACPID_COMPAT
C570:LESS  or  ~FEATURE_LESS_FLAGS
C571:LESS  or  ~FEATURE_LESS_MAXLINES
C572:LESS  or  ~FEATURE_LESS_REGEXP
C573:LESS  or  ~FEATURE_LESS_WINCH
C574:LESS  or  ~FEATURE_LESS_BRACKETS
C575:LESS  or  ~FEATURE_LESS_MARKS
C576:LESS  or  ~FEATURE_LESS_DASHCMD
C577:FEATURE_LESS_MAXLINES  or  ~LESS
C578:XARGS  or  ~FEATURE_XARGS_SUPPORT_CONFIRMATION
C579:XARGS  or  ~FEATURE_XARGS_SUPPORT_QUOTES
C580:XARGS  or  ~FEATURE_XARGS_SUPPORT_ZERO_TERM
C581:XARGS  or  ~FEATURE_XARGS_SUPPORT_TERMOPT
C582:BOOTCHARTD  or  ~FEATURE_BOOTCHARTD_CONFIG_FILE
C583:BOOTCHARTD  or  ~FEATURE_BOOTCHARTD_BLOATED_HEADER
C584:FEATURE_TAB_COMPLETION  or  ~FEATURE_USERNAME_COMPLETION
C585:EXPR  or  ~EXPR_MATH_SUPPORT_64
C586:DPKG_DEB  or  ~FEATURE_DPKG_DEB_EXTRACT_ONLY
C587:SLEEP  or  ~FEATURE_FANCY_SLEEP
C588:PS  or  ~FEATURE_PS_TIME
C589:PS  or  ~FEATURE_PS_ADDITIONAL_COLUMNS
C590:PS  or  ~FEATURE_PS_WIDE
C591:ECHO  or  ~FEATURE_FANCY_ECHO
C592:INETD  or  ~FEATURE_INETD_RPC
C593:INETD  or  ~FEATURE_INETD_SUPPORT_BUILTIN_ECHO
C594:INETD  or  ~FEATURE_INETD_SUPPORT_BUILTIN_DISCARD
C595:INETD  or  ~FEATURE_INETD_SUPPORT_BUILTIN_TIME
C596:INETD  or  ~FEATURE_INETD_SUPPORT_BUILTIN_CHARGEN
C597:INETD  or  ~FEATURE_INETD_SUPPORT_BUILTIN_DAYTIME
C598:NTPD  or  ~FEATURE_NTPD_SERVER
C599:MAKEMIME  or  ~FEATURE_MIME_CHARSET
C600:FEATURE_MIME_CHARSET  or  ~MAKEMIME
C601:FEATURE_TOP_CPU_USAGE_PERCENTAGE  or  ~FEATURE_TOP_DECIMALS
C602:FEATURE_TOP_CPU_USAGE_PERCENTAGE  or  ~FEATURE_TOP_CPU_GLOBAL_PERCENTS
C603:HUSH_BASH_COMPAT  or  ~HUSH_BRACE_EXPANSION
C604:CPIO  or  ~FEATURE_CPIO_O
C605:FTPPUT  or  ~FEATURE_FTPGETPUT_LONG_OPTIONS
C606:SU  or  ~FEATURE_SU_CHECKS_SHELLS
C607:SU  or  ~FEATURE_SU_SYSLOG
C608:SV  or  ~SV_DEFAULT_SERVICE_DIR
C609:SV_DEFAULT_SERVICE_DIR  or  ~SV
C610:IFCONFIG  or  ~FEATURE_IFCONFIG_STATUS
C611:IFCONFIG  or  ~FEATURE_IFCONFIG_HW
C612:IFCONFIG  or  ~FEATURE_IFCONFIG_MEMSTART_IOADDR_IRQ
C613:IFCONFIG  or  ~FEATURE_IFCONFIG_SLIP
C614:IFCONFIG  or  ~FEATURE_IFCONFIG_BROADCAST_PLUS
C615:SWAPONOFF  or  ~FEATURE_SWAPON_PRI
C616:TR  or  ~FEATURE_TR_CLASSES
C617:TR  or  ~FEATURE_TR_EQUIV
C618:FEATURE_BUFFERS_GO_IN_BSS_alt  or  ~FEATURE_BUFFERS_USE_MALLOC
C619:FEATURE_BUFFERS_GO_IN_BSS_alt  or  ~FEATURE_BUFFERS_GO_ON_STACK
C620:FEATURE_BUFFERS_GO_IN_BSS_alt  or  ~FEATURE_BUFFERS_GO_IN_BSS
C621:FEATURE_BUFFERS_USE_MALLOC  or  FEATURE_BUFFERS_GO_ON_STACK  or  FEATURE_BUFFERS_GO_IN_BSS  or  ~FEATURE_BUFFERS_GO_IN_BSS_alt
C622:~FEATURE_BUFFERS_USE_MALLOC  or  ~FEATURE_BUFFERS_GO_ON_STACK
C623:~FEATURE_BUFFERS_USE_MALLOC  or  ~FEATURE_BUFFERS_GO_IN_BSS
C624:~FEATURE_BUFFERS_GO_ON_STACK  or  ~FEATURE_BUFFERS_GO_IN_BSS
C625:FEATURE_TELNETD_STANDALONE  or  ~FEATURE_TELNETD_INETD_WAIT
C626:PASSWD  or  ~FEATURE_PASSWD_WEAK_CHECK
C627:IFUPDOWN  or  ~FEATURE_IFUPDOWN_IPV4
C628:IFUPDOWN  or  ~FEATURE_IFUPDOWN_IP
C629:IFUPDOWN  or  ~IFUPDOWN_IFSTATE_PATH
C630:IFUPDOWN  or  ~FEATURE_IFUPDOWN_MAPPING
C631:IFUPDOWN  or  ~FEATURE_IFUPDOWN_IPV6
C632:IFUPDOWN  or  ~FEATURE_IFUPDOWN_EXTERNAL_DHCP
C633:IFUPDOWN_IFSTATE_PATH  or  ~IFUPDOWN
C634:VI  or  ~FEATURE_VI_DOT_CMD
C635:VI  or  ~FEATURE_VI_ASK_TERMINAL
C636:VI  or  ~FEATURE_VI_WIN_RESIZE
C637:VI  or  ~FEATURE_VI_8BIT
C638:VI  or  ~FEATURE_VI_SET
C639:VI  or  ~FEATURE_ALLOW_EXEC
C640:VI  or  ~FEATURE_VI_MAX_LEN
C641:VI  or  ~FEATURE_VI_READONLY
C642:VI  or  ~FEATURE_VI_USE_SIGNALS
C643:VI  or  ~FEATURE_VI_OPTIMIZE_CURSOR
C644:VI  or  ~FEATURE_VI_SETOPTS
C645:VI  or  ~FEATURE_VI_SEARCH
C646:VI  or  ~FEATURE_VI_YANKMARK
C647:VI  or  ~FEATURE_VI_COLON
C648:FEATURE_VI_MAX_LEN  or  ~VI
C649:SETFONT  or  ~DEFAULT_SETFONT_DIR
C650:SETFONT  or  ~FEATURE_SETFONT_TEXTUAL_MAP
C651:DEFAULT_SETFONT_DIR  or  ~SETFONT
C652:LAST  or  ~FEATURE_LAST_SMALL_alt
C653:FEATURE_LAST_SMALL_alt  or  ~LAST
C654:FEATURE_TFTP_BLOCKSIZE  or  ~FEATURE_TFTP_PROGRESS_BAR
C655:WC  or  ~FEATURE_WC_LARGE
C656:SYSLOGD  or  ~FEATURE_ROTATE_LOGFILE
C657:SYSLOGD  or  ~FEATURE_SYSLOGD_DUP
C658:SYSLOGD  or  ~FEATURE_REMOTE_LOG
C659:SYSLOGD  or  ~FEATURE_IPC_SYSLOG
C660:SYSLOGD  or  ~FEATURE_SYSLOGD_READ_BUFFER_SIZE
C661:FEATURE_SYSLOGD_READ_BUFFER_SIZE  or  ~SYSLOGD
C662:GREP  or  ~FEATURE_GREP_FGREP_ALIAS
C663:GREP  or  ~FEATURE_GREP_CONTEXT
C664:GREP  or  ~FEATURE_GREP_EGREP_ALIAS
C665:FEATURE_SUID_CONFIG  or  ~FEATURE_SUID_CONFIG_QUIET
C666:LOGIN  or  ~LOGIN_SCRIPTS
C667:LOGIN  or  ~PAM
C668:LOGIN  or  ~FEATURE_SECURETTY
C669:LOGIN  or  ~FEATURE_NOLOGIN
C670:CHAT  or  ~FEATURE_CHAT_CLR_ABORT
C671:CHAT  or  ~FEATURE_CHAT_SEND_ESCAPES
C672:CHAT  or  ~FEATURE_CHAT_NOFAIL
C673:CHAT  or  ~FEATURE_CHAT_IMPLICIT_CR
C674:CHAT  or  ~FEATURE_CHAT_SWALLOW_OPTS
C675:CHAT  or  ~FEATURE_CHAT_VAR_ABORT_LEN
C676:CHAT  or  ~FEATURE_CHAT_TTY_HIFI
C677:UNXZ  or  ~XZ
C678:KILL  or  ~KILLALL5
C679:KILL  or  ~KILLALL
C680:INSTALL_SH_APPLET_SCRIPT_WRAPPER_alt  or  ~INSTALL_SH_APPLET_SYMLINK
C681:INSTALL_SH_APPLET_SCRIPT_WRAPPER_alt  or  ~INSTALL_SH_APPLET_HARDLINK
C682:INSTALL_SH_APPLET_SCRIPT_WRAPPER_alt  or  ~INSTALL_SH_APPLET_SCRIPT_WRAPPER
C683:INSTALL_SH_APPLET_SYMLINK  or  INSTALL_SH_APPLET_HARDLINK  or  INSTALL_SH_APPLET_SCRIPT_WRAPPER  or  ~INSTALL_SH_APPLET_SCRIPT_WRAPPER_alt
C684:~INSTALL_SH_APPLET_SYMLINK  or  ~INSTALL_SH_APPLET_HARDLINK
C685:~INSTALL_SH_APPLET_SYMLINK  or  ~INSTALL_SH_APPLET_SCRIPT_WRAPPER
C686:~INSTALL_SH_APPLET_HARDLINK  or  ~INSTALL_SH_APPLET_SCRIPT_WRAPPER
C687:TAR  or  ~FEATURE_TAR_LONG_OPTIONS
C688:TAR  or  ~FEATURE_TAR_SELINUX
C689:TAR  or  ~FEATURE_TAR_NOPRESERVE_TIME
C690:TAR  or  ~FEATURE_TAR_CREATE
C691:TAR  or  ~FEATURE_TAR_OLDGNU_COMPATIBILITY
C692:TAR  or  ~FEATURE_TAR_FROM
C693:TAR  or  ~FEATURE_TAR_UNAME_GNAME
C694:TAR  or  ~FEATURE_TAR_GNU_EXTENSIONS
C695:TAR  or  ~FEATURE_TAR_AUTODETECT
C696:TAR  or  ~FEATURE_TAR_OLDSUN_COMPATIBILITY
C697:FEATURE_CPIO_O  or  ~FEATURE_CPIO_P
C698:MKSWAP  or  ~FEATURE_MKSWAP_UUID
C699:RUNCON  or  ~FEATURE_RUNCON_LONG_OPTIONS
C700:LSMOD  or  ~FEATURE_LSMOD_PRETTY_2_6_OUTPUT
C701:MODPROBE  or  ~FEATURE_MODPROBE_BLACKLIST
C702:FEATURE_DD_SIGNAL_HANDLING  or  ~FEATURE_DD_THIRD_STATUS_LINE
C703:DOS2UNIX  or  ~UNIX2DOS
C704:TEE  or  ~FEATURE_TEE_USE_BLOCK_IO
C705:RUNSVDIR  or  ~FEATURE_RUNSVDIR_LOG
C706:FEATURE_EDITING  or  ~FEATURE_EDITING_ASK_TERMINAL
C707:FEATURE_EDITING  or  ~FEATURE_EDITING_FANCY_PROMPT
C708:FEATURE_EDITING  or  ~FEATURE_TAB_COMPLETION
C709:FEATURE_EDITING  or  ~FEATURE_EDITING_HISTORY
C710:FEATURE_EDITING  or  ~FEATURE_EDITING_MAX_LEN
C711:FEATURE_EDITING  or  ~FEATURE_EDITING_VI
C712:FEATURE_EDITING  or  ~FEATURE_EDITING_SAVEHISTORY
C713:FEATURE_EDITING_HISTORY  or  ~FEATURE_EDITING
C714:FEATURE_EDITING_MAX_LEN  or  ~FEATURE_EDITING
C715:HUSH  or  ~HUSH_CASE
C716:HUSH  or  ~HUSH_RANDOM_SUPPORT
C717:HUSH  or  ~HUSH_EXPORT_N
C718:HUSH  or  ~HUSH_INTERACTIVE
C719:HUSH  or  ~HUSH_FUNCTIONS
C720:HUSH  or  ~HUSH_BASH_COMPAT
C721:HUSH  or  ~HUSH_IF
C722:HUSH  or  ~HUSH_HELP
C723:HUSH  or  ~HUSH_TICK
C724:HUSH  or  ~HUSH_LOOPS
C725:HUSH  or  ~HUSH_MODE_X
C726:PIDOF  or  ~FEATURE_PIDOF_SINGLE
C727:PIDOF  or  ~FEATURE_PIDOF_OMIT
C728:DIFF  or  ~FEATURE_DIFF_LONG_OPTIONS
C729:DIFF  or  ~FEATURE_DIFF_DIR
C730:FEATURE_FDISK_WRITABLE  or  ~FEATURE_AIX_LABEL
C731:FEATURE_FDISK_WRITABLE  or  ~FEATURE_SGI_LABEL
C732:FEATURE_FDISK_WRITABLE  or  ~FEATURE_GPT_LABEL
C733:FEATURE_FDISK_WRITABLE  or  ~FEATURE_OSF_LABEL
C734:FEATURE_FDISK_WRITABLE  or  ~FEATURE_FDISK_ADVANCED
C735:FEATURE_FDISK_WRITABLE  or  ~FEATURE_SUN_LABEL
C736:KLOGD  or  ~FEATURE_KLOGD_KLOGCTL
C737:BEEP  or  ~FEATURE_BEEP_LENGTH_MS
C738:BEEP  or  ~FEATURE_BEEP_FREQ
C739:FEATURE_BEEP_LENGTH_MS  or  ~BEEP
C740:FEATURE_BEEP_FREQ  or  ~BEEP
C741:NAMEIF  or  ~FEATURE_NAMEIF_EXTENDED
C742:FEATURE_MAKEDEVS_TABLE_alt  or  ~FEATURE_MAKEDEVS_LEAF
C743:FEATURE_MAKEDEVS_TABLE_alt  or  ~FEATURE_MAKEDEVS_TABLE
C744:FEATURE_MAKEDEVS_LEAF  or  FEATURE_MAKEDEVS_TABLE  or  ~FEATURE_MAKEDEVS_TABLE_alt
C745:~FEATURE_MAKEDEVS_LEAF  or  ~FEATURE_MAKEDEVS_TABLE
C746:FEATURE_BASH_IS_HUSH_alt  or  ~FEATURE_BASH_IS_ASH
C747:FEATURE_BASH_IS_HUSH_alt  or  ~FEATURE_BASH_IS_HUSH
C748:FEATURE_BASH_IS_HUSH_alt  or  ~FEATURE_BASH_IS_NONE
C749:FEATURE_BASH_IS_ASH  or  FEATURE_BASH_IS_HUSH  or  FEATURE_BASH_IS_NONE  or  ~FEATURE_BASH_IS_HUSH_alt
C750:~FEATURE_BASH_IS_ASH  or  ~FEATURE_BASH_IS_HUSH
C751:~FEATURE_BASH_IS_ASH  or  ~FEATURE_BASH_IS_NONE
C752:~FEATURE_BASH_IS_HUSH  or  ~FEATURE_BASH_IS_NONE
C753:FEATURE_INSTALLER  or  ~INSTALL_NO_USR
C754:READLINK  or  ~FEATURE_READLINK_FOLLOW
C755:TAIL  or  ~FEATURE_FANCY_TAIL
C756:CROND  or  ~FEATURE_CROND_CALL_SENDMAIL
C757:CROND  or  ~FEATURE_CROND_D
C758:CROND  or  ~FEATURE_CROND_DIR
C759:FEATURE_CROND_DIR  or  ~CROND
C760:HTTPD  or  ~FEATURE_HTTPD_USE_SENDFILE
C761:HTTPD  or  ~FEATURE_HTTPD_GZIP
C762:HTTPD  or  ~FEATURE_HTTPD_SETUID
C763:HTTPD  or  ~FEATURE_HTTPD_CGI
C764:HTTPD  or  ~FEATURE_HTTPD_BASIC_AUTH
C765:HTTPD  or  ~FEATURE_HTTPD_PROXY
C766:HTTPD  or  ~FEATURE_HTTPD_RANGES
C767:HTTPD  or  ~FEATURE_HTTPD_ENCODE_URL_STR
C768:HTTPD  or  ~FEATURE_HTTPD_ERROR_PAGES
C769:TEST  or  ~FEATURE_TEST_64
C770:ENV  or  ~FEATURE_ENV_LONG_OPTIONS
C771:FEATURE_HTTPD_BASIC_AUTH  or  ~FEATURE_HTTPD_AUTH_MD5
C772:RMDIR  or  ~FEATURE_RMDIR_LONG_OPTIONS
C773:MAKEDEVS  or  ~FEATURE_MAKEDEVS_TABLE_alt
C774:FEATURE_MAKEDEVS_TABLE_alt  or  ~MAKEDEVS
C775:CHCON  or  ~FEATURE_CHCON_LONG_OPTIONS
C776:INIT  or  ~FEATURE_INIT_COREDUMPS
C777:INIT  or  ~FEATURE_USE_INITTAB
C778:INIT  or  ~FEATURE_INIT_SCTTY
C779:INIT  or  ~FEATURE_INIT_SYSLOG
C780:INIT  or  ~FEATURE_INITRD
C781:INIT  or  ~INIT_TERMINAL_TYPE
C782:INIT  or  ~FEATURE_EXTRA_QUIET
C783:INIT_TERMINAL_TYPE  or  ~INIT
C784:INSTALL_APPLET_DONT_alt  or  ~INSTALL_APPLET_SYMLINKS
C785:INSTALL_APPLET_DONT_alt  or  ~INSTALL_APPLET_HARDLINKS
C786:INSTALL_APPLET_DONT_alt  or  ~INSTALL_APPLET_SCRIPT_WRAPPERS
C787:INSTALL_APPLET_DONT_alt  or  ~INSTALL_APPLET_DONT
C788:INSTALL_APPLET_SYMLINKS  or  INSTALL_APPLET_HARDLINKS  or  INSTALL_APPLET_SCRIPT_WRAPPERS  or  INSTALL_APPLET_DONT  or  ~INSTALL_APPLET_DONT_alt
C789:~INSTALL_APPLET_SYMLINKS  or  ~INSTALL_APPLET_HARDLINKS
C790:~INSTALL_APPLET_SYMLINKS  or  ~INSTALL_APPLET_SCRIPT_WRAPPERS
C791:~INSTALL_APPLET_SYMLINKS  or  ~INSTALL_APPLET_DONT
C792:~INSTALL_APPLET_HARDLINKS  or  ~INSTALL_APPLET_SCRIPT_WRAPPERS
C793:~INSTALL_APPLET_HARDLINKS  or  ~INSTALL_APPLET_DONT
C794:~INSTALL_APPLET_SCRIPT_WRAPPERS  or  ~INSTALL_APPLET_DONT
C795:TOP  or  ~FEATURE_TOP_CPU_USAGE_PERCENTAGE
C796:TOP  or  ~FEATURE_SHOW_THREADS
C797:TOP  or  ~FEATURE_TOP_SMP_PROCESS
C798:TOP  or  ~FEATURE_TOPMEM
C799:HWCLOCK  or  ~FEATURE_HWCLOCK_LONG_OPTIONS
C800:HWCLOCK  or  ~FEATURE_HWCLOCK_ADJTIME_FHS
C801:FEATURE_TOP_CPU_GLOBAL_PERCENTS  or  ~FEATURE_TOP_SMP_CPU
C802:TELNETD  or  ~FEATURE_TELNETD_STANDALONE
C803:FIND  or  ~FEATURE_FIND_REGEX
C804:FIND  or  ~FEATURE_FIND_DELETE
C805:FIND  or  ~FEATURE_FIND_MAXDEPTH
C806:FIND  or  ~FEATURE_FIND_NOT
C807:FIND  or  ~FEATURE_FIND_PRINT0
C808:FIND  or  ~FEATURE_FIND_NEWER
C809:FIND  or  ~FEATURE_FIND_CONTEXT
C810:FIND  or  ~FEATURE_FIND_PERM
C811:FIND  or  ~FEATURE_FIND_USER
C812:FIND  or  ~FEATURE_FIND_MMIN
C813:FIND  or  ~FEATURE_FIND_PRUNE
C814:FIND  or  ~FEATURE_FIND_INUM
C815:FIND  or  ~FEATURE_FIND_GROUP
C816:FIND  or  ~FEATURE_FIND_TYPE
C817:FIND  or  ~FEATURE_FIND_LINKS
C818:FIND  or  ~FEATURE_FIND_PAREN
C819:FIND  or  ~FEATURE_FIND_XDEV
C820:FIND  or  ~FEATURE_FIND_SIZE
C821:FIND  or  ~FEATURE_FIND_MTIME
C822:FIND  or  ~FEATURE_FIND_EXEC
C823:FIND  or  ~FEATURE_FIND_DEPTH
C824:FIND  or  ~FEATURE_FIND_PATH
C825:UMOUNT  or  ~FEATURE_UMOUNT_ALL
C826:SORT  or  ~FEATURE_SORT_BIG
C827:BBCONFIG  or  ~FEATURE_COMPRESS_BBCONFIG
C828:HEAD  or  ~FEATURE_FANCY_HEAD
C829:HUSH_INTERACTIVE  or  ~HUSH_SAVEHISTORY
C830:HUSH_INTERACTIVE  or  ~HUSH_JOB
C831:DEBUG  or  ~DEBUG_PESSIMIZE
C832:NETSTAT  or  ~FEATURE_NETSTAT_WIDE
C833:NETSTAT  or  ~FEATURE_NETSTAT_PRG
C834:FBSET  or  ~FEATURE_FBSET_FANCY
C835:FBSET  or  ~FEATURE_FBSET_READMODE
C836:INSTALL  or  ~FEATURE_INSTALL_LONG_OPTIONS
C837:FEATURE_USE_INITTAB  or  ~FEATURE_KILL_REMOVED
C838:FEATURE_MDEV_CONF  or  ~FEATURE_MDEV_EXEC
C839:FEATURE_MDEV_CONF  or  ~FEATURE_MDEV_RENAME
C840:SPLIT  or  ~FEATURE_SPLIT_FANCY
C841:ASH  or  ~ASH_BUILTIN_PRINTF
C842:ASH  or  ~ASH_ALIAS
C843:ASH  or  ~ASH_CMDCMD
C844:ASH  or  ~ASH_BASH_COMPAT
C845:ASH  or  ~ASH_MAIL
C846:ASH  or  ~ASH_BUILTIN_ECHO
C847:ASH  or  ~ASH_JOB_CONTROL
C848:ASH  or  ~ASH_GETOPTS
C849:ASH  or  ~ASH_OPTIMIZE_FOR_SIZE
C850:ASH  or  ~ASH_BUILTIN_TEST
C851:ASH  or  ~ASH_RANDOM_SUPPORT
C852:ASH  or  ~ASH_EXPAND_PRMT
C853:MKDIR  or  ~FEATURE_MKDIR_LONG_OPTIONS
C854:FEATURE_IPC_SYSLOG  or  ~FEATURE_IPC_SYSLOG_BUFFER_SIZE
C855:FEATURE_IPC_SYSLOG  or  ~LOGREAD
C856:FEATURE_IPC_SYSLOG_BUFFER_SIZE  or  ~FEATURE_IPC_SYSLOG
C857:STAT  or  ~FEATURE_STAT_FORMAT
C858:GETOPT  or  ~FEATURE_GETOPT_LONG
C859:FEATURE_HTTPD_CGI  or  ~FEATURE_HTTPD_SET_REMOTE_PORT_TO_ENV
C860:FEATURE_HTTPD_CGI  or  ~FEATURE_HTTPD_CONFIG_WITH_SCRIPT_INTERPR
C861:FEATURE_LESS_DASHCMD  or  ~FEATURE_LESS_LINENUMS
C862:BUILD_LIBBUSYBOX  or  ~FEATURE_SHARED_BUSYBOX
C863:BUILD_LIBBUSYBOX  or  ~FEATURE_INDIVIDUAL
C864:POPMAILDIR  or  ~FEATURE_POPMAILDIR_DELIVERY
C865:DELGROUP  or  ~FEATURE_DEL_USER_FROM_GROUP
C866:USE_BB_CRYPT  or  ~USE_BB_CRYPT_SHA
C867:REFORMIME  or  ~FEATURE_REFORMIME_COMPAT
C868:AWK  or  ~FEATURE_AWK_LIBM
C869:IPCALC  or  ~FEATURE_IPCALC_LONG_OPTIONS
C870:IPCALC  or  ~FEATURE_IPCALC_FANCY
C871:SH_MATH_SUPPORT  or  ~SH_MATH_SUPPORT_64
C872:DEVFSD  or  ~DEVFSD_MODLOAD
C873:DEVFSD  or  ~DEVFSD_VERBOSE
C874:DEVFSD  or  ~DEVFSD_FG_NP
C875:SHOW_USAGE  or  ~FEATURE_COMPRESS_USAGE
C876:SHOW_USAGE  or  ~FEATURE_VERBOSE_USAGE
C877:ADDGROUP  or  ~FEATURE_ADDUSER_TO_GROUP
C878:ADDGROUP  or  ~FEATURE_ADDGROUP_LONG_OPTIONS
C879:FEATURE_TAR_LONG_OPTIONS  or  ~FEATURE_TAR_TO_COMMAND
C880:CHOWN  or  ~FEATURE_CHOWN_LONG_OPTIONS
C881:RESIZE  or  ~FEATURE_RESIZE_PRINT
C882:WGET  or  ~FEATURE_WGET_TIMEOUT
C883:WGET  or  ~FEATURE_WGET_STATUSBAR
C884:WGET  or  ~FEATURE_WGET_AUTHENTICATION
C885:WGET  or  ~FEATURE_WGET_LONG_OPTIONS
C886:EJECT  or  ~FEATURE_EJECT_SCSI
C887:FTPD  or  ~FEATURE_FTP_WRITE
C888:FTPD  or  ~FEATURE_FTPD_ACCEPT_BROKEN_LIST
C889:FEATURE_FANCY_SLEEP  or  ~FEATURE_FLOAT_SLEEP
C890:FEATURE_INSMOD_LOAD_MAP  or  ~FEATURE_INSMOD_LOAD_MAP_FULL
C891:RUN_PARTS  or  ~FEATURE_RUN_PARTS_LONG_OPTIONS
C892:RUN_PARTS  or  ~FEATURE_RUN_PARTS_FANCY
C893:MOUNT  or  ~FEATURE_MOUNT_FSTAB
C894:MOUNT  or  ~FEATURE_MOUNT_FAKE
C895:MOUNT  or  ~FEATURE_MOUNT_FLAGS
C896:MOUNT  or  ~FEATURE_MOUNT_LABEL
C897:MOUNT  or  ~FEATURE_MOUNT_VERBOSE
C898:MOUNT  or  ~FEATURE_MOUNT_NFS
C899:MOUNT  or  ~FEATURE_MOUNT_CIFS
C900:MOUNT  or  ~FEATURE_MOUNT_HELPERS
C901:UNICODE_SUPPORT  or  ~SUBST_WCHAR
C902:UNICODE_SUPPORT  or  ~UNICODE_WIDE_WCHARS
C903:UNICODE_SUPPORT  or  ~UNICODE_COMBINING_WCHARS
C904:UNICODE_SUPPORT  or  ~UNICODE_USING_LOCALE
C905:UNICODE_SUPPORT  or  ~UNICODE_BIDI_SUPPORT
C906:UNICODE_SUPPORT  or  ~UNICODE_PRESERVE_BROKEN
C907:UNICODE_SUPPORT  or  ~LAST_SUPPORTED_WCHAR
C908:UNICODE_SUPPORT  or  ~FEATURE_CHECK_UNICODE_IN_ENV
C909:SUBST_WCHAR  or  ~UNICODE_SUPPORT
C910:LAST_SUPPORTED_WCHAR  or  ~UNICODE_SUPPORT
C911:DATE  or  ~FEATURE_DATE_ISOFMT
C912:DATE  or  ~FEATURE_DATE_NANO
C913:DATE  or  ~FEATURE_DATE_COMPAT
C914:TASKSET  or  ~FEATURE_TASKSET_FANCY
C915:LZOP  or  ~LZOP_COMPR_HIGH
C916:FEATURE_IFUPDOWN_IP  or  ~FEATURE_IFUPDOWN_IFCONFIG_BUILTIN
C917:FEATURE_IFUPDOWN_IP  or  ~FEATURE_IFUPDOWN_IP_BUILTIN
C918:DMESG  or  ~FEATURE_DMESG_PRETTY
C919:UDHCPD  or  ~DHCPD_LEASES_FILE
C920:UDHCPD  or  ~FEATURE_UDHCPD_WRITE_LEASES_EARLY
C921:UDHCPD  or  ~DHCPRELAY
C922:UDHCPD  or  ~DUMPLEASES
C923:DHCPD_LEASES_FILE  or  ~UDHCPD
C924:FEATURE_MOUNT_LOOP  or  ~FEATURE_MOUNT_LOOP_CREATE
C925:UDHCPC  or  ~FEATURE_UDHCPC_ARPING
C926:FEATURE_LS_COLOR  or  ~FEATURE_LS_COLOR_IS_DEFAULT
C927:FEATURE_BRCTL_FANCY  or  ~FEATURE_BRCTL_SHOW
C928:~UNICODE_USING_LOCALE  or  UNICODE_SUPPORT
C929:~UNICODE_USING_LOCALE  or  LOCALE_SUPPORT
C930:~FEATURE_CHECK_UNICODE_IN_ENV  or  UNICODE_SUPPORT
C931:~FEATURE_CHECK_UNICODE_IN_ENV  or  ~UNICODE_USING_LOCALE
C932:~UNICODE_BIDI_SUPPORT  or  UNICODE_SUPPORT
C933:~UNICODE_BIDI_SUPPORT  or  ~UNICODE_USING_LOCALE
C934:FEATURE_SYSLOG  or  ~NAMEIF  or  ~PLATFORM_LINUX
C935:FEATURE_SYSLOG  or  ~ZCIP  or  ~PLATFORM_LINUX
C936:FEATURE_SYSLOG  or  ~FEATURE_MOUNT_NFS  or  ~MOUNT
C937:FEATURE_SYSLOG  or  ~DEVFSD  or  ~PLATFORM_LINUX
C938:FEATURE_SYSLOG  or  ~SULOGIN
C939:FEATURE_SYSLOG  or  ~PASSWD
C940:FEATURE_SYSLOG  or  ~CROND
C941:FEATURE_SYSLOG  or  ~FAKEIDENTD
C942:FEATURE_SYSLOG  or  ~LOGIN
C943:FEATURE_SYSLOG  or  ~INIT
C944:FEATURE_SYSLOG  or  ~INETD
C945:FEATURE_SYSLOG  or  ~LOGGER
C946:FEATURE_SYSLOG  or  ~GETTY
C947:FEATURE_SYSLOG  or  ~SU
C948:FEATURE_SYSLOG  or  ~TELNETD
C949:~FEATURE_SYSLOG  or  SULOGIN  or  PASSWD  or  CROND  or  FAKEIDENTD  or  LOGIN  or  INIT  or  INETD  or  LOGGER  or  GETTY  or  SU  or  TELNETD  or  NAMEIF  or  ZCIP  or  FEATURE_MOUNT_NFS  or  DEVFSD
C950:~FEATURE_SYSLOG  or  SULOGIN  or  PASSWD  or  CROND  or  FAKEIDENTD  or  LOGIN  or  INIT  or  INETD  or  LOGGER  or  GETTY  or  SU  or  TELNETD  or  NAMEIF  or  ZCIP  or  MOUNT  or  DEVFSD
C951:~FEATURE_SYSLOG  or  SULOGIN  or  PASSWD  or  CROND  or  FAKEIDENTD  or  LOGIN  or  INIT  or  INETD  or  LOGGER  or  GETTY  or  SU  or  TELNETD  or  PLATFORM_LINUX  or  FEATURE_MOUNT_NFS
C952:~FEATURE_SYSLOG  or  SULOGIN  or  PASSWD  or  CROND  or  FAKEIDENTD  or  LOGIN  or  INIT  or  INETD  or  LOGGER  or  GETTY  or  SU  or  TELNETD  or  PLATFORM_LINUX  or  MOUNT
C953:FEATURE_HAVE_RPC  or  ~FEATURE_MOUNT_NFS  or  ~MOUNT
C954:FEATURE_HAVE_RPC  or  ~FEATURE_INETD_RPC  or  ~INETD
C955:~FEATURE_HAVE_RPC  or  FEATURE_MOUNT_NFS  or  FEATURE_INETD_RPC
C956:~FEATURE_HAVE_RPC  or  FEATURE_MOUNT_NFS  or  INETD
C957:~FEATURE_HAVE_RPC  or  MOUNT  or  FEATURE_INETD_RPC
C958:~FEATURE_HAVE_RPC  or  MOUNT  or  INETD
C959:~STATIC  or  ~PIE
C960:~BUILD_LIBBUSYBOX  or  ~FEATURE_PREFER_APPLETS
C961:~BUILD_LIBBUSYBOX  or  ~PIE
C962:~BUILD_LIBBUSYBOX  or  ~STATIC
C963:FEATURE_INSTALLER  or  FEATURE_SH_STANDALONE  or  FEATURE_PREFER_APPLETS  or  ~INSTALL_APPLET_DONT
C964:MORE  or  TOP  or  POWERTOP  or  ~FEATURE_USE_TERMIOS
C965:GZIP  or  ~FEATURE_GZIP_LONG_OPTIONS
C966:LONG_OPTS  or  ~FEATURE_GZIP_LONG_OPTIONS
C967:FEATURE_SEAMLESS_Z  or  FEATURE_SEAMLESS_GZ  or  FEATURE_SEAMLESS_BZ2  or  FEATURE_SEAMLESS_LZMA  or  FEATURE_SEAMLESS_XZ  or  ~FEATURE_TAR_AUTODETECT
C968:TAR  or  ~FEATURE_TAR_AUTODETECT
C969:TAR  or  ~FEATURE_TAR_LONG_OPTIONS
C970:LONG_OPTS  or  ~FEATURE_TAR_LONG_OPTIONS
C971:~FEATURE_TAR_SELINUX  or  TAR
C972:~FEATURE_TAR_SELINUX  or  SELINUX
C973:CHOWN  or  ~FEATURE_CHOWN_LONG_OPTIONS
C974:LONG_OPTS  or  ~FEATURE_CHOWN_LONG_OPTIONS
C975:CP  or  ~FEATURE_CP_LONG_OPTIONS
C976:LONG_OPTS  or  ~FEATURE_CP_LONG_OPTIONS
C977:~DOS2UNIX  or  UNIX2DOS
C978:~UNIX2DOS  or  DOS2UNIX
C979:ENV  or  ~FEATURE_ENV_LONG_OPTIONS
C980:LONG_OPTS  or  ~FEATURE_ENV_LONG_OPTIONS
C981:EXPAND  or  ~FEATURE_EXPAND_LONG_OPTIONS
C982:LONG_OPTS  or  ~FEATURE_EXPAND_LONG_OPTIONS
C983:INSTALL  or  ~FEATURE_INSTALL_LONG_OPTIONS
C984:LONG_OPTS  or  ~FEATURE_INSTALL_LONG_OPTIONS
C985:LS  or  ~FEATURE_LS_COLOR
C986:LONG_OPTS  or  ~FEATURE_LS_COLOR
C987:MKDIR  or  ~FEATURE_MKDIR_LONG_OPTIONS
C988:LONG_OPTS  or  ~FEATURE_MKDIR_LONG_OPTIONS
C989:MV  or  ~FEATURE_MV_LONG_OPTIONS
C990:LONG_OPTS  or  ~FEATURE_MV_LONG_OPTIONS
C991:RMDIR  or  ~FEATURE_RMDIR_LONG_OPTIONS
C992:LONG_OPTS  or  ~FEATURE_RMDIR_LONG_OPTIONS
C993:UNEXPAND  or  ~FEATURE_UNEXPAND_LONG_OPTIONS
C994:LONG_OPTS  or  ~FEATURE_UNEXPAND_LONG_OPTIONS
C995:FEATURE_UTMP  or  ~WHO
C996:CP  or  MV  or  ~FEATURE_PRESERVE_HARDLINKS
C997:LS  or  MORE  or  TELNET  or  ~FEATURE_AUTOWIDTH
C998:DF  or  DU  or  LS  or  ~FEATURE_HUMAN_READABLE
C999:MD5SUM  or  SHA1SUM  or  SHA256SUM  or  SHA512SUM  or  ~FEATURE_MD5_SHA1_SUM_CHECK
C1000:SETCONSOLE  or  ~FEATURE_SETCONSOLE_LONG_OPTIONS
C1001:LONG_OPTS  or  ~FEATURE_SETCONSOLE_LONG_OPTIONS
C1002:LOADFONT  or  SETFONT  or  ~FEATURE_LOADFONT_PSF2
C1003:LOADFONT  or  SETFONT  or  ~FEATURE_LOADFONT_RAW
C1004:RUN_PARTS  or  ~FEATURE_RUN_PARTS_LONG_OPTIONS
C1005:LONG_OPTS  or  ~FEATURE_RUN_PARTS_LONG_OPTIONS
C1006:START_STOP_DAEMON  or  ~FEATURE_START_STOP_DAEMON_LONG_OPTIONS
C1007:LONG_OPTS  or  ~FEATURE_START_STOP_DAEMON_LONG_OPTIONS
C1008:DIFF  or  ~FEATURE_DIFF_LONG_OPTIONS
C1009:LONG_OPTS  or  ~FEATURE_DIFF_LONG_OPTIONS
C1010:FIND  or  ~FEATURE_FIND_DELETE
C1011:FEATURE_FIND_DEPTH  or  ~FEATURE_FIND_DELETE
C1012:~FEATURE_FIND_CONTEXT  or  FIND
C1013:~FEATURE_FIND_CONTEXT  or  SELINUX
C1014:HALT  or  ~FEATURE_CALL_TELINIT
C1015:~INIT  or  ~FEATURE_CALL_TELINIT
C1016:USE_BB_PWD_GRP  or  ~USE_BB_SHADOW
C1017:FEATURE_SHADOWPASSWDS  or  ~USE_BB_SHADOW
C1018:ADDUSER  or  ~FEATURE_ADDUSER_LONG_OPTIONS
C1019:LONG_OPTS  or  ~FEATURE_ADDUSER_LONG_OPTIONS
C1020:ADDGROUP  or  ~FEATURE_ADDGROUP_LONG_OPTIONS
C1021:LONG_OPTS  or  ~FEATURE_ADDGROUP_LONG_OPTIONS
C1022:~INSMOD  or  PLATFORM_LINUX
C1023:~INSMOD  or  ~MODPROBE_SMALL
C1024:~RMMOD  or  PLATFORM_LINUX
C1025:~RMMOD  or  ~MODPROBE_SMALL
C1026:~LSMOD  or  PLATFORM_LINUX
C1027:~LSMOD  or  ~MODPROBE_SMALL
C1028:~MODPROBE  or  PLATFORM_LINUX
C1029:~MODPROBE  or  ~MODPROBE_SMALL
C1030:~DEPMOD  or  PLATFORM_LINUX
C1031:~DEPMOD  or  ~MODPROBE_SMALL
C1032:~FEATURE_2_4_MODULES  or  INSMOD  or  RMMOD  or  LSMOD
C1033:~FEATURE_2_4_MODULES  or  PLATFORM_LINUX
C1034:~FEATURE_INSMOD_TRY_MMAP  or  INSMOD  or  MODPROBE_SMALL
C1035:~FEATURE_INSMOD_TRY_MMAP  or  PLATFORM_LINUX
C1036:~FEATURE_INSMOD_VERSION_CHECKING  or  INSMOD  or  MODPROBE
C1037:~FEATURE_INSMOD_VERSION_CHECKING  or  PLATFORM_LINUX
C1038:~FEATURE_INSMOD_VERSION_CHECKING  or  FEATURE_2_4_MODULES
C1039:~FEATURE_INSMOD_KSYMOOPS_SYMBOLS  or  INSMOD  or  MODPROBE
C1040:~FEATURE_INSMOD_KSYMOOPS_SYMBOLS  or  PLATFORM_LINUX
C1041:~FEATURE_INSMOD_KSYMOOPS_SYMBOLS  or  FEATURE_2_4_MODULES
C1042:~FEATURE_INSMOD_LOADINKMEM  or  INSMOD  or  MODPROBE
C1043:~FEATURE_INSMOD_LOADINKMEM  or  PLATFORM_LINUX
C1044:~FEATURE_INSMOD_LOADINKMEM  or  FEATURE_2_4_MODULES
C1045:~FEATURE_INSMOD_LOAD_MAP  or  PLATFORM_LINUX
C1046:~FEATURE_INSMOD_LOAD_MAP  or  FEATURE_2_4_MODULES
C1047:~FEATURE_INSMOD_LOAD_MAP  or  INSMOD
C1048:LSMOD  or  FEATURE_2_4_MODULES  or  ~FEATURE_CHECK_TAINTED_MODULE
C1049:PLATFORM_LINUX  or  ~FEATURE_CHECK_TAINTED_MODULE
C1050:~MODPROBE_SMALL  or  ~FEATURE_CHECK_TAINTED_MODULE
C1051:DEPMOD  or  MODPROBE  or  ~FEATURE_MODUTILS_ALIAS
C1052:PLATFORM_LINUX  or  ~FEATURE_MODUTILS_ALIAS
C1053:DEPMOD  or  MODPROBE  or  ~FEATURE_MODUTILS_SYMBOLS
C1054:PLATFORM_LINUX  or  ~FEATURE_MODUTILS_SYMBOLS
C1055:FDISK  or  ~FDISK_SUPPORT_LARGE_DISKS  or  LFS
C1056:FDISK  or  FDISK_SUPPORT_LARGE_DISKS  or  ~LFS
C1057:FSCK_MINIX  or  MKFS_MINIX  or  ~FEATURE_MINIX2
C1058:HWCLOCK  or  ~FEATURE_HWCLOCK_LONG_OPTIONS
C1059:LONG_OPTS  or  ~FEATURE_HWCLOCK_LONG_OPTIONS
C1060:MOUNT  or  FEATURE_MOUNT_FAKE  or  ~FEATURE_MTAB_SUPPORT  or  ~UMOUNT
C1061:MOUNT  or  ~FEATURE_MOUNT_FAKE  or  UMOUNT
C1062:MOUNT  or  ~FEATURE_MOUNT_FAKE  or  FEATURE_MTAB_SUPPORT
C1063:MOUNT  or  UMOUNT  or  ~FEATURE_MOUNT_LOOP
C1064:MOUNT  or  UMOUNT  or  ~FEATURE_MTAB_SUPPORT
C1065:VOLUMEID  or  ~FEATURE_MOUNT_LABEL  or  ~MOUNT
C1066:VOLUMEID  or  ~FINDFS  or  ~PLATFORM_LINUX
C1067:VOLUMEID  or  ~BLKID  or  ~PLATFORM_LINUX
C1068:~VOLUMEID  or  FEATURE_MOUNT_LABEL  or  FINDFS  or  BLKID
C1069:~VOLUMEID  or  FEATURE_MOUNT_LABEL  or  PLATFORM_LINUX
C1070:~VOLUMEID  or  MOUNT  or  FINDFS  or  BLKID
C1071:~VOLUMEID  or  MOUNT  or  PLATFORM_LINUX
C1072:VOLUMEID  or  ~FEATURE_VOLUMEID_EXT
C1073:VOLUMEID  or  ~FEATURE_VOLUMEID_BTRFS
C1074:VOLUMEID  or  ~FEATURE_VOLUMEID_REISERFS
C1075:VOLUMEID  or  ~FEATURE_VOLUMEID_FAT
C1076:VOLUMEID  or  ~FEATURE_VOLUMEID_HFS
C1077:VOLUMEID  or  ~FEATURE_VOLUMEID_JFS
C1078:VOLUMEID  or  ~FEATURE_VOLUMEID_XFS
C1079:VOLUMEID  or  ~FEATURE_VOLUMEID_NTFS
C1080:VOLUMEID  or  ~FEATURE_VOLUMEID_ISO9660
C1081:VOLUMEID  or  ~FEATURE_VOLUMEID_UDF
C1082:VOLUMEID  or  ~FEATURE_VOLUMEID_LUKS
C1083:VOLUMEID  or  ~FEATURE_VOLUMEID_LINUXSWAP
C1084:VOLUMEID  or  ~FEATURE_VOLUMEID_CRAMFS
C1085:VOLUMEID  or  ~FEATURE_VOLUMEID_ROMFS
C1086:VOLUMEID  or  ~FEATURE_VOLUMEID_SYSV
C1087:VOLUMEID  or  ~FEATURE_VOLUMEID_OCFS2
C1088:VOLUMEID  or  ~FEATURE_VOLUMEID_LINUXRAID
C1089:FEATURE_WTMP  or  ~LAST
C1090:LFS  or  ~READAHEAD
C1091:PLATFORM_LINUX  or  ~READAHEAD
C1092:FEATURE_IPV6  or  ~FEATURE_PREFER_IPV4_ADDRESS
C1093:FTPGET  or  FTPPUT  or  ~FEATURE_FTPGETPUT_LONG_OPTIONS
C1094:LONG_OPTS  or  ~FEATURE_FTPGETPUT_LONG_OPTIONS
C1095:~FEATURE_IFUPDOWN_IFCONFIG_BUILTIN  or  IFUPDOWN
C1096:~FEATURE_IFUPDOWN_IFCONFIG_BUILTIN  or  ~FEATURE_IFUPDOWN_IP
C1097:IFUPDOWN  or  ~FEATURE_IFUPDOWN_IPV6
C1098:FEATURE_IPV6  or  ~FEATURE_IFUPDOWN_IPV6
C1099:~FEATURE_IP_SHORT_FORMS  or  ~FEATURE_IP_ADDRESS  or  IPADDR
C1100:~IPADDR  or  FEATURE_IP_SHORT_FORMS
C1101:~IPADDR  or  FEATURE_IP_ADDRESS
C1102:~FEATURE_IP_SHORT_FORMS  or  ~FEATURE_IP_LINK  or  IPLINK
C1103:~IPLINK  or  FEATURE_IP_SHORT_FORMS
C1104:~IPLINK  or  FEATURE_IP_LINK
C1105:~FEATURE_IP_SHORT_FORMS  or  ~FEATURE_IP_ROUTE  or  IPROUTE
C1106:~IPROUTE  or  FEATURE_IP_SHORT_FORMS
C1107:~IPROUTE  or  FEATURE_IP_ROUTE
C1108:~FEATURE_IP_SHORT_FORMS  or  ~FEATURE_IP_TUNNEL  or  IPTUNNEL
C1109:~IPTUNNEL  or  FEATURE_IP_SHORT_FORMS
C1110:~IPTUNNEL  or  FEATURE_IP_TUNNEL
C1111:~FEATURE_IP_SHORT_FORMS  or  ~FEATURE_IP_RULE  or  IPRULE
C1112:~IPRULE  or  FEATURE_IP_SHORT_FORMS
C1113:~IPRULE  or  FEATURE_IP_RULE
C1114:IPCALC  or  ~FEATURE_IPCALC_LONG_OPTIONS
C1115:LONG_OPTS  or  ~FEATURE_IPCALC_LONG_OPTIONS
C1116:FEATURE_IPV6  or  ~PING6
C1117:PING  or  ~PING6
C1118:TFTP  or  ~FEATURE_TFTP_PROGRESS_BAR
C1119:FEATURE_TFTP_BLOCKSIZE  or  ~FEATURE_TFTP_PROGRESS_BAR
C1120:FEATURE_IPV6  or  ~TRACEROUTE6
C1121:TRACEROUTE  or  ~TRACEROUTE6
C1122:IFUPDOWN  or  ~IFUPDOWN_UDHCPC_CMD_OPTIONS
C1123:UDHCPC  or  ~IFUPDOWN_UDHCPC_CMD_OPTIONS
C1124:WGET  or  ~FEATURE_WGET_LONG_OPTIONS
C1125:LONG_OPTS  or  ~FEATURE_WGET_LONG_OPTIONS
C1126:PS  or  ~FEATURE_PS_TIME
C1127:DESKTOP  or  ~FEATURE_PS_TIME
C1128:PLATFORM_LINUX  or  ~FEATURE_PS_TIME
C1129:PS  or  ~FEATURE_PS_ADDITIONAL_COLUMNS
C1130:DESKTOP  or  ~FEATURE_PS_ADDITIONAL_COLUMNS
C1131:FEATURE_PS_TIME  or  ~FEATURE_PS_UNUSUAL_SYSTEMS
C1132:SELINUX  or  ~CHCON
C1133:SELINUX  or  ~FEATURE_CHCON_LONG_OPTIONS
C1134:CHCON  or  ~FEATURE_CHCON_LONG_OPTIONS
C1135:LONG_OPTS  or  ~FEATURE_CHCON_LONG_OPTIONS
C1136:SELINUX  or  ~GETENFORCE
C1137:SELINUX  or  ~GETSEBOOL
C1138:SELINUX  or  ~LOAD_POLICY
C1139:SELINUX  or  ~MATCHPATHCON
C1140:SELINUX  or  ~RESTORECON
C1141:SELINUX  or  ~RUNCON
C1142:SELINUX  or  ~FEATURE_RUNCON_LONG_OPTIONS
C1143:RUNCON  or  ~FEATURE_RUNCON_LONG_OPTIONS
C1144:LONG_OPTS  or  ~FEATURE_RUNCON_LONG_OPTIONS
C1145:SELINUX  or  ~SELINUXENABLED
C1146:SELINUX  or  ~SETENFORCE
C1147:SELINUX  or  ~SETFILES
C1148:SELINUX  or  ~SETSEBOOL
C1149:SELINUX  or  ~SESTATUS
C1150:~NOMMU  or  ~ASH
C1151:HUSH_INTERACTIVE  or  ~HUSH_SAVEHISTORY
C1152:FEATURE_EDITING_SAVEHISTORY  or  ~HUSH_SAVEHISTORY
C1153:~FEATURE_SH_IS_ASH  or  ASH
C1154:~FEATURE_SH_IS_ASH  or  ~NOMMU
C1155:HUSH  or  ~FEATURE_SH_IS_HUSH
C1156:~FEATURE_BASH_IS_ASH  or  ASH
C1157:~FEATURE_BASH_IS_ASH  or  ~NOMMU
C1158:HUSH  or  ~FEATURE_BASH_IS_HUSH
C1159:ASH  or  HUSH  or  ~SH_MATH_SUPPORT
C1160:HUSH  or  ASH  or  ~FEATURE_SH_EXTRA_QUIET
C1161:~FEATURE_SH_STANDALONE  or  HUSH  or  ASH
C1162:~FEATURE_SH_STANDALONE  or  FEATURE_PREFER_APPLETS
C1163:~FEATURE_SH_NOFORK  or  HUSH  or  ASH
C1164:~FEATURE_SH_NOFORK  or  FEATURE_PREFER_APPLETS
</constraints>
</feature_model>

    `;

const selectedCols = ref([
    'input_file',
    'input_hash',
    'svo',
    'dvo',
    'dvo_time',
    'bdd_compiler',
    'bdd_bootstrap',
    'bdd_compile',
    'bdd_timeout',
    'bdd_size',
]);

watch(
    () => selectedCols.value,
    (newValue) => {
        console.log('moin');
        /*console.log(
            headerCsvArtifactFull.filter(
                (el) => newValue.indexOf(el.key) !== -1
            )
        );*/
        headerCsvArtifact.value = headerCsvArtifactFull.filter(
            (el) => newValue.indexOf(el.key) !== -1
        );
    }
);

onMounted(async () => {
    loading.value = true;
    await getFile();
    console.log('file', file);
    loading.value = false;
    showTutorial.value = !localStorage.fileDetailTutorialCompleted;
    //await this.fetchFeatureModelOfFamily(this.family.id)
});

/*watch: {
        selectedRightFM: function (newValue) {
            console.log(newValue);
        },
    },*/
const isRightFmSelected = computed(() => {
    return selectedRightFM.value !== -1;
});
const getMyFM = computed(() => {
    return fileStore.myConfirmedFeatureModels;
});
const getStati = computed(() => {
    return {
        success: {
            percentage:
                (itemsAnalysis.filter((obj) => obj.status === 1).length /
                    itemsAnalysis.length) *
                100,
            absolute: itemsAnalysis.filter((obj) => obj.status === 1).length,
        },
        error: {
            percentage:
                (itemsAnalysis.filter((obj) => obj.status === -1).length /
                    itemsAnalysis.length) *
                100,
            absolute: itemsAnalysis.filter((obj) => obj.status === -1).length,
        },
        progress: {
            percentage:
                (itemsAnalysis.filter((obj) => obj.status === 0).length /
                    itemsAnalysis.length) *
                100,
            absolute: itemsAnalysis.filter((obj) => obj.status === 0).length,
        },
        amount: itemsAnalysis.length,
    };
});

async function getFile() {
    const id = route.params.id;
    await api
        .get(`${API_URL}files/uploaded/confirmed/${id}/`)
        .then((response) => {
            file = response.data;
        })
        .catch((error) => {
            console.log('getfile', error);
        });
}
function deleteItem() {
    this.dialogDelete = true;
}
function closeDelete() {
    this.dialogDelete = false;
}
async function deleteItemConfirm() {
    removeLoading.value = true;
    await fileStore.deleteFeatureModel(file.value.id);
    await fileStore.fetchConfirmedFeatureModels;
    removeLoading.value = false;
    await router.push('/');
}
function showArtifactDialog(item) {
    selectedArtifact.value = item;
    dialogArtifact.value = true;
}
async function compare() {
    shouldCompare.value = true;
    loadingComparableFM.value = true;
    fileStore.fetchConfirmedFeatureModels();
    loadingComparableFM.value = false;
}
/*async fetchFeatureModelOfFamily(value) {
  await api
    .get(`${API_URL}files/uploaded/confirmed/?family=${value}`)
    .then((response) => {
      this.files = response.data
      this.loadingTable = false
    })
},*/
</script>

<style>
.pointer-on-hover:hover {
    cursor: pointer;
}
</style>
