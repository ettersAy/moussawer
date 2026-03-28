import { createRouter, createWebHistory } from 'vue-router';

// Each view should be in its own directory (e.g., public/, admin/) for better organization.
const routes = [
    // --- Public Routes ---
    { 
        path: '/', 
        component: () => import('./views/public/HomeView.vue'),
        meta: { layout: 'public' }
    },
    { 
        path: '/contact', 
        component: () => import('./views/public/ContactView.vue'),
        meta: { layout: 'public' }
    },

    // --- Admin Routes ---
    { 
        path: '/admin', 
        component: () => import('./views/admin/DashboardView.vue'),
        meta: { layout: 'admin' }
    },
];

export default createRouter({
    history: createWebHistory(),
    routes,
});