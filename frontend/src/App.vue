<template>
	<v-app>
		<navigation title="ddueruem" />

		<v-main style="position: relative">
			<div>
				<router-view :key="$route.fullPath" />
			</div>
			<v-snackbar
				v-model="$store.state.snackbar.show"
				:color="$store.state.snackbar.variant"
				:multi-line="true"
				:right="true"
				:timeout="$store.state.snackbar.timeout"
				:top="true"
				absolute
				elevation="8"
			>
				{{ $store.state.snackbar.message }}
				<template v-slot:action="{ attrs }">
					<v-btn
						dark
						plain
						v-bind="attrs"
						@click="
							$store.commit('updateSnackbar', { show: false })
						"
					>
						&#10005;
					</v-btn>
				</template>
			</v-snackbar>
		</v-main>
		<Footer></Footer>
	</v-app>
</template>

<script>
import Vue from 'vue'
import Navigation from './components/Navigation.vue'
import Footer from '@/components/Footer'

export default Vue.extend({
	name: 'App',

	components: {
		Navigation,
		Footer,
	},

	data: () => ({}),

	methods: {},
})
</script>

<style>
.mainView {
	margin-left: auto;
	margin-right: auto;
	padding-left: 30px;
	padding-right: 30px;
	max-width: 90% !important;
}

@media only screen and (max-width: 400px) {
	.mainView {
		margin-left: auto;
		margin-right: auto;
		padding-left: 10px;
		padding-right: 10px;
		max-width: 100% !important;
	}
}
</style>
