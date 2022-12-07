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
            <v-col cols="12" md="6">
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
                <div class="mt-3 d-flex justify-space-between align-center">
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
                <h5 class="text-h5 mb-4">Artifacts (tbd)</h5>
                <div class="my-3">
                    <v-skeleton-loader
                        type="list-item-avatar-two-line@5"
                    ></v-skeleton-loader>
                </div>
                <div class="my-3">
                    <div
                        class="d-flex justify-center flex-column align-center my-3"
                    >
                        <span>Analyses Progress:</span>
                        <v-row class="pa-0" no-gutters style="width: 100%">
                            <v-col
                                :style="`width: ${percentageOne}%!important`"
                            >
                                <v-progress-linear
                                    height="15"
                                    value="100"
                                    color="green"
                                />
                            </v-col>
                            <v-col
                                :style="`width: ${percentageTwo}%!important`"
                            >
                                <v-progress-linear
                                    height="15"
                                    value="100"
                                    color="blue"
                                />
                            </v-col>
                            <v-col
                                :style="`width: ${percentageTwo}%!important`"
                            >
                                <v-progress-linear
                                    height="15"
                                    value="100"
                                    color="error"
                                />
                            </v-col>
                        </v-row>
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
    </div>
</template>

<script>
import Vue from 'vue';
import api from '@/services/api.service';

const API_URL = process.env.VUE_APP_DOMAIN;

export default Vue.extend({
    name: 'FileDetail',

    components: {},

    props: {},

    data: () => ({
        file: {},
        loading: true,
        dialogDelete: false,
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
                status: 1,
            },
            {
                id: 2,
                name: 'complex analysis',
                query: 'calculate purpose of life --force',
                status: 0,
            },
            {
                id: 42,
                name: 'another analysis',
                query: 'foo bar',
                status: -1,
            },
        ],
    }),

    async mounted() {
        this.loading = true;
        await this.getFile();
        this.loading = false;
        //await this.fetchFeatureModelOfFamily(this.family.id)
    },

    computed: {},

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
