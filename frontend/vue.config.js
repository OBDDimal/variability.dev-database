module.exports = {
	transpileDependencies: ['vuetify'],
	pwa: {
		themeColor: '#1976d2',
		name: 'ddueruem Web',
		display: 'fullscreen',
		workboxOptions: {
			navigateFallback: 'index.html',
		},
	},
}
