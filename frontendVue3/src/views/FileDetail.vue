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

            <v-list-item-title v-if="!isLabelEditing">
              {{ loading ? '...' : file.label }}
            </v-list-item-title>
            <!--
              <v-list-item-title v-else>
                  <v-text-field v-model="editedItem.label" variant="outlined"
                  density="comfortable" />

              </v-list-item-title>-->
            <v-list-item-subtitle>Label</v-list-item-subtitle>
            <!--
            <template v-slot:append>
                <v-list-item-action>

                    <v-btn
                        v-if="!isLabelEditing && file.owner"
                        icon="mdi-pencil"
                        variant="tonal"
                        color="primary"
                        size="small"
                        @click="isLabelEditing = true; editItem(file.label);"
                    >
                    </v-btn>
                  <v-btn  v-else-if="!loading" variant="tonal"
                        color="primary"
                        size="small" icon="mdi-check" @click="updateItem(); isLabelEditing=false">

                </v-btn>
                  <v-progress-circular v-else indeterminate></v-progress-circular>
                </v-list-item-action>

            </template>-->
          </v-list-item>

          <v-list-item>
            <template v-slot:prepend>
              <v-icon></v-icon>
            </template>
            <v-list-item-title v-if="!isDescriptionEditing">
              {{ loading ? '...' : file.description }}
            </v-list-item-title>
            <!--
            <v-list-item-title v-else>
                  <v-text-field v-model="editedItem.description" variant="outlined"
                  density="comfortable" />

              </v-list-item-title>-->
            <v-list-item-subtitle>
              Description
            </v-list-item-subtitle>
            <!--
            <template v-slot:append>
                <v-list-item-action>
                    <v-btn
                        v-if="!isDescriptionEditing && file.owner"
                        icon="mdi-pencil"
                        variant="tonal"
                        color="primary"
                        size="small"
                        @click="isDescriptionEditing = true; editItem(file.label);"
                    >
                    </v-btn>
                  <v-btn  v-else-if="!loading" variant="tonal"
                        color="primary"
                        size="small" icon="mdi-check" @click="updateItem(); isDescriptionEditing=false">

                </v-btn>
                  <v-progress-circular v-else indeterminate></v-progress-circular>
                </v-list-item-action>
            </template>-->
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

            <v-list-item-title v-if="!isTagsEditing && !loading" style="white-space: normal">
              <v-chip
                class="mr-2"
                v-for="(tag) in visibleTags"
                :key="tag.id"
                size="small"
              >
                {{ tag.label }}
              </v-chip>
              <v-icon v-if="file.tags.length > 5" @click="toggleTags">
                {{ isTagsExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </v-list-item-title>
            <!--
            <v-list-item-title v-else-if="isTagsEditing">
                  <v-autocomplete
              v-model="editedItem.tags"
              :items="myOwnTags"
              item-value="id"
              item-title="label"
              chips
              variant="outlined"
              density="comfortable"
              hide-details
              hint="Choose or create tags for your feature model"
              label="Tags"
              multiple
          ></v-autocomplete>

              </v-list-item-title>-->
            <v-list-item-title v-else>...</v-list-item-title>

            <v-list-item-subtitle>Tags</v-list-item-subtitle>
            <!--
            <template v-slot:append>
                <v-list-item-action>
                    <v-btn
                        v-if="!isTagsEditing && file.owner"
                        icon="mdi-pencil"
                        variant="tonal"
                        color="primary"
                        size="small"
                        @click="isTagsEditing = true; editItem(file.tags);"
                    >
                    </v-btn>
                  <v-btn  v-else-if="!loading" variant="tonal"
                        color="primary"
                        size="small" icon="mdi-check" @click="updateItem(); isTagsEditing=false">

                </v-btn>
                  <v-progress-circular v-else indeterminate></v-progress-circular>
                </v-list-item-action>
            </template>
            -->
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

            <v-list-item-title>
              {{ loading ? '...' : file.family.label }} ({{
                loading ? '...' : file.version
              }})
            </v-list-item-title>
            <v-list-item-subtitle>
              Family and version
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <div
          class="mt-3 d-flex justify-space-between align-center"

        >
          <div id="feature-model-actions">
            <div class="d-inline-block mr-2">
              <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-eye"
                :to="'/feature-model/' + route.params.id"
              >
                View Model
              </v-btn>
            </div>
            <div class="d-inline-block">
              <v-btn
                variant="tonal"
                color="primary"
                @click="router.push({
                  name: 'HistoryDetail',
                  params: {
                  id: file.family.id,
                  slug: file.family.slug,
                  },
                })"
                prepend-icon="mdi-human-male-female-child"
              >
                See Family
              </v-btn>
            </div>
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="6">
        <div id="feature-model-artifacts">
          <h5 class="text-h5 mb-4">Artifacts (tbd)</h5>
          <div class="my-3">
            <v-list rounded>
              <v-list-subheader>REPORTS</v-list-subheader>
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
                      @click.stop="showArtifactDialog(item)"
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
    <CompareFile
      :file="file"
      v-model="dialogArtifact"
      :selected-artifact="selectedArtifact"
      @close-compare-view="dialogArtifact=false"
    />
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
import TutorialMode from '@/components/TutorialMode';
import CompareFile from "@/components/CompareFile.vue";

const router = useRouter();
const route = useRoute();

const API_URL = import.meta.env.VITE_APP_DOMAIN;
const visibleTags = computed(() => {
  return isTagsExpanded.value ? file.tags : file.tags.slice(0, 5);
});
function toggleTags() {
  isTagsExpanded.value = !isTagsExpanded.value;
}

const isTagsExpanded = ref(false);
const isLabelEditing = ref(false);
const isDescriptionEditing = ref(false) ;
const isTagsEditing = ref(false);
let file = reactive({});
const loading = ref(true);
const dialogArtifact = ref(false);
const selectedArtifact = ref({});
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
//TODO: Fetch analysis for File
/*function getAnalysis(){
  api.get(`${API_URL}analyses/`).then((response)=>
  console.log(response.data)).catch((error)=>console.log(error))
}*/

const showTutorial = ref(false);





onMounted(async () => {
    loading.value = true;
    await getFile();
    loading.value = false;
    showTutorial.value = !localStorage.fileDetailTutorialCompleted;
});

/*watch: {
        selectedRightFM: function (newValue) {
            console.log(newValue);
        },
    },*/
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
        .get(`${API_URL}files/${id}/`)
        .then((response) => {
            file = response.data;
        })
        .catch((error) => {
            console.log('getfile', error);
        });
}
function showArtifactDialog(item) {
    selectedArtifact.value = item;
    dialogArtifact.value = true;
}

/*async fetchFeatureModelOfFamily(value) {
  await api
    .get(`${API_URL}files/uploaded/confirmed/?family=${value}`)
    .then((response) => {
      this.files = response.data
      this.loadingTable = false
    })
},*/

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


</script>

<style>
.pointer-on-hover:hover {
    cursor: pointer;
}
</style>
