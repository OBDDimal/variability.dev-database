<template>
    <div class="mainView">
        <h3 class="text-h3 mb-2 mt-8">
            Family:
            <span v-if="loadingTable">
                <v-progress-circular
                    color="primary"
                    indeterminate
                ></v-progress-circular>
            </span>
            <span v-else>{{ family.label }}</span>
        </h3>
        <h5 class="text-h5 mb-4">Details and more information</h5>
        <v-row justify="center" >
           <v-col cols="12" sm="6" md="3">
                <div v-if="breakpoints.mdAndUp">
                  numberOfFeaturesData
                    <v-sheet
                        v-if="loadingTable"
                        :color="`grey ${
                            theme.global.current.value.dark ? 'darken-2' : 'lighten-4'
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
                        <v-expansion-panel-title>
                            Number of Configurations
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-sheet
                                v-if="loadingTable"
                                :color="`grey ${
                                    theme.global.current.value.dark
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
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <div v-if="breakpoints.mdAndUp">
                  Number of Constraints
                    <v-sheet
                        v-if="loadingTable"
                        :color="`grey ${
                            theme.global.current.value.dark ? 'darken-2' : 'lighten-4'
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
                        :chart-data="numberOfConstraintsData"
                        @hovered-element="onElementHover"
                    ></line-chart>
                </div>
                <v-expansion-panels v-else>
                    <v-expansion-panel>
                        <v-expansion-panel-title
                            >Number of Constraints</v-expansion-panel-title
                        >
                        <v-expansion-panel-text>
                            <v-sheet
                                v-if="loadingTable"
                                :color="`grey ${
                                    theme.global.current.value.dark
                                        ? 'darken-2'
                                        : 'lighten-4'
                                }`"
                                class="pa-3"
                            >Hallo
                                <v-skeleton-loader
                                    class="mx-auto"
                                    max-width="300"
                                    height="400"
                                    type="card"
                                ></v-skeleton-loader>
                            </v-sheet>
                            <line-chart
                                v-else
                                chartId="configurationsChart"
                                :chart-data="numberOfConstraintsData"
                                @hovered-element="onElementHover"
                            ></line-chart>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <div v-if="breakpoints.mdAndUp">
                  Number of Configurations
                    <v-sheet
                        v-if="loadingTable"
                        :color="`grey ${
                            theme.global.current.value.dark ? 'darken-2' : 'lighten-4'
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
                        chartid="constraintsChart"
                        :chart-data="numberOfConfigurationsData"
                        @hovered-element="onElementHover"
                    ></line-chart>
                </div>
                <v-expansion-panels v-else>
                    <v-expansion-panel>
                        <v-expansion-panel-title>
                            Number of Configurations
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-sheet
                                v-if="loadingTable"
                                :color="`grey ${
                                    theme.global.current.value.dark
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
                                chartId="constraintsChart"
                                :chart-data="numberOfConfigurationsData"
                                @hovered-element="onElementHover"
                            ></line-chart>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
            <!--            <v-col cols="12" sm="6" md="3">
							<div v-if="breakpoints.mdAndUp">
								<v-sheet
									:color="`grey ${
										theme.global.current.value.dark ? 'darken-2' : 'lighten-4'
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
												theme.global.current.value.dark
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
                :loading="loadingTable.value"
                :items="files"
                @onDelete="fetchFeatureModelOfFamily()"
                :no-data-text="`No feature models in ${family.label} yet`"
                :addable="false"
                headline="Feature Models of Family"
                :available-tags="tags"/>
        </div>
    </div>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue';
import {useRoute} from 'vue-router';
import api from '@/services/api.service';
import FeatureModelTable from "@/components/FeatureModelTable.vue";
import {busyBoxConfigs} from "@/assets/busyBoxAnalyzeExample";
import {useDisplay, useTheme} from "vuetify";
import {VSkeletonLoader} from 'vuetify/labs/VSkeletonLoader'
import LineChart from '@/components/Charts/LineChart.vue';
import {useFileStore} from "@/store/file";
import {storeToRefs} from "pinia";

const breakpoints = useDisplay();
const theme = useTheme();
const route = useRoute();
const API_URL = import.meta.env.VITE_APP_DOMAIN;
const fileStore = useFileStore();
const { tags } = storeToRefs(useFileStore());

const family = ref({});
const files = ref([]);
const loadingTable = ref(true);
const numberOfFeaturesData = reactive({
    labels: [],
    datasets: [],
});
const numberOfConstraintsData = reactive({
    labels: [],
    datasets: [],
});
const numberOfConfigurationsData = reactive({
    labels: [],
    datasets: [],
});
async function getFamily() {
    const id = route.params.id;
    await api
        .get(`${API_URL}families/${id}/`)
        .then((response) => {

            family.value = response.data;

        })
        .catch((error) => {
            console.log(error);
        });
}
async function fetchFeatureModelOfFamily() {
    await api
        .get(`${API_URL}files/uploaded/confirmed/?family=${family.value.id}`)
        .then(async (response) => {
            const sorted = response.data.sort((a, b) =>
                parseInt(a.version, 10) > parseInt(b.version, 10)
                    ? 1
                    : parseInt(b.version, 10) > parseInt(a.version, 10)
                    ? -1
                    : 0
            );
            files.value = sorted.map((elem) => ({
                ...elem,
                active: false,
            }));
            const labels = sorted.map((elem) => elem.version);
            numberOfFeaturesData.labels = labels;
            numberOfConstraintsData.labels = labels;
            numberOfConfigurationsData.labels = labels;
            let data = [];
            let dataConstraints = [];
            let dataConfigurations = [];
            for (let i = 0; i < sorted.length; i++) {
                const elem = sorted[i];
                const res = await getNumbersFromFile(
                    elem.local_file,
                    sorted[i].label
                );
                data.push(res.amountFeatures);
                dataConstraints.push(res.amountConstraints);
                dataConfigurations.push(res.amountConfigurations);
            }

            numberOfFeaturesData.datasets = [
                {
                    label: 'Number of Features',
                    borderColor: 'green',
                    fill: false,
                    data,
                },
            ];

            numberOfConstraintsData.datasets = [
                {
                    label: 'Number of Constraints',
                    borderColor: 'blue',
                    fill: false,
                    data: dataConstraints,
                },
            ];

            numberOfConfigurationsData.datasets = [
                {
                    label: 'Number of Configurations (log 10)',
                    borderColor: 'red',
                    fill: false,
                    data: dataConfigurations,
                },
            ];
            loadingTable.value = false;
        });
}
async function getNumbersFromFile(path, label) {
  try {
    const response = await api.get(`${API_URL.slice(0, -1)}${path}`);
    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(response.data, 'text/xml');
    return {
      amountFeatures: xmlDocument.getElementsByTagName('feature').length,
      amountConstraints: xmlDocument.getElementsByTagName('rule').length,
      //TODO: Add Correct Value
      amountConfigurations: Math.log10(
                            busyBoxConfigs.find(({ name }) => name === label)
      ),
    };
  } catch (error) {
    console.error(error);
  }
}
function onElementHover(elem) {
  if (elem !== undefined) {
    files.value.find((file) => file.version === elem).active = true;
  } else {
    files.value.forEach((file) => (file.active = false));
  }
}

onMounted(async () => {
    await getFamily();
    await fetchFeatureModelOfFamily();
    fileStore.fetchTags();
});
</script>
