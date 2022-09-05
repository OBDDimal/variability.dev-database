<template>
	<footer class="mt-8">
		<v-divider></v-divider>
		<div
			class="d-flex align-center mainView"
			:class="
				$vuetify.breakpoint.xs
					? 'justify-center'
					: 'justify-space-between'
			"
			style="height: 60px"
		>
			<span v-if="!$vuetify.breakpoint.xs">
				© ddueruem web, Ulm University
			</span>
			<span v-if="!$vuetify.breakpoint.smAndDown">
				Made with &#10084; in Institutspool</span
			>
			<v-btn
				text
				to="/dsgvo"
				color="primary"
				small
				:class="$vuetify.breakpoint.smAndDown ? 'flex-column mt-1' : ''"
			>
				<v-icon left> mdi-scale-balance</v-icon>
				Imprint & Privacy
			</v-btn>
		</div>
	</footer>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
	name: 'Footer',

	components: {},

	props: {},

	data: () => ({}),

	computed: {},

	methods: {},
})
</script>
