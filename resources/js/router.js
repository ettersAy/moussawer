import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Each view should be in its own directory (e.g., public/, admin/) for better organization.
const routes = [
    // --- Public Routes ---
    {
        path: '/',
        component: () => import('./views/public/HomeView.vue'),
        meta: { layout: 'public' },
    },
    {
        path: '/contact',
        component: () => import('./views/public/ContactView.vue'),
        meta: { layout: 'public' },
    },
    // --- Auth Routes ---
    {
        path: '/login',
        name: 'login',
        component: () => import('./views/auth/LoginView.vue'),
        meta: { layout: 'public', requiresGuest: true },
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('./views/auth/RegisterView.vue'),
        meta: { layout: 'public', requiresGuest: true },
    },
    // --- Admin Routes ---
    {
        path: '/admin/dashboard',
        name: 'admin-dashboard',
        component: () => import('./views/admin/DashboardView.vue'),
        meta: { layout: 'admin', requiresAuth: true, requiredRole: 'admin' },
    },
    {
        path: '/admin/users',
        name: 'admin-users',
        component: () => import('./views/admin/UsersView.vue'),
        meta: { layout: 'admin', requiresAuth: true, requiredRole: 'admin' },
    },
    {
        path: '/admin/users/:id/portfolio',
        name: 'admin-user-portfolio',
        component: () => import('./views/admin/UserPortfolioView.vue'),
        meta: { layout: 'admin', requiresAuth: true, requiredRole: 'admin' },
    },
    // --- Photographer Routes ---
    {
        path: '/photographer/dashboard',
        name: 'photographer-dashboard',
        component: () => import('./views/photographer/DashboardView.vue'),
        meta: { layout: 'photographer', requiresAuth: true, requiredRole: 'photographer' },
    },
    {
        path: '/photographer/bookings',
        name: 'photographer-bookings',
        component: () => import('./views/photographer/BookingsView.vue'),
        meta: { layout: 'photographer', requiresAuth: true, requiredRole: 'photographer' },
    },
    {
        path: '/photographer/profile',
        name: 'photographer-profile',
        component: () => import('./views/photographer/ProfileView.vue'),
        meta: { layout: 'photographer', requiresAuth: true, requiredRole: 'photographer' },
    },
    {
        path: '/photographer/portfolio',
        name: 'photographer-portfolio',
        component: () => import('./views/photographer/PortfolioView.vue'),
        meta: { layout: 'photographer', requiresAuth: true, requiredRole: 'photographer' },
    },
    {
        path: '/photographer/services',
        name: 'photographer-services',
        component: () => import('./views/photographer/ServicesView.vue'),
        meta: { layout: 'photographer', requiresAuth: true, requiredRole: 'photographer' },
    },
    {
        path: '/photographer/availability',
        name: 'photographer-availability',
        component: () => import('./views/photographer/AvailabilityView.vue'),
        meta: { layout: 'photographer', requiresAuth: true, requiredRole: 'photographer' },
    },
    // --- Client Routes ---
    {
        path: '/client/dashboard',
        name: 'client-dashboard',
        component: () => import('./views/client/DashboardView.vue'),
        meta: { layout: 'client', requiresAuth: true, requiredRole: 'client' },
    },
    {
        path: '/client/bookings',
        name: 'client-bookings',
        component: () => import('./views/client/BookingsView.vue'),
        meta: { layout: 'client', requiresAuth: true, requiredRole: 'client' },
    },
    {
        path: '/client/profile',
        name: 'client-profile',
        component: () => import('./views/client/ProfileView.vue'),
        meta: { layout: 'client', requiresAuth: true, requiredRole: 'client' },
    },
    {
        path: '/photographers',
        name: 'photographer-discovery',
        component: () => import('./views/client/SearchDiscoveryView.vue'),
        meta: { layout: 'public' },
    },
    {
        path: '/photographers/:id/book',
        name: 'client-booking-request',
        component: () => import('./views/client/BookingRequestView.vue'),
        meta: { layout: 'client', requiresAuth: true, requiredRole: 'client' },
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Navigation guards
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // Load auth state from localStorage on first check
    if (!authStore.user && !authStore.token) {
        authStore.loadFromStorage()
    }

    const isAuthenticated = authStore.isAuthenticated()
    const userRole = authStore.user?.role

    // Guest-only routes (login, register)
    if (to.meta.requiresGuest) {
        if (isAuthenticated) {
            // Redirect authenticated users to their dashboard
            const dashboardMap = {
                admin: '/admin/dashboard',
                photographer: '/photographer/dashboard',
                client: '/client/dashboard',
            }
            return next(dashboardMap[userRole] || '/')
        }
        return next()
    }

    // Protected routes
    if (to.meta.requiresAuth) {
        if (!isAuthenticated) {
            return next({ name: 'login', query: { redirect: to.fullPath } })
        }

        // Role-based access
        if (to.meta.requiredRole && userRole !== to.meta.requiredRole) {
            // Redirect to their own dashboard instead of an unauthorized page
            const dashboardMap = {
                admin: '/admin/dashboard',
                photographer: '/photographer/dashboard',
                client: '/client/dashboard',
            }
            return next(dashboardMap[userRole] || '/')
        }
    }

    next()
})

export default router