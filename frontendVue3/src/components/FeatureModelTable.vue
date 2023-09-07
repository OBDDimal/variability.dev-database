<template>
    <div>
        <v-card variant="elevated" rounded class="pa-2">
            <v-data-table
                :loading="props.loading"
                :headers="headers"
                :items="items"
                items-per-page="5"
                :search="props.search"
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
                            v-on='on'
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
                            icon='mdi-server'
                            v-bind='props'
                            v-on='on'
                            to='/feature-model/local'
                          >
                          </v-btn>
                        </template>
                        <span>Upload from local storage</span>
                      </v-tooltip>
                        <v-dialog v-model="dialogDelete" max-width="400px">
                            <v-card>
                                <v-card-title
                                    class="text-h5"
                                    style="white-space: normal;"
                                >
                                    Are you sure you want to delete this feature
                                    model?
                                </v-card-title>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        color="primary"
                                        text
                                        @click="closeDelete"
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
                        icon="mdi-play"
                        @click="handleClick(item.raw)"
                    >
                    </v-btn>
                    <v-btn
                        :disabled="item.owner === false"
                        class="float-end mr-2"
                        color="error"
                        variant="tonal"
                        icon="mdi-delete"
                        size="small"
                        @click.stop="deleteItem(item)"
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
                    <div v-if="item.columns.tags.length <= 2">
                        <v-chip
                            v-for="(tag, index) in item.columns.tags"
                            :key="index"
                            class="ma-1"
                        >
                            {{ tag.label }}
                        </v-chip>
                    </div>
                    <div v-else>
                        <v-chip class="ma-1">
                            {{ item.columns.tags[0].label }}
                        </v-chip>
                        <v-chip class="ma-1">
                            {{ item.columns.tags[1].label }}
                        </v-chip>
                        <span class="ma-1"
                            >+ {{ item.columns.tags.length - 2 }}</span
                        >
                    </div>
                </template>
                <template v-slot:item.owner="{ item }">
                    <v-icon v-if="item.raw.owner" color="success">
                        mdi-check</v-icon
                    >

                    <v-icon v-else color="error"> mdi-cancel</v-icon>
                </template>
                <template v-slot:item.family="{ item }">
                    {{ item.raw.family.label }} ({{ item.raw.version }})
                </template>
                <template v-slot:item.uploaded="{ item }">
                    {{ new Date(item.raw.uploaded_at).toLocaleString('en-US') }}
                </template>
                <template v-slot:no-data> {{ noDataText }} </template>
            </v-data-table>
        </v-card>
        <v-dialog v-model="createDialog" width="auto">
            <file-create @close="createDialog = !createDialog"></file-create>
        </v-dialog>
    </div>
</template>

<script setup>
import FileCreate from '@/components/upload_cards/FileCreate.vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFileStore } from '@/store/file';

const emit = defineEmits(['onDelete']);
const router = useRouter();
const fileStore = useFileStore();

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
});

const headers = [
    /*{
        title: 'ID',
        align: 'start',
        sortable: false,
        key: 'id',
    },*/
    { title: 'Label', key: 'label' },
    /*{ text: 'Description', value: 'description' },*/
    /*{ title: 'License', key: 'license.label' },*/
    { title: 'Tags', key: 'tags' },
    { title: 'Uploaded on', key: 'uploaded' },
    { title: 'Owner', key: 'owner' },
    { title: 'Family (Version)', key: 'family' },
    {
        title: '',
        align: 'center',
        key: 'actions',
        sortable: false,
    },
];
const search = ref('');
const removeLoading = ref(false);
const createDialog = ref(false);
const dialogDelete = ref(false);
const editedItem = ref(null);
const defaultItem = ref(undefined);
const checkLocalStorage = computed(() => {
    return !!localStorage.featureModelData;
});

async function deleteItemConfirm() {
    removeLoading.value = true;
    await fileStore.deleteFeatureModel(
    editedItem.value.id
    );
    await fileStore.fetchConfirmedFeatureModels();
    emit('onDelete');
    removeLoading.value = false;

    closeDelete();
}
function closeDelete() {
    dialogDelete.value = false;
    editedItem.value = { ...defaultItem };
}
function deleteItem(item) {
    editedItem.value = { ...item.raw };
    dialogDelete.value = true;
}
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
</style>
