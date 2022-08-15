<template>
	<div class="mainView">
		<h3 class="text-h3 mb-2 mt-8">Family: {{ family.label }}</h3>
		<h5 class="text-h5 mb-4">Details and more information</h5>
		<v-row justify="space-between">
			<v-col cols="12" sm="6" md="3">
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
			</v-col>
			<v-col cols="12" sm="6" md="3">
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
			</v-col>
			<v-col cols="12" sm="6" md="3">
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
			</v-col>
			<v-col cols="12" sm="6" md="3">
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

const API_URL = process.env.VUE_APP_DOMAIN

export default Vue.extend({
	name: 'FamilyDetail',

	components: {
		FeatureModelTable,
	},

	props: {},

	data: () => ({
		family: {},
		files: [],
		loadingTable: true,
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
				.then((response) => {
					this.files = response.data
					this.loadingTable = false
				})
		},
	},
})
</script>
