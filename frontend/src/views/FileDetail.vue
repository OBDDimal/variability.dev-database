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
                <div class="d-flex justify-center my-3">
                    <v-btn
                        color="primary"
                        :x-large="$vuetify.breakpoint.mdAndUp"
                        class="mr-5"
                        :to="'/feature-model/' + file.id"
                    >
                        <v-icon dark left>mdi-eye</v-icon>
                        View Model
                    </v-btn>
                    <v-btn
                        color="success"
                        :x-large="$vuetify.breakpoint.mdAndUp"
                        disabled
                    >
                        <v-icon dark left>mdi-play</v-icon>
                        Analyze Model
                    </v-btn>
                </div>

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
                <div class="mt-3">
                    <div class="float-left">
                        <v-btn
                            outlined
                            color="primary"
                            @click="
                                $router.push({
                                    productLineName: 'FamilyDetail',
                                    params: {
                                        id: file.family.id,
                                        slug: file.family.slug,
                                    },
                                })
                            "
                        >
                            See Family
                        </v-btn>
                    </div>
                    <div class="float-right">
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
