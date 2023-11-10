<template>
    <div>
        <v-card variant="elevated" rounded class="pa-2">
            <v-data-table
                :loading="props.loading"
                :headers="headers"
                :items="filteredItems"
                items-per-page="10"
                :search="search"
                sort-by.sync="sortBy"
                sort-desc="sortDesc"
            >
                <template v-slot:top>
                    <v-toolbar flat style="background-color: transparent">
                        <v-toolbar-title class="hidden-sm-and-down">
                            {{ headline }}
                        </v-toolbar-title>
                        <v-divider
                            class="mx-4 hidden-sm-and-down"
                            inset
                            vertical
                        ></v-divider>
                        <v-spacer class="hidden-sm-and-down"></v-spacer>
                      <v-autocomplete
                        class="hidden-sm-and-down"
                        v-model="selectedTags"
                        :items="props.availableTags"
                        item-value="id"
                        item-title="label"
                        label="Filter by Tags"
                        append-inner-icon="mdi-filter"
                        chips
                        multiple
                        density="comfortable"
                        variant="filled"
                        single-line
                        hide-details
                      ></v-autocomplete>
                      <v-divider
                            class="mx-4 hidden-sm-and-down"
                            inset
                            vertical
                        ></v-divider>
                        <v-spacer class="hidden-sm-and-down"></v-spacer>
                        <v-text-field
                            id="feature-model-search"
                            v-model="search"
                            append-inner-icon="mdi-magnify"
                            hide-details
                            label="Search"
                            single-line
                            variant="filled"
                            clear-icon="mdi-download"
                            density="comfortable"
                        >
                        </v-text-field>
                      <v-divider
                            class="mx-4 hidden-sm-and-down"
                            inset
                            vertical
                        ></v-divider>
                      <v-switch v-model="showPrivateFiles" v-if="private" style="align-self: center;" label="Show Private Files" class='ml-4 mt-4' color="primary"></v-switch>
                      <v-tooltip location='top'>
                        <template v-slot:activator='{ props }'>
                          <v-btn
                            id='feature-model-upload'
                            v-if='addable'
                            class='mb-2 ml-4'
                            color='primary'
                            variant='tonal'
                            size='small'
                            icon='mdi-upload'
                            v-bind='props'
                            @click='createDialog = true'
                          >
                          </v-btn>
                        </template>
                        <span>Upload feature model</span>
                      </v-tooltip>

                      <v-tooltip location='top'>
                        <template v-slot:activator='{ props }'>
                          <v-btn
                            id='feature-model-create'
                            v-if='addable'
                            class='mb-2 ml-2'
                            color='success'
                            variant='tonal'
                            size='small'
                            icon='mdi-plus'
                            v-bind='props'
                            to='/feature-model/new'
                          >
                          </v-btn>
                        </template>
                        <span>Create feature model</span>
                      </v-tooltip>

                      <v-tooltip location='top'>
                        <template v-slot:activator='{ props }'>
                          <v-btn
                            id='feature-model-ls'
                            v-if='addable'
                            :disabled='!checkLocalStorage'
                            class='mb-2 ml-2'
                            color='secondary'
                            variant='tonal'
                            size='small'
                            icon='mdi-eye'
                            v-bind='props'
                            to='/feature-model/local'
                          >
                          </v-btn>
                        </template>
                        <span>See local storage</span>
                      </v-tooltip>
                      <v-tooltip location='top'>
                        <template v-slot:activator='{ props }'>
                          <v-btn
                            id='feature-model-ls'
                            v-if='addable'
                            :disabled='!checkLocalStorage'
                            class='mb-2 ml-2'
                            color='secondary'
                            variant='tonal'
                            size='small'
                            icon='mdi-server'
                            v-bind='props'
                            @click='localUploadDialog = true'
                          >
                          </v-btn>
                        </template>
                        <span>Upload from local storage</span>
                      </v-tooltip>
                        <!--        <v-dialog v-if="editedItem.analysis" v-model="dialogAnalysis" max-width="80%">
                    <v-card>
                      <v-card-title class="text-h5">
                        Order
                      </v-card-title>
                      <v-spacer></v-spacer>
                      <div class="analysis-width" style="word-break: break-all">
                        {{ editedItem.analysis.order }}
                      </div>
                      <v-spacer></v-spacer>
                      <v-divider></v-divider>
                      <v-card-title class="text-h5">
                        Report
                      </v-card-title>
                      <v-spacer></v-spacer>
                      <div class="analysis-width" style="word-break: break-all">
                        {{ editedItem.analysis.report }}
                      </div>
                      <v-spacer></v-spacer>
                    </v-card>
                  </v-dialog>-->
                    </v-toolbar>
                </template>
                <template v-slot:item.label="{ item }">
                    <v-btn
                        variant="text"
                        color="primary"
                        append-icon="mdi-arrow-top-right-thin"
                        @click="handleClick(item.raw)"
                    >
                        {{ item.raw.label }}
                    </v-btn>
                    <!-- <v-btn small rounded color="error" class="mr-2"> <v-icon>mdi-delete</v-icon></v-btn> -->
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-btn
                        class="float-end mr-2"
                        color="success"
                        variant="tonal"
                        size="small"
                        icon="mdi-information"
                        @click="handleClick(item.raw)"
                    >
                    </v-btn>
                    <v-btn
                        class="float-end mr-2"
                        color="primary"
                        variant="tonal"
                        icon="mdi-eye"
                        size="small"
                        :to="'/feature-model/' + item.raw.id"
                    >
                    </v-btn>
                    <!-- <v-btn small rounded color="error" class="mr-2"> <v-icon>mdi-delete</v-icon></v-btn> -->
                </template>
                <template v-slot:item.id="{ item }">
                    {{ item.value }}
                </template>
              <template v-slot:item.tags="{ item }">
                <div v-if="showAllTags || item.showTags|| item.columns.tags.length <= 2">
                  <v-chip
                    v-for="(tag, index) in item.columns.tags"
                    :key="index"
                    class="ma-1"
                  >
                    {{ tag.label }}
                  </v-chip>
                   <v-icon
                     v-if="item.columns.tags.length > 2"
                class="expand-tags-button"
                @click="item.showTags = false"
            >
                mdi-chevron-up
            </v-icon>
                </div>
                <div v-else>
                  <v-chip class="ma-1">
                    {{ item.columns.tags[0].label }}
                  </v-chip>
                  <v-chip class="ma-1">
                    {{ item.columns.tags[1].label }}
                  </v-chip>
                  <span class="ma-1" @click="item.showTags=true">+ {{ item.columns.tags.length - 2 }}</span>
                   <v-icon
                class="expand-tags-button"
                @click="item.showTags = true"
            >
                mdi-chevron-down
            </v-icon>

                </div>
              </template>
              <template v-slot:item.family.label="{ item }">
                <template v-if="item.raw.family">
                  {{ item.raw.family.label }} ({{ item.raw.version }})
                </template>
                <template v-else>
                  N/A
                </template>
              </template>
                <template v-slot:item.uploaded_at="{ item }">
                    {{ new Date(item.raw.uploaded_at).toLocaleString('en-US') }}
                </template>
                <template v-slot:no-data> {{ noDataMessage }} </template>
            </v-data-table>
        </v-card>
        <v-dialog v-model="createDialog" width="auto">
            <file-create @close="createDialog = !createDialog"></file-create>
        </v-dialog>
      <v-dialog v-model="localUploadDialog" width="auto">
            <PrivateUpload @close="localUploadDialog = !localUploadDialog"></PrivateUpload>
        </v-dialog>
    </div>
</template>

<script setup>
import FileCreate from '@/components/upload_cards/FileCreate.vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFileStore } from '@/store/file';
import PrivateUpload from "@/components/upload_cards/file_create/PrivateUpload.vue";

const emit = defineEmits(['onDelete']);
const router = useRouter();
const fileStore = useFileStore();
const showAllTags = ref(false);
const sortBy = ref(null);
const sortDesc = ref(false);
const selectedTags = ref([]); // Benutzer ausgewählte Tags
const localUploadDialog = ref(false);
const showPrivateFiles = ref(false);

const props = defineProps({
    headline: {
        type: String,
        required: false,
        default: 'All Feature Models',
    },
    items: {
        type: Array,
        required: true,
    },
    availableTags: {
        type: Array,
        required: true,
    },
    loading: {
        type: Boolean,
        required: false,
        default: false,
    },
    noDataText: {
        type: String,
        required: false,
        default: 'No feature models yet',
    },
    addable: {
        type: Boolean,
        required: false,
        default: true,
    },
      private: {
        type: Boolean,
        required: false,
        default: false,
    },
});
const headers = [
    /*{
        title: 'ID',
        align: 'start',
        sortable: false,
        key: 'id',
    },*/
    { title: 'Label', key: 'label', sortable: 'label' },
    { title: 'Family (Version)', key: 'family.label',  sortable: 'family.label' },
    /*{ text: 'Description', value: 'description' },*/
    /*{ title: 'License', key: 'license.label' },*/
    { title: 'Tags', key: 'tags'  },
    { title: 'Uploaded on', key: 'uploaded_at', sortable: true },

    {
        title: '',
        align: 'center',
        key: 'actions',
        sortable: false,
    },
];
const search = ref('');
const createDialog = ref(false);
const checkLocalStorage = computed(() => {
    return !!localStorage.featureModelData;
});
const noDataMessage = computed(() => {
  // Wenn entweder die Suche oder die Tags aktiviert sind und keine passenden Elemente gefunden wurden
  if ((search.value || selectedTags.value.length > 0) && filteredItems.value.length === 0) {
    return "No Feature Model matches the search criteria.";
  } else {
    // Wenn weder Suche noch Tags aktiviert sind oder passende Elemente gefunden wurden
    return props.noDataText;
  }
});
const filteredItems = computed(() => {
  // Wenn die Suche leer ist, zeige alle Elemente
  if(showPrivateFiles.value){
    return fileStore.myPrivateFeatureModels;
  }
  if (!search.value && selectedTags.value.length === 0) {
    return props.items;
  }
  // Filter für Tags
  let tagMatches = [];
  if (selectedTags.value.length > 0) {
    tagMatches = props.items.filter(item => {
      const itemTagIds = item.tags.map(tag => tag.id);
      return selectedTags.value.every(tagId => itemTagIds.includes(tagId));
    });
  } else {
    tagMatches = props.items;
  }

  // Andernfalls filtere die Elemente basierend auf der Suche und priorisiere direkte Übereinstimmungen
  const searchLowerCase = search.value.toLowerCase();
  const directMatches = [];
  const otherMatches = [];

  tagMatches.forEach((item) => {
    const itemLabel = item.label.toLowerCase();

    if (itemLabel === searchLowerCase) {
      directMatches.unshift(item); // Priorisiere direkte Übereinstimmungen
    } else if (itemLabel.includes(searchLowerCase)) {
      otherMatches.push(item);
    }
  });

  // Füge direkte Übereinstimmungen zuerst hinzu, gefolgt von anderen Übereinstimmungen
  return [...directMatches, ...otherMatches];
});
function handleClick(value) {
    console.log(value);
    router.push({
        name: 'FileDetail',
        params: { id: value.id, slug: value.slug },
    });
}
</script>



<style>
.highlighted {
    background-color: green;
    height: 100%;
    width: 3px;
    display: inline-block;
}
.expand-tags-button {
    cursor: pointer;
    margin-left: 4px;
    font-size: 18px;
    line-height: 1;
    color: #000000;
    background-color: #ccc; /* Grauer Hintergrund */
    border-radius: 50%; /* Runde Form */
    padding: 6px; /* Innenabstand */
}
</style>
