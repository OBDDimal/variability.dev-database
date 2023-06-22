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
        TODO: see FamilyDetail.vue in old Vue-frontend-folder
    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api.service';

const route = useRoute();
const API_URL = import.meta.env.VUE_APP_DOMAIN;

const family = reactive({});
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
        .get(`${API_URL}files/uploaded/confirmed/?family=${family.id}`)
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
            numberOfFeaturesData.value.labels = labels;
            numberOfConstraintsData.value.labels = labels;
            numberOfConfigurationsData.value.labels = labels;
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
            numberOfFeaturesData.value.datasets = [
                {
                    label: 'Number of Features',
                    borderColor: 'green',
                    fill: false,
                    data,
                },
            ];

            numberOfConstraintsData.value.datasets = [
                {
                    label: 'Number of Constraints',
                    borderColor: 'blue',
                    fill: false,
                    data: dataConstraints,
                },
            ];

            this.numberOfConfigurationsData.value.datasets = [
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

onMounted(async () => {
    await getFamily();
    await fetchFeatureModelOfFamily();
});
</script>
