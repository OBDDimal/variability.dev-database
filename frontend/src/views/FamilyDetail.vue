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
		<v-row justify="space-between" ref="barview">
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
          <bar-chart
              v-else
              chartId="featureChart"
              :data="numberOfFeaturesData"
              @hovered-element="onElementHover"
          ></bar-chart>
        </div>
        <v-expansion-panels v-else>
          <v-expansion-panel>
            <v-expansion-panel-header>Number of Features</v-expansion-panel-header>
            <v-expansion-panel-content>
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
              <bar-chart
                  v-else
                  chartId="featureChart"
                  :data="numberOfFeaturesData"
                  @hovered-element="onElementHover"
              ></bar-chart>
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
				<bar-chart
					v-else
					chartId="constraintChart"
					:data="numberOfConstraintsData"
					@hovered-element="onElementHover"
				></bar-chart>
        </div>
        <v-expansion-panels v-else>
          <v-expansion-panel>
            <v-expansion-panel-header>Number of Constraints</v-expansion-panel-header>
            <v-expansion-panel-content>
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
              <bar-chart
                  v-else
                  chartId="featureChart"
                  :data="numberOfConstraintsData"
                  @hovered-element="onElementHover"
              ></bar-chart>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
			</v-col>
			<v-col cols="12" sm="6" md="3">
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
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
			</v-col>
			<v-col cols="12" sm="6" md="3">
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
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
			</v-col>
		</v-row>
		<div class="mt-5">
			<feature-model-table
				:loading="loadingTable"
				:items="files"
				:no-data-text="`No feature models in ${family.label} yet`"
				:addable="false"
				headline="Feature Models of Family"
			/>
		</div>
	</div>
</template>

<script>
import Vue from 'vue'
import api from '@/services/api.service'
import FeatureModelTable from '@/components/FeatureModelTable'
import BarChart from '@/components/Charts/BarChart'

const API_URL = process.env.VUE_APP_DOMAIN

export default Vue.extend({
	name: 'FamilyDetail',

	components: {
		FeatureModelTable,
		BarChart,
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
	}),

	async mounted() {
		console.log(this.family)
		await this.getFamily()
		console.log(this.family)
		await this.fetchFeatureModelOfFamily(this.family.id)
	},

	computed: {},

	methods: {
		async getFamily() {
			const id = this.$route.params.id
			await api
				.get(`${API_URL}families/${id}/`)
				.then((response) => {
					this.family = response.data
				})
				.catch((error) => {
					console.log(error)
				})
		},
		async fetchFeatureModelOfFamily(value) {
			await api
				.get(`${API_URL}files/uploaded/confirmed/?family=${value}`)
				.then(async (response) => {
					this.files = response.data.map((elem) => ({
						...elem,
						active: false,
					}))
					const labels = response.data.map((elem) => elem.version)
					this.numberOfFeaturesData.labels = labels
					this.numberOfConstraintsData.labels = labels
					let data = []
					let dataConstraints = []
					for (let i = 0; i < response.data.length; i++) {
						const elem = response.data[i]
						const res = await this.getNumbersFromFile(
							elem.local_file
						)
						data.push(res.amountFeatures)
						dataConstraints.push(res.amountConstraints)
					}
					this.numberOfFeaturesData.datasets = [
						{
							label: 'Number of Features',
							backgroundColor: 'green',
							data,
						},
					]

					this.numberOfConstraintsData.datasets = [
						{
							label: 'Number of Constraints',
							backgroundColor: 'blue',
							data: dataConstraints,
						},
					]
					console.log('feat')
					console.log(this.numberOfFeaturesData)
					console.log('constr')
					console.log(this.numberOfConstraintsData)
					this.loadingTable = false
				})
		},
		async getNumbersFromFile(path) {
			return await api
				.get(`${API_URL.slice(0, -1)}${path}`)
				.then((response) => {
					const parser = new DOMParser()
					const xmlDocument = parser.parseFromString(
						response.data,
						'text/xml'
					)
					let result = {
						amountFeatures:
							xmlDocument.getElementsByTagName('feature').length,
						amountConstraints:
							xmlDocument.getElementsByTagName('rule').length,
					}
					return result
				})
		},
		onElementHover(elem) {
			if (elem !== undefined) {
				this.files.find((file) => file.version === elem).active = true
			} else {
				this.files.forEach((file) => (file.active = false))
			}
		},
	},
})
</script>
