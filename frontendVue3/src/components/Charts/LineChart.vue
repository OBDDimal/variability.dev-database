<template>
  <Line :data="chartData" :options="options" />
</template>

<script setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'
import {ref} from "vue";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const labels = ref(['January', 'February', 'March', 'April', 'May', 'June', 'July'])
const datasets = ref([
  {
    label: 'Data One',
    backgroundColor: '#f87979',
    data: [40, 39, 10, 40, 39, 80, 40]
  }
])
const { chartData } = defineProps(['chartData']);
/*const chartData = ref({
  labels: labels.value,
  datasets: datasets.value
})*/

const options = ref({
  responsive: true,
})
</script>
