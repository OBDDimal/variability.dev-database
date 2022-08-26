<template>
	<Bar
		ref="bar"
		:chart-options="chartOptions"
		:chart-data="data"
		:chart-id="chartId"
		:dataset-id-key="datasetIdKey"
		:plugins="plugins"
		:css-classes="cssClasses"
		:styles="styles"
		:width="width"
		:height="height"
	/>
</template>

<script>
import { Bar } from 'vue-chartjs/legacy'
import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	BarElement,
	CategoryScale,
	LinearScale,
} from 'chart.js'
import { getRelativePosition } from 'chart.js/helpers'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
	name: 'BarChart',
	components: { Bar },
	props: {
		chartId: {
			type: String,
			default: 'bar-chart',
		},
		datasetIdKey: {
			type: String,
			default: 'label',
		},
		width: {
			type: Number,
			default: 400,
		},
		height: {
			type: Number,
			default: 400,
		},
		cssClasses: {
			default: '',
			type: String,
		},
		styles: {
			type: Object,
			default: () => {},
		},
		plugins: {
			type: Object,
			default: () => {},
		},
		data: {
			type: Object,
			default: () => {
				return {
					labels: ['January', 'February', 'March'],
					datasets: [{ label: 'Sales', data: [40, 20, 12] }],
				}
			},
		},
		selected: {
			type: Number,
			default: -1,
		},
	},
	data() {
		return {
			hoveredElement: undefined,
			chartOptions: {
				responsive: true,
				onHover: (e, elements) => {
					if (elements && elements.length > 0) {
						const chart = this.$children[0]._data._chart
						const canvasPosition = getRelativePosition(e, chart)
						const dataX = chart.scales.x.getValueForPixel(
							canvasPosition.x
						)
						this.hoveredElement = chart.data.labels[Math.abs(dataX)]
					} else {
						this.hoveredElement = undefined
					}
					//console.log(chart.data.labels[Math.abs(dataX)])
				},
			},
		}
	},
	watch: {
		hoveredElement: function (newValue) {
			this.$emit('hovered-element', newValue)
		},
		selected: function (newValue) {
			const chart = this.$children[0]._data._chart
			chart.setActiveElements([{ datasetIndex: 0, index: newValue }])
			chart.update()
		},
	},
	mounted() {
		/*this.$refs.bar.$on('mouseleave', () => {
			console.log('hello')
		})*/
	},
}
</script>
