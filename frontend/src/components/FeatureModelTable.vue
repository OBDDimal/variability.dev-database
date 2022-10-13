<template>
    <div>
        <v-card rounded outlined class="pa-2">
            <v-data-table
                :loading="loading"
                :headers="headers"
                :items="items"
                :search="search"
                @click:row="handleClick"
                @mouseover="setHovered"
            >
                <template v-slot:top>
                    <v-toolbar flat style="background-color: transparent">
                        <v-toolbar-title class="hidden-sm-and-down">{{
                            headline
                        }}</v-toolbar-title>
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
                        >
                        </v-text-field>
                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    v-if="addable"
                                    class="mb-2 ml-4"
                                    color="primary"
                                    fab
                                    small
                                    :disabled="!$store.state.loggedIn"
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="createDialog = true"
                                >
                                    <v-icon> mdi-upload</v-icon>
                                </v-btn>
                            </template>
                            <span>Upload feature model</span>
                        </v-tooltip>
                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    v-if="addable"
                                    class="mb-2 ml-4"
                                    color="success"
                                    fab
                                    small
                                    v-bind="attrs"
                                    v-on="on"
                                    link
                                    to="/feature-model/new"
                                >
                                    <v-icon> mdi-plus</v-icon>
                                </v-btn>
                            </template>
                            <span>Create feature model</span>
                        </v-tooltip>
                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    v-if="addable"
                                    :disabled="!checkLocalStorage"
                                    class="mb-2 ml-4"
                                    color="secondary"
                                    fab
                                    small
                                    v-bind="attrs"
                                    v-on="on"
                                    link
                                    to="/feature-model/local"
                                >
                                    <v-icon> mdi-server</v-icon>
                                </v-btn>
                            </template>
                            <span>Upload from local storage</span>
                        </v-tooltip>
                        <v-dialog v-model="dialogDelete" max-width="400px">
                            <v-card>
                                <v-card-title
                                    class="text-h5"
                                    style="word-break: break-word"
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
                <template v-slot:item.actions="{ item }">
                    <v-btn
                        class="mr-2"
                        color="primary"
                        rounded
                        small
                        :to="'/feature-model/' + item.id"
                    >
                        <v-icon>mdi-eye</v-icon>
                    </v-btn>
                    <v-btn
                        :disabled="item.owner === false"
                        class="mr-2"
                        color="error"
                        rounded
                        small
                        @click.stop="deleteItem(item)"
                    >
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                    <v-btn class="mr-2" color="success" rounded small>
                        <v-icon>mdi-play</v-icon>
                    </v-btn>
                    <!-- <v-btn small rounded color="error" class="mr-2"> <v-icon>mdi-delete</v-icon></v-btn> -->
                </template>
                <template v-slot:item.id="{ index, item }">
                    <v-chip :color="item.active ? 'primary' : 'transparent'">{{
                        index + 1
                    }}</v-chip>
                </template>
                <template v-slot:no-data> {{ noDataText }} </template>
                <template v-slot:item.tags="{ item }">
                    <div v-if="item.tags.length <= 2">
                        <v-chip
                            v-for="(tag, index) in item.tags"
                            :key="index"
                            class="ma-1"
                        >
                            {{ tag.label }}
                        </v-chip>
                    </div>
                    <div v-else>
                        <v-chip class="ma-1">
                            {{ item.tags[0].label }}
                        </v-chip>
                        <v-chip class="ma-1">
                            {{ item.tags[1].label }}
                        </v-chip>
                        <span class="ma-1">+ {{ item.tags.length - 2 }}</span>
                    </div>
                </template>
                <template v-slot:item.owner="{ item }">
                    <v-icon v-if="item.owner" color="success">
                        mdi-check</v-icon
                    >
                    <v-icon v-else color="error"> mdi-cancel</v-icon>
                </template>
                <template v-slot:item.family="{ item }">
                    {{ item.family.label }} ({{ item.version }})
                </template>
                <template v-slot:item.uploaded="{ item }">
                    {{ new Date(item.uploaded_at).toLocaleString('en-US') }}
                </template>
            </v-data-table>
        </v-card>
        <v-dialog v-if="addable" v-model="createDialog" max-width="850px">
            <file-create @close="createDialog = !createDialog"></file-create>
        </v-dialog>
    </div>
</template>

<script>
import Vue from 'vue';
import FileCreate from '@/views/FileCreate.vue';

export default Vue.extend({
    name: 'FeatureModelTable',

    components: {
        FileCreate,
    },

    props: {
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
    },

    data: () => ({
        headers: [
            {
                text: 'ID',
                align: 'start',
                sortable: false,
                value: 'id',
            },
            { text: 'Label', value: 'label' },
            /*{ text: 'Description', value: 'description' },*/
            { text: 'License', value: 'license.label' },
            { text: 'Tags', value: 'tags' },
            { text: 'Uploaded on', value: 'uploaded' },
            { text: 'Owner', value: 'owner' },
            { text: 'Family (Version)', value: 'family' },
            {
                text: 'Actions',
                align: 'center',
                value: 'actions',
                sortable: false,
            },
        ],
        search: '',
        removeLoading: false,
        dialog: false,
        createDialog: false,
        dialogDelete: false,
        dialogAnalysis: false,
    }),

    computed: {
        checkLocalStorage() {
            return !!localStorage.featureModelData;
        },
    },

    methods: {
        async deleteItemConfirm() {
            this.removeLoading = true;
            await this.$store.dispatch(
                'deleteFeatureModel',
                this.editedItem.id
            );
            await this.$store.dispatch('fetchFiles');
            this.$emit('onDelete');
            this.removeLoading = false;

            this.closeDelete();
        },
        close() {
            this.dialog = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },
        closeDelete() {
            this.dialogDelete = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },
        deleteItem(item) {
            this.editedIndex = this.items.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialogDelete = true;
        },
        handleClick(value) {
            this.$router.push({
                name: 'FileDetail',
                params: { id: value.id, slug: value.slug },
            });
        },
        setHovered() {
            console.log('hi');
        },
        /*showAnalysis(item) {
      this.editedIndex = this.featureModels.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogAnalysis = true;
    },*/
    },
});
</script>

<style>
.highlighted {
    background-color: green;
    height: 100%;
    width: 3px;
    display: inline-block;
}
</style>
