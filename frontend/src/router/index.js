import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Profile from '../views/Profile.vue'
import Files from '../views/Files.vue'
import Tags from '../views/Tags.vue'
import Families from '../views/Families.vue'
import DSGVO from '../views/DSGVO.vue'
import Register from '../views/Register.vue'
import FamilyDetail from '@/views/FamilyDetail'
import FileDetail from '@/views/FileDetail'
import Login from '../views/Login.vue'
import FileCreate from '../views/FileCreate.vue'
import RegisterConfirmation from '../views/RegisterConfirmation.vue'
import FileCreateConfirmation from '@/views/FileCreateConfirmation'
import FeatureModel from '../views/FeatureModel.vue'

Vue.use(VueRouter)

const routes = [
	{
		path: '/',
		name: 'HomeView',
		component: HomeView,
		meta: {
			title: 'dduerum-web',
		},
	},
	{
		path: '/profile',
		name: 'Profile',
		component: Profile,
		meta: {
			title: 'My Profile',
		},
	},
	{
		path: '/files',
		name: 'Files',
		component: Files,
		meta: {
			title: 'All Files',
		},
	},
	{
		path: '/tags',
		name: 'Tags',
		component: Tags,
		meta: {
			title: 'All Tags',
		},
	},
	{
		path: '/families',
		name: 'Families',
		component: Families,
		meta: {
			title: 'All Families',
		},
	},
	{
		path: '/dsgvo',
		name: 'DSGVO',
		component: DSGVO,
		meta: {
			title: 'Imprint & Privacy',
		},
	},
	/*{
		path: '/about',
		name: 'About',
		component: () => import('../views/About.vue'),
		meta: {
			title: 'dduerum-web',
		},
	},*/
	{
		path: '/register',
		name: 'Register',
		component: Register,
		meta: {
			title: 'Register',
		},
	},
	{
		path: '/register/:confirmationCode',
		name: 'RegisterConfirmation',
		component: RegisterConfirmation,
		meta: {
			title: 'Please wait...',
		},
	},
	{
		path: '/files/uploaded/unconfirmed/confirm/:confirmationCode',
		name: 'FileCreateConfirmation',
		component: FileCreateConfirmation,
		meta: {
			title: 'Please wait...',
		},
	},
	{
		path: '/login',
		name: 'Login',
		component: Login,
		meta: {
			title: 'Login',
		},
	},
	{
		path: '/upload',
		name: 'FileCreate',
		component: FileCreate,
		meta: {
			title: 'Upload Feature Model',
		},
	},
	{
		path: '/feature-model/:id',
		name: 'FeatureModel',
		component: FeatureModel,
		props: true,
		meta: {
			title: 'Feature Model Viewer',
		},
	},
	{
		path: '/collaboration/:collaborationKey',
		name: 'FeatureModel',
		component: FeatureModel,
		props: true,
		meta: {
			title: 'Collaboration Mode',
		},
	},
	{
		path: '/families/:id/:slug',
		name: 'FamilyDetail',
		component: FamilyDetail,
		meta: {
			title: 'Family Detail',
		},
	},
	{
		path: '/files/:id/:slug',
		name: 'FileDetail',
		component: FileDetail,
		meta: {
			title: 'File Detail',
		},
	},
]

const router = new VueRouter({
	mode: 'history',
	routes,
})

const DEFAULT_TITLE = 'ddueruem-web'
router.afterEach((to) => {
	// Use next tick to handle router history correctly
	// see: https://github.com/vuejs/vue-router/issues/914#issuecomment-384477609
	Vue.nextTick(() => {
		document.title = to.meta.title || DEFAULT_TITLE
	})
})

export default router
