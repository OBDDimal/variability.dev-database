// Composables
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
    },
    {
        path: '/models',
        name: 'Models',
        component: () => import('@/views/Models.vue'),
    },
    {
        path: '/histories',
        name: 'Histories',
        component: () => import('@/views/Histories.vue'),
    },
    {
        path: '/dsgvo',
        name: 'DSGVO',
        component: () => import('@/views/DSGVO.vue'),
    },
    {
        path: '/files/:id/:slug',
        name: 'FileDetail',
        component: () => import('@/views/FileDetail.vue'),
        meta: {
            title: 'File Detail',
        },
    },
    {
        path: '/feature-model/:id',
        name: 'FeatureModel',
        props: true,
        component: () => import('@/views/FeatureModel.vue'),
        meta: {
            title: 'Feature Model Viewer',
        },
    },
    {
        path: '/collaboration/:collaborationKey',
        name: 'Collaboration',
        props: true,
        component: () => import('@/views/FeatureModel.vue'),
        meta: {
            title: 'Collaboration Mode',
        },
    },
    {
        path: '/histories/:id/:slug',
        name: 'HistoryDetail',
        component: () => import('@/views/HistoryDetail.vue'),
        meta: {
            title: 'History Detail',
        },
    },
    {
        path: '/configurator/:productLineName',
        name: 'Configurator',
        props: true,
        component: () => import('@/views/FeatureModelConfiguration.vue'),
        meta: {
            title: 'Feature Model Configurator',
        },
    },
    {
        path: '/configuratorsolo/:id?',
        name: 'ConfiguratorSolo',
        props: true,
        component: () => import('@/views/FeatureModelSoloConfigurator.vue'),
        meta: {
            title: 'Feature Model Configurator Solo',
        },
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;
