<template>
	<v-btn color="#333" block dark @click="loginWithGithub()">
		<v-icon left>mdi-github</v-icon>
		Sign in with GitHub
	</v-btn>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
	name: 'GithubButton',

	methods: {
		async loginWithGithub() {
			const url = await this.$store.dispatch('loginWithGithubRedirect')
			window.open(url, '_self')
		},
	},
})
</script>
