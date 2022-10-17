<template>
    <div class="mainView">
        <h3 class="text-h3 mb-2 mt-8">
            Family:
            <span v-if="loadingTable"
                ><v-progress-circular
                    color="primary"
                    indeterminate
                ></v-progress-circular
            ></span>
            <span v-else>{{ family.label }}</span>
        </h3>
        <h5 class="text-h5 mb-4">Details and more information</h5>
        <v-row justify="center" ref="barview">
            <v-col cols="12" sm="6" md="3">
                <div v-if="$vuetify.breakpoint.mdAndUp">
                    <v-sheet
                        v-if="loadingTable"
                        :color="`grey ${
                            $vuetify.theme.dark ? 'darken-2' : 'lighten-4'
                        }`"
                        class="pa-3"
                    >
                        <v-skeleton-loader
                            class="mx-auto"
                            max-width="300"
                            type="card"
                        ></v-skeleton-loader>
                    </v-sheet>
                    <line-chart
                        v-else
                        chartId="featureChart"
                        :chart-data="numberOfFeaturesData"
                        @hovered-element="onElementHover"
                    ></line-chart>
                </div>
                <v-expansion-panels v-else>
                    <v-expansion-panel>
                        <v-expansion-panel-header
                            >Number of Features</v-expansion-panel-header
                        >
                        <v-expansion-panel-content>
                            <v-sheet
                                v-if="loadingTable"
                                :color="`grey ${
                                    $vuetify.theme.dark
                                        ? 'darken-2'
                                        : 'lighten-4'
                                }`"
                                class="pa-3"
                            >
                                <v-skeleton-loader
                                    class="mx-auto"
                                    max-width="300"
                                    type="card"
                                ></v-skeleton-loader>
                            </v-sheet>
                            <line-chart
                                v-else
                                chartId="featureChart"
                                :chart-data="numberOfFeaturesData"
                                @hovered-element="onElementHover"
                            ></line-chart>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <div v-if="$vuetify.breakpoint.mdAndUp">
                    <v-sheet
                        v-if="loadingTable"
                        :color="`grey ${
                            $vuetify.theme.dark ? 'darken-2' : 'lighten-4'
                        }`"
                        class="pa-3"
                    >
                        <v-skeleton-loader
                            class="mx-auto"
                            max-width="300"
                            type="card"
                        ></v-skeleton-loader>
                    </v-sheet>
                    <line-chart
                        v-else
                        chartId="constraintChart"
                        :chart-data="numberOfConstraintsData"
                        @hovered-element="onElementHover"
                    ></line-chart>
                </div>
                <v-expansion-panels v-else>
                    <v-expansion-panel>
                        <v-expansion-panel-header
                            >Number of Constraints</v-expansion-panel-header
                        >
                        <v-expansion-panel-content>
                            <v-sheet
                                v-if="loadingTable"
                                :color="`grey ${
                                    $vuetify.theme.dark
                                        ? 'darken-2'
                                        : 'lighten-4'
                                }`"
                                class="pa-3"
                            >
                                <v-skeleton-loader
                                    class="mx-auto"
                                    max-width="300"
                                    type="card"
                                ></v-skeleton-loader>
                            </v-sheet>
                            <line-chart
                                v-else
                                chartId="featureChart"
                                :chart-data="numberOfConstraintsData"
                                @hovered-element="onElementHover"
                            ></line-chart>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <div v-if="$vuetify.breakpoint.mdAndUp">
                    <v-sheet
                        v-if="loadingTable"
                        :color="`grey ${
                            $vuetify.theme.dark ? 'darken-2' : 'lighten-4'
                        }`"
                        class="pa-3"
                    >
                        <v-skeleton-loader
                            class="mx-auto"
                            max-width="300"
                            type="card"
                        ></v-skeleton-loader>
                    </v-sheet>
                    <line-chart
                        v-else
                        chartId="configurationsChart"
                        :chart-data="numberOfConfigurationsData"
                        @hovered-element="onElementHover"
                    ></line-chart>
                </div>
                <v-expansion-panels v-else>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            Number of Configurations
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <v-sheet
                                :color="`grey ${
                                    $vuetify.theme.dark
                                        ? 'darken-2'
                                        : 'lighten-4'
                                }`"
                                class="pa-3"
                            >
                                <v-skeleton-loader
                                    class="mx-auto"
                                    max-width="300"
                                    type="card"
                                ></v-skeleton-loader>
                            </v-sheet>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
            <!--            <v-col cols="12" sm="6" md="3">
							<div v-if="$vuetify.breakpoint.mdAndUp">
								<v-sheet
									:color="`grey ${
										$vuetify.theme.dark ? 'darken-2' : 'lighten-4'
									}`"
									class="pa-3"
								>
									<v-skeleton-loader
										class="mx-auto"
										max-width="300"
										type="card"
									></v-skeleton-loader>
								</v-sheet>
							</div>
							<v-expansion-panels v-else>
								<v-expansion-panel>
									<v-expansion-panel-header>tba</v-expansion-panel-header>
									<v-expansion-panel-content>
										<v-sheet
											:color="`grey ${
												$vuetify.theme.dark
													? 'darken-2'
													: 'lighten-4'
											}`"
											class="pa-3"
										>
											<v-skeleton-loader
												class="mx-auto"
												max-width="300"
												type="card"
											></v-skeleton-loader>
										</v-sheet>
									</v-expansion-panel-content>
								</v-expansion-panel>
							</v-expansion-panels>
						</v-col>-->
        </v-row>
        <div class="mt-5">
            <feature-model-table
                :loading="loadingTable"
                :items="files"
                @onDelete="fetchFeatureModelOfFamily()"
                :no-data-text="`No feature models in ${family.label} yet`"
                :addable="false"
                headline="Feature Models of Family"
            />
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import api from '@/services/api.service';
import FeatureModelTable from '@/components/FeatureModelTable';
import LineChart from '@/components/Charts/LineChart';

const API_URL = process.env.VUE_APP_DOMAIN;

export default Vue.extend({
    name: 'FamilyDetail',

    components: {
        FeatureModelTable,
        LineChart,
    },

    props: {},

    data: () => ({
        family: {},
        files: [],
        loadingTable: true,
        numberOfFeaturesData: {
            labels: [],
            datasets: [],
        },
        numberOfConstraintsData: {
            labels: [],
            datasets: [],
        },
        numberOfConfigurationsData: {
            labels: [],
            datasets: [],
        },
    }),

    async mounted() {
        await this.getFamily();
        await this.fetchFeatureModelOfFamily();
    },

    computed: {},

    methods: {
        async getFamily() {
            const id = this.$route.params.id;
            await api
                .get(`${API_URL}families/${id}/`)
                .then((response) => {
                    this.family = response.data;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        async fetchFeatureModelOfFamily() {
            await api
                .get(
                    `${API_URL}files/uploaded/confirmed/?family=${this.family.id}`
                )
                .then(async (response) => {
                    const sorted = response.data.sort((a, b) =>
                        parseInt(a.version, 10) > parseInt(b.version, 10)
                            ? 1
                            : parseInt(b.version, 10) > parseInt(a.version, 10)
                            ? -1
                            : 0
                    );
                    this.files = sorted.map((elem) => ({
                        ...elem,
                        active: false,
                    }));
                    const labels = sorted.map((elem) => elem.version);
                    this.numberOfFeaturesData.labels = labels;
                    this.numberOfConstraintsData.labels = labels;
                    this.numberOfConfigurationsData.labels = labels;
                    let data = [];
                    let dataConstraints = [];
                    let dataConfigurations = [];
                    for (let i = 0; i < sorted.length; i++) {
                        const elem = sorted[i];
                        const res = await this.getNumbersFromFile(
                            elem.local_file
                        );
                        data.push(res.amountFeatures);
                        dataConstraints.push(res.amountConstraints);
                        dataConfigurations.push(res.amountConfigurations);
                    }
                    this.numberOfFeaturesData.datasets = [
                        {
                            label: 'Number of Features',
                            borderColor: 'green',
                            fill: false,
                            data,
                        },
                    ];

                    this.numberOfConstraintsData.datasets = [
                        {
                            label: 'Number of Constraints',
                            borderColor: 'blue',
                            fill: false,
                            data: dataConstraints,
                        },
                    ];

                    this.numberOfConfigurationsData.datasets = [
                        {
                            label: 'Number of Configurations',
                            borderColor: 'red',
                            fill: false,
                            data: dataConfigurations,
                        },
                    ];
                    console.log('conf');
                    console.log(this.numberOfConfigurationsData);
                    this.loadingTable = false;
                });
        },
        async getNumbersFromFile(path) {
            return await api
                .get(`${API_URL.slice(0, -1)}${path}`)
                .then((response) => {
                    const parser = new DOMParser();
                    const xmlDocument = parser.parseFromString(
                        response.data,
                        'text/xml'
                    );
                    let result = {
                        amountFeatures:
                            xmlDocument.getElementsByTagName('feature').length,
                        amountConstraints:
                            xmlDocument.getElementsByTagName('rule').length,
                        amountConfigurations: Math.random(),
                    };
                    return result;
                });
        },
        onElementHover(elem) {
            if (elem !== undefined) {
                this.files.find((file) => file.version === elem).active = true;
            } else {
                this.files.forEach((file) => (file.active = false));
            }
        },
    },
});
</script>
