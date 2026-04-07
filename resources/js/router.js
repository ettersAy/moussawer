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
    // --- Auth Routes ---
    { 
        path: '/login', 
        name: 'login',
        component: () => import('./views/auth/LoginView.vue'),   // ← adjust path if needed
        meta: { layout: 'public', requiresGuest: true }   // optional but recommended
    },
    // --- Admin Routes ---
    { 
        path: '/admin', 
        component: () => import('./views/admin/DashboardView.vue'),
        meta: { layout: 'admin', requiresAuth: true }
    },
];

export default createRouter({
    history: createWebHistory(),
    routes,
});