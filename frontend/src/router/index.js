import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Profile from '../views/Profile.vue'
import Files from '../views/Files.vue'
import Tags from '../views/Tags.vue'
import Families from '../views/Families.vue'
import DSGVO from '../views/DSGVO.vue'
import Register from '../views/Register.vue'
import FamilyDetail from "@/views/FamilyDetail";
import Login from '../views/Login.vue'
import FileCreate from '../views/FileCreate.vue'
import RegisterConfirmation from '../views/RegisterConfirmation.vue'
import FileCreateConfirmation from "@/views/FileCreateConfirmation";
import FeatureModel from '../views/FeatureModel.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'HomeView',
        component: HomeView,
    },
    {
        path: '/profile',
        name: 'Profile',
        component: Profile
    },
    {
        path: '/files',
        name: 'Files',
        component: Files
    },
    {
        path: '/tags',
        name: 'Tags',
        component: Tags
    },
    {
        path: '/families',
        name: 'Families',
        component: Families
    },
    {
        path: '/dsgvo',
        name: 'DSGVO',
        component: DSGVO
    },
    {
        path: '/about',
        name: 'About',
        component: () => import('../views/About.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/register/:confirmationCode',
        name: 'RegisterConfirmation',
        component: RegisterConfirmation
    },
    {
        path: '/files/uploaded/unconfirmed/confirm/:confirmationCode',
        name: 'FileCreateConfirmation',
        component: FileCreateConfirmation
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/upload',
        name: 'FileCreate',
        component: FileCreate
    },
    {
        path: '/feature-model',
        name: 'FeatureModel',
        component: FeatureModel
    },
    {
        path: '/families/:id/:slug',
        name: 'FamilyDetail',
        component: FamilyDetail
    },
]

const router = new VueRouter({
    mode: "history",
    routes
})

export default router
