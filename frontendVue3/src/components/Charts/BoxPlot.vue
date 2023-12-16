<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script setup>
import {onMounted, ref, watch} from "vue";
import { BoxPlotChart } from "@sgratzl/chartjs-chart-boxplot";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const chartCanvas = ref(null);
const props = defineProps({
  data: {
    type: Object,
    required: false,
  },
})
/*const randomValues = (count, min, max) => {

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
};*/
onMounted(() => {
  drawChart();
});

// Watch for changes in the 'data' prop and redraw the chart
watch(() => props.data, () => {
    if (chartCanvas.value) {
    drawChart();
  }
});
const drawChart = () => {
  const ctx = chartCanvas.value.getContext("2d");

  // Clear existing chart (if any)
  Chart.getChart(chartCanvas.value)?.destroy();

  new BoxPlotChart(ctx, {
    data: props.data,
    options: {
      responsive: true,
      legend: {
        position: "top",
      },
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: -2,
          right: 0,
          top: 0,
          bottom: 1,
        },
      },
      scales: {
        x: {
          display: true,
        },
        y: {
          display: true,
        },
      },
    },
  });
};
</script>
