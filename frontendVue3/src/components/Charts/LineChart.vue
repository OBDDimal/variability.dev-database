<template>
  <Line :data="chartData" :options="options" ref="myChart"/>
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
  Legend,
} from 'chart.js'
import {Line} from 'vue-chartjs'
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
const {chartData} = defineProps(['chartData']);

const options = ref({
  responsive: true,
  pointHoverRadius: 10,
})
</script>
