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


/*const chartData = ref({
  labels: labels.value,
  datasets: datasets.value
})*/
const emit = defineEmits(['onHover', 'onUnHover']);
const options = ref({
  responsive: true,
  pointHoverRadius: 10,
  onHover: handleHover,
  onLeave: handleMouseLeave(),
  maintainAspectRatio: false,
})
function handleMouseLeave(event, elements){
    emit("onUnHover")
}
function handleHover(event, elements){
  if (elements.length > 0) {
    const hoveredIndex = elements[0].index;
    emit("onHover", hoveredIndex)
  }
  else {
    emit("onUnHover")
  }
}
</script>
