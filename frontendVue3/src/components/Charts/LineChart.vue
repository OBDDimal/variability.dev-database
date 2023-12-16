<template>
  <Line :data="props.chartdata" :options="options" ref="myChart"/>
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
import {ref, onMounted} from "vue";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)
const props = defineProps({
  chartdata: {
    type: Object,
    required: false,
  },
});


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
