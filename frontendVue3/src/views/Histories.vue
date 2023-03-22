<template>
    <div class="mainView">
        <h3 class="text-h3 mb-2 mt-8">My Families</h3>
        <h5 class="text-h5 mb-4">Here you can add new families</h5>
        <v-data-table
            :headers="headers"
            :items="fileStore.families"
            :loading="loading"
            :search="search"
            class="elevation-1"
            @click:row="handleClick"
        >
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title class="hidden-sm-and-down"
                        >Families</v-toolbar-title
                    >
                    <v-divider
                        class="mx-4 hidden-sm-and-down"
                        inset
                        vertical
                    ></v-divider>
                    <v-spacer class="hidden-sm-and-down"></v-spacer>
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        hide-details
                        label="Search"
                        single-line
                    ></v-text-field>
                    <v-dialog v-model="dialog" max-width="500px">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                class="mb-2 ml-4"
                                color="primary"
                                dark
                                rounded
                                v-bind="attrs"
                                v-on="on"
                            >
                                <v-icon left> mdi-plus</v-icon>
                                New Family
                            </v-btn>
                        </template>
                        <v-card>
                            <v-card-title>
                                <span class="text-h5">{{ formTitle }}</span>
                            </v-card-title>

                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <v-col cols="12">
                                            <v-text-field
                                                v-model="editedItem.label"
                                                label="Label"
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field
                                                v-model="editedItem.description"
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
            <template v-slot:item.actions="{ item }">
                <v-btn
                    :disabled="item.owner === false"
                    class="mr-2"
                    color="primary"
                    rounded
                    small
                    @click="editItem(item)"
                >
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <!-- <v-btn small rounded color="error" class="mr-2"> <v-icon>mdi-delete</v-icon></v-btn> -->
            </template>
            <template v-slot:item.id="{ index }">
                {{ index + 1 }}
            </template>
            <template v-slot:item.owner="{ item }">
                <v-icon v-if="item.owner" color="success"> mdi-check</v-icon>
                <v-icon v-else color="error"> mdi-cancel</v-icon>
            </template>
        </v-data-table>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import api from '@/services/api.service';
import { useFileStore } from '@/store/file';

const fileStore = useFileStore();
const API_URL = process.env.VUE_APP_DOMAIN;

const search = '';
const dialog = false;
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
    { text: 'Owner', value: 'owner' },
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
    owner: false,
};
const defaultItem = {
    label: '',
    description: '',
    owner: false,
};
const families = [];
const loading = ref(false);
const addLoading = ref(false);

const formTitle = computed(() => {
    return this.editedIndex === -1 ? 'Create New Family' : 'Edit Family';
});

function editItem(item) {
    this.editedIndex = item.id;
    this.editedItem = Object.assign({}, item);
    this.dialog = true;
}
function close() {
    this.dialog = false;
    this.$nextTick(() => {
        this.editedIndex = -1;
    });
}

function addFamily() {
    this.addLoading = true;
    api.post(`${API_URL}families/`, this.editedItem)
        .then(() => {
            this.$store.commit('updateSnackbar', {
                message: 'Family added successfully!',
                variant: 'success',
                timeout: 5000,
                show: true,
            });
            this.$store.dispatch('fetchFamilies');
            this.addLoading = false;
        })
        .catch((error) => {
            this.$store.commit('updateSnackbar', {
                message: 'Error: ' + error.message,
                variant: 'error',
                timeout: 5000,
                show: true,
            });
            this.addLoading = false;
        });
}

function updateFamily() {
    this.addLoading = true;
    api.put(`${API_URL}families/${this.editedIndex}/`, this.editedItem)
        .then(() => {
            this.$store.commit('updateSnackbar', {
                message: 'Family updated successfully!',
                variant: 'success',
                timeout: 5000,
                show: true,
            });
            this.$store.dispatch('fetchFamilies');
            this.addLoading = false;
        })
        .catch((error) => {
            this.$store.commit('updateSnackbar', {
                message: 'Error: ' + error.message,
                variant: 'error',
                timeout: 5000,
                show: true,
            });
            this.addLoading = false;
        });
}

function save() {
    if (this.editedIndex > -1) {
        this.updateFamily();
    } else {
        this.addFamily();
    }
    this.close();
}
function handleClick(value) {
    this.$router.push({
        name: 'FamilyDetail',
        params: { id: value.id, slug: value.slug },
    });
}
onMounted(() => {
    loading.value = true;
    fileStore.fetchConfirmedFeatureModels();
    families.value = fileStore.families;
    loading.value = false;
});
</script>
