<template>
	<vue-scroll-snap>
		<fullscreen></fullscreen>

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
					:transition="
						$vuetify.breakpoint.smAndDown
							? 'slide-y-transition'
							: 'slide-x-reverse-transition'
					"
					:centered="$vuetify.breakpoint.smAndDown"
					:right="!$vuetify.breakpoint.smAndDown"
					:timeout="$store.state.snackbar.timeout"
					:top="true"
					absolute
					:min-height="$vuetify.breakpoint.smAndDown ? '0' : ''"
					:min-width="$vuetify.breakpoint.smAndDown ? '0' : ''"
					:rounded="$vuetify.breakpoint.smAndDown ? 'pill' : false"
					elevation="8"
					style="z-index: 99"
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
				<!--				<div
					v-else
					style="position: absolute; width: 100%; top: 10px"
					class="justify-center d-flex"
				>
					<v-chip
						v-if="!$vuetify.breakpoint.mdAndUp"
						v-model="$store.state.snackbar.show"
						:color="$store.state.snackbar.variant"
						:timeout="$store.state.snackbar.timeout"
						style="width: max-content"
						elevation="8"
						close
						@click:close="
							$store.commit('updateSnackbar', {
								show: false,
							})
						"
					>
						{{ $store.state.snackbar.message }}
					</v-chip>
				</div>-->
			</v-main>
			<Footer v-if="$route.name !== 'FeatureModel'"></Footer>
		</v-app>
	</vue-scroll-snap>
</template>

<script>
import Vue from 'vue'
import Footer from '@/components/Footer'
import Navigation from './components/Navigation.vue'
import VueScrollSnap from 'vue-scroll-snap'

export default Vue.extend({
	name: 'App',

	components: {
		Navigation,
		Footer,
		VueScrollSnap,
	},

	data: () => ({}),

	mounted() {
		window.addEventListener('online', () => this.updateOnlineStatus(true))
		window.addEventListener('offline', () => this.updateOnlineStatus(false))
	},

	methods: {
		updateOnlineStatus(isOnline) {
			this.$store.commit('setOnlineState', isOnline)
		},
	},
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
.scroll-snap-container {
	height: 100%;
	width: 100%;
}
</style>
