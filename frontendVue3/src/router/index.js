// Composables
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () =>
            import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
    },
    {
        path: '/login',
        name: 'Login',
        component: () =>
            import(/* webpackChunkName: "home" */ '@/views/Login.vue'),
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () =>
            import(/* webpackChunkName: "home" */ '@/views/Profile.vue'),
    },
    {
        path: '/models',
        name: 'Models',
        component: () =>
            import(/* webpackChunkName: "home" */ '@/views/Models.vue'),
    },
    {
        path: '/histories',
        name: 'Histories',
        component: () =>
            import(/* webpackChunkName: "home" */ '@/views/Histories.vue'),
    },
    {
        path: '/dsgvo',
        name: 'DSGVO',
        component: () =>
            import(/* webpackChunkName: "home" */ '@/views/DSGVO.vue'),
    },
    {
        path: '/files/:id/:slug',
        name: 'FileDetail',
        component: () =>
            import(/* webpackChunkName: "home" */ '@/views/FileDetail.vue'),
        meta: {
            title: 'File Detail',
        },
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;
