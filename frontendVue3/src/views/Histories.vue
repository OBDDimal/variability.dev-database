<template>
    <div class="mainView">
        <h3 class="text-h3 mb-2 mt-8">Histories</h3>
        <h5 class="text-h5 mb-4">
            Here you can add new feature model histories
        </h5>
        <v-card variant="elevated" rounded class="pa-2">
            <v-data-table
                :headers="headers"
                :items="families"
                :loading="loading"
                :search="search"
            >
                <template v-slot:top>
                    <v-toolbar flat style="background-color: transparent">
                        <v-toolbar-title class="hidden-sm-and-down">
                            Histories
                        </v-toolbar-title>
                        <v-divider
                            class="mx-4 hidden-sm-and-down"
                            inset
                            vertical
                        ></v-divider>
                        <v-spacer class="hidden-sm-and-down"></v-spacer>
                        <v-text-field
                            v-model="search"
                            append-inner-icon="mdi-magnify"
                            hide-details
                            label="Search"
                            single-line
                            variant="filled"
                            clear-icon="mdi-download"
                            density="comfortable"
                        ></v-text-field>
                        <v-dialog v-model="dialog" max-width="500px">
                            <template v-slot:activator="{ props }">
                                <v-btn
                                    class="ml-4"
                                    color="primary"
                                    variant="tonal"
                                    rounded="pill"
                                    prepend-icon="mdi-plus"
                                    v-bind="props"
                                >
                                    New Family
                                </v-btn>
                            </template>
                            <v-card class="pa-2">
                                <v-card-title>
                                    <span class="text-h5">{{ formTitle }}</span>
                                </v-card-title>

                                <v-card-text>
                                    <v-container>
                                        <v-row>
                                            <v-col cols="12">
                                                <v-text-field
                                                    variant="outlined"
                                                    single-line
                                                    hide-details
                                                    density="comfortable"
                                                    v-model="labelValue"
                                                    label="Label"
                                                ></v-text-field>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-text-field
                                                    variant="outlined"
                                                    single-line
                                                    hide-details
                                                    density="comfortable"
                                                    v-model="
                                                        descriptionValue
                                                    "
                                                    label="Description"
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </v-card-text>

                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        color="blue darken-1"
                                        text
                                        @click="close"
                                    >
                                        Cancel
                                    </v-btn>
                                    <v-btn
                                        :loading="addLoading"
                                        color="blue darken-1"
                                        text
                                        @click="save"
                                    >
                                        Save
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
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
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-btn
                        :disabled="item.owner === false"
                        class="float-end mr-2"
                        color="primary"
                        size="small"
                        variant="tonal"
                        icon="mdi-pencil"
                        rounded
                        small
                        @click="editItem(item)"
                    >
                    </v-btn>
                    <!-- <v-btn small rounded color="error" class="mr-2"> <v-icon>mdi-delete</v-icon></v-btn> -->
                </template>
                <template v-slot:item.id="{ index }">
                    {{ index + 1 }}
                </template>
                <template v-slot:item.owner="{ item }">
                    <v-icon v-if="item.raw.owner" color="success">
                        mdi-check
                    </v-icon>
                    <v-icon v-else color="error"> mdi-cancel</v-icon>
                </template>
            </v-data-table>
        </v-card>
    </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import api from '@/services/api.service';
import { useFileStore } from '@/store/file';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';

const appStore = useAppStore();
const fileStore = useFileStore();
const router = useRouter();
const API_URL = import.meta.env.VITE_APP_DOMAIN;
const { families } = storeToRefs(useFileStore());

const search = '';
const dialog = ref(false);
const editedIndex = ref(-1);
const headers = [
    /*{
        title: 'ID',
        align: 'start',
        sortable: false,
        key: 'id',
    },*/
    { title: 'Label', key: 'label' },
    { title: 'Description', key: 'description' },
    { title: 'Owner', key: 'owner' },
    {
        title: '',
        align: 'center',
        key: 'actions',
        sortable: false,
    },
];
let editedItem = reactive({
    label: '',
    description: '',
    owner: false,
});
const defaultItem = {
    label: '',
    description: '',
    owner: false,
};
// Neue lokale Variablen für v-model
let labelValue = ref("");
let descriptionValue = ref("");
const loading = ref(false);
const addLoading = ref(false);

const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'Create New History' : 'Edit Family';
});

function editItem(item) {
    editedIndex.value = item.index+1;
    editedItem = Object.assign({}, item.raw);
    labelValue.value = editedItem.label;
    descriptionValue.value = editedItem.description;
    dialog.value = true;
}
watch(labelValue, (value) => {
    editedItem.label = value;
});

watch(descriptionValue, (value) => {
    editedItem.description = value;
});
watch(dialog, (value) => {
    if (!value) {
        editedIndex.value = -1;
        editedItem = defaultItem;
    }
});
function close() {
    dialog.value = false;
    editedIndex.value = -1;
    labelValue.value = '';
    descriptionValue.value='';
}

function addFamily() {
    addLoading.value = true;
    api.post(`${API_URL}families/`, editedItem)
        .then(() => {
            appStore.updateSnackbar(
                'Family added successfully!',
                'success',
                5000,
                true
            );
            fileStore.fetchFamilies();
            addLoading.value = false;
        })
        .catch((error) => {
            appStore.updateSnackbar(
                'Error: ' + error.message,
                'error',
                5000,
                true
            );
            addLoading.value = false;
        });
}

function updateFamily() {
    addLoading.value = true;
    api.put(`${API_URL}families/${editedIndex.value}/`, editedItem)
        .then(() => {
            appStore.updateSnackbar(
                'Family updated successfully!',
                'success',
                5000,
                true
            );
            fileStore.fetchFamilies();
            addLoading.value = false;
        })
        .catch((error) => {
            appStore.updateSnackbar(
                'Error: ' + error.message,
                'error',
                5000,
                true
            );
            addLoading.value = false;
        });
}

function save() {
    if (editedIndex.value > -1) {
        updateFamily();
    } else {
        addFamily();
    }
    close();
}
function handleClick(value) {
    router.push({
        name: 'HistoryDetail',
        params: { id: value.id, slug: value.slug },
    });
}
onMounted(() => {
    loading.value = true;
    fileStore.fetchFamilies();
    //families.value = fileStore.families;
    loading.value = false;
});
</script>
