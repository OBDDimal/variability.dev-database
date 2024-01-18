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
    <v-container>
      <div class="p-8 bg-slate-900 min-h-screen">
        <div class="grid-stack">
          <v-container
            v-for="widget in widgets" :key="widget.id"
            :id="widget.id"
            :gs-id="widget.id"
            :gs-x="widget.x"
            :gs-y="widget.y"
            :gs-w="widget.w"
            :gs-h="widget.h"
          >
            <div :style="{ backgroundColor: '#ffffff'}"
                 class="grid-stack-item-content group relative p-4 bg-slate-800 highlight-white/5 rounded-md shadow-md flex items-center justify-center">
              <line-chart v-if="widget.type==='LineChart'" :chartdata="widget.data"
                          @on-hover="elem => onDatapointHover(elem)"
                          @onUnHover="elem => onDatapointLeave(elem)"></line-chart>
              <box-plot v-else :data="widget.data"></box-plot>
            </div>
          </v-container>
        </div>
      </div>
    </v-container>
    <v-row justify="center">
       <v-col cols="12" sm="6" md="3">
        <div v-if="mdAndUp">
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
                    <BoxPlot
                        v-else
                        :data="BoxplotData"
                    ></BoxPlot>
                </div>
                <v-expansion-panels v-else>
                    <v-expansion-panel>
                      <v-expansion-panel-title>
                        Number of Features
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
                            <BoxPlot
                              v-else
                              :data="BoxplotData"
                            ></BoxPlot>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
    </v-row>
      <v-row justify="center">
      <v-col cols="12" sm="6" md="3">
        <div v-if="mdAndUp">
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
                        :chartdata="numberOfFeaturesData"
                        @onHover="elem => onDatapointHover(elem)"
                        @onUnHover="elem => onDatapointLeave(elem)"
                    ></line-chart>
                </div>
                <v-expansion-panels v-else>
                    <v-expansion-panel>
                      <v-expansion-panel-title>
                        Number of Features
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
                              :chartdata="numberOfFeaturesData"
                              @on-hover ="elem => onDatapointHover(elem)"
                              @onUnHover="elem => onDatapointLeave(elem)"
                            ></line-chart>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <div v-if="mdAndUp">
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
                        :chartdata="numberOfConstraintsData"
                        @on-hover ="elem => onDatapointHover(elem)"
                        @onUnHover="elem => onDatapointLeave(elem)"
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
                                :chartdata="numberOfConstraintsData"
                                @on-hover ="elem => onDatapointHover(elem)"
                              @onUnHover="elem => onDatapointLeave(elem)"
                            ></line-chart>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <div v-if="mdAndUp">
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
                        :chartdata="numberOfConfigurationsData"
                        @on-hover ="elem => onDatapointHover(elem)"
                        @onUnHover="elem => onDatapointLeave(elem)"
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
                                :chartdata="numberOfConfigurationsData"
                                @on-hover ="elem => onDatapointHover(elem)"
                                @onUnHover="elem => onDatapointLeave(elem)"
                            ></line-chart>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
    </v-row>
    <div class="mt-5">
      <feature-model-table
        :loading="loadingTable.value"
        :items="files"
        @onDelete="fetchFeatureModelOfFamily()"
        :no-data-text="`No feature models in ${family.label} yet`"
        :addable="false"
        :is-selectable="true"
        headline="Feature Models of Family"
        @onHover="(id) => onElementHover(id)"
        @onMouseLeave="(id) => onMouseLeave(id)"
        @tableChange="(idList) => OnTableChange(idList)"
        :available-tags="tags"/>
    </div>
  </div>
</template>

<script setup>
import {computed, nextTick, onMounted, onUpdated, reactive, ref, watchEffect,} from 'vue';
import {useRoute} from 'vue-router';
import api from '@/services/api.service';
import FeatureModelTable from "@/components/FeatureModelTable.vue";
import {busyBoxConfigs} from "@/assets/busyBoxAnalyzeExample";
import {useDisplay, useTheme} from "vuetify";
import {VSkeletonLoader} from 'vuetify/labs/VSkeletonLoader'
import LineChart from '@/components/Charts/LineChart.vue';
import {useFileStore} from "@/store/file";
import {storeToRefs} from "pinia";
import BoxPlot from "@/components/Charts/BoxPlot.vue";

import {GridStack} from "gridstack";
import "gridstack/dist/gridstack.min.css";
import "gridstack/dist/gridstack-extra.min.css";

const breakpoints = useDisplay();
const theme = useTheme();
const route = useRoute();
const API_URL = import.meta.env.VITE_APP_DOMAIN;
const fileStore = useFileStore();
const {tags} = storeToRefs(useFileStore());

const family = ref({});
const files = ref([]);
const loadingTable = ref(true);
const labels = ref([])
const visibleFiles = ref([]);
const fullDataList = ref([]);
const fullConstraintsList = ref([]);
const fullConfigurationsList = ref([]);
const FulllabelsList = ref([]);

const { mdAndUp } = useDisplay()
const BoxplotData = computed(()=>{
  return{
    labels: [family.value.label],
    datasets: [
      {
        label: "NumberofFeatures",
        backgroundColor: "rgba(242, 244, 255, 1)",
        borderColor: "green",
        borderWidth: 2,
        outlierStyle: "circle",
        outlierBackgroundColor: "#FFE2E2",
        outlierBorderColor: "#6E1C1C",
        outlierRadius: 2,
        outlierBorderWidth: 2,
        padding: 0,
        itemRadius: 1,
        itemBackgroundColor: "#FF8C3C",
        data: [data.value]
      },
    ],
  };
})
const numberOfFeaturesData = computed(() => {
  return {
    labels: labels.value,
    datasets: [
      {
        label: 'Number of Features',
        borderColor: 'green',
        fill: false,
        data: data.value,
        pointRadius: (() => {
          return files.value.filter(file => visibleFiles.value.includes(file.id)).map(elem => elem.active ? 10 : 4)
        })()

      },
    ],
  };
});
const numberOfConstraintsData = computed(() => {
  return {
    labels: labels.value,
    datasets: [
      {
        label: 'Number of Constraints',
        borderColor: 'blue',
        fill: false,
        data: dataConstraints.value,
        pointRadius: (() => {
          return files.value.filter(file => visibleFiles.value.includes(file.id)).map(elem => elem.active ? 10 : 4)
        })()
      },
    ],
  };
});

const numberOfConfigurationsData = computed(() => {
  return {
    labels: labels.value,
    datasets: [
      {
                    label: 'Number of Configurations (log 10)',
                    borderColor: 'red',
                    fill: false,
                    data: dataConfigurations.value,
                    pointRadius: (() => {return files.value.map(elem => elem.active ? 6 : 4)})()
                },
    ],
  };
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
const data = ref([]);
const dataConstraints = ref([]);
const dataConfigurations = ref([]);

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
      FulllabelsList.value = sorted.map((elem) => ({id: elem.id, version: elem.version}));
      for (let i = 0; i < sorted.length; i++) {
        const elem = sorted[i];
        const res = await getNumbersFromFile(
          elem.local_file,
          sorted[i].label
        );
        fullDataList.value.push({id: elem.id, data: res.amountFeatures});
        fullConstraintsList.value.push({ id: elem.id, data:res.amountConstraints});
        fullConfigurationsList.value.push({id: elem.id, data:res.amountConfigurations});
      }
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
      amountConfigurations:(
        busyBoxConfigs.find(({name}) => name === label) ? Math.log10(busyBoxConfigs.find(({name}) => name === label).mc) : 10
      ),
    };
  } catch (error) {
    console.error(error);
  }
}

function onDatapointHover(elem) {
  if (elem !== undefined) {
    files.value.find((file) => file.id === visibleFiles.value[elem]).active = true;
  } else {
    files.value.forEach((file) => (file.active = false));
  }
}
function onDatapointLeave(elem) {
  if (elem !== undefined) {
    files.value[elem].active = false;
  } else {
    files.value.forEach((file) => (file.active = false));
  }
}

function onElementHover(elem) {
  if (elem !== undefined) {
    files.value.find((file) => file.id === elem).active = true;
  } else {
    files.value.forEach((file) => (file.active = false));
  }
}

function onMouseLeave(elem) {
  if (elem !== undefined) {
    files.value.find((file) => file.id === elem).active = false;
  } else {
    files.value.forEach((file) => (file.active = false));
  }
}
function OnTableChange(idList){
  visibleFiles.value = files.value
  .filter((file) => idList.includes(file.id))
  .map((file) => file.id);
  data.value = fullDataList.value.filter(file => idList.includes(file.id)).map(elem => elem.data)
  dataConstraints.value = fullConstraintsList.value.filter(file => idList.includes(file.id)).map(elem => elem.data)
  dataConfigurations.value = fullConfigurationsList.value.filter(file => idList.includes(file.id)).map(elem => elem.data)
  labels.value = FulllabelsList.value.filter(file => idList.includes(file.id)).map(elem => elem.version)
}
const grid = ref(null);
function initGridStack() {
  grid.value = GridStack.init({
    column: 4,
    cellHeight: 100,
    maxRow: 6,
    margin: 10,
    disableResize: false,
    disableDrag: false,
  });
  makeWidgets(widgets.value);
}

function makeWidgets(widgets) {
  widgets.forEach((widget) => {
    makeWidget(widget);
  });
}
function makeWidget(item) {
  const elSelector = `#${item.id}`;
  return grid.value.makeWidget(elSelector);
}
const randomValues = (count, min, max) => {

  const delta = max - min;
  return Array.from({ length: count }).map(() => Math.random() * delta + min);
};
const boxplotData = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "Dataset 1",
      backgroundColor: "rgba(242, 244, 255, 1)",
      borderColor: "rgba(108, 123, 192, 1)",
      borderWidth: 2,
      outlierStyle: "circle",
      outlierBackgroundColor: "#FFE2E2",
      outlierBorderColor: "#6E1C1C",
      outlierRadius: 2,
      outlierBorderWidth: 2,
      padding: 0,
      itemRadius: 1,
      itemBackgroundColor: "#FF8C3C",

      data: [
        [...randomValues(100, 400, 1000), 160, 140],
        [...randomValues(100, 500, 200), 50, 55, 60, 65],
        [...randomValues(100, 500, 700), 5, -5, 105],
        randomValues(100, 600, 1000),
        randomValues(40, 500, 1000),
        randomValues(100, 600, 1200),
        [...randomValues(100, 600, 1000), 50, 150],
      ],
    },
  ],
}
onMounted(async () => {
  await getFamily();
  await fetchFeatureModelOfFamily();
  fileStore.fetchTags();
  initGridStack();
});

async function addWidget(chartdata, type, title) {
  const widget = {
    w: 2,
    h: 1,
    title: title,
    id: widgets.value.length+1,
    type: type,
    data: numberOfFeaturesData
  };
  console.log(widget)
  console.log(widgets.value)
  widgetList.value.push(widget)
  console.log(widgets.value)
  await nextTick();
  makeWidget(widget);
}
function removeWidget(widget) {
  const index = widgets.value.findIndex((w) => w.id === widget.id);
  if (index === -1) {
    return;
  }
  const selector = `#${CSS.escape(widget.id)}`;
  grid.value.removeWidget(selector);
  grid.value.compact();
  widgets.value.splice(index, 1);
}
const widgetList = ref([
  {
    x: 0,
    y: 0,
    w: 2,
    h: 2,
    type: "BoxPlot",
    id: 1,
    title: "SalesData",
    data: boxplotData,
  },
  {
    x: 3,
    y: 2,
    w: 1,
    h: 2,
    type: "BoxPlot",
    id: 2,
    title: "NumberofFeatures",
    data: BoxplotData,
  },
  {
    x: 0,
    y: 2,
    w: 2,
    h: 1,
    type: "LineChart",
    id: 3,
    title: "Number of Features",
    data: numberOfFeaturesData,
  },
  {
    x: 2,
    y: 2,
    w: 1,
    h: 2,
    type: "LineChart",
    id: 4,
    title: "Number of Constraints",
    data: numberOfConstraintsData,
  },
  {
    x: 2,
    y: 0,
    w: 2,
    h: 1,
    type: "LineChart",
    id: 5,
    title: "Number of Configs",
    data: numberOfConfigurationsData,
  },
]);
const widgets = computed(()=>{
  return [...widgetList.value]
})
</script>
<style scoped>

</style>
