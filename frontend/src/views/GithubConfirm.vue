<template>
	<div></div>
</template>

<script>
import Vue from 'vue'
import api from '../services/api.service'

const API_URL = process.env.VUE_APP_DOMAIN

export default Vue.extend({
	name: 'GithubConfirm',

	components: {},

	props: {},

	data: () => ({
		code: '',
		state: '',
	}),

	computed: {},

	methods: {
		confirm() {
			api.post(`${API_URL}auth/github/login/`, {
				code: this.code,
				state: this.state,
			})
				.then((response) => {
					console.log(response.data)
					localStorage.setItem(
						'access_github',
						JSON.stringify(response.data.key)
					)
					localStorage.setItem('user', JSON.stringify('lu'))
					this.$store.dispatch('login')
					/*this.$store.commit('updateSnackbar', {
						message: 'Register successful!',
						variant: 'success',
						timeout: 5000,
						show: true,
					})*/
					this.$router.push('/')
				})
				.catch((error) => {
					console.log(error)
					/*console.log('Unsuccess3')
					this.$store.commit('updateSnackbar', {
						message: 'Your code is not valid',
						variant: 'error',
						timeout: 5000,
						show: true,
					})
					window.location.replace('/')*/
				})
		},
	},

	mounted() {
		this.code = this.$route.query.code
		this.state = this.$route.query.state
		this.confirm()
	},
})
</script>
