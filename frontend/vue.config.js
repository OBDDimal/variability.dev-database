module.exports = {
	transpileDependencies: ['vuetify'],
	pwa: {
		themeColor: '#1976d2',
		name: 'DDueruem Web',
		display: 'fullscreen',
		workboxOptions: {
			navigateFallback: 'index.html',
		},
	},
}
