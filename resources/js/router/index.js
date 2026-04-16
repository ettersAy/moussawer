// resources/js/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/public/HomeView.vue';
import ContactView from '@/views/public/ContactView.vue';
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'

const routes = [
    { path: '/', name: 'home', component: HomeView },
    { path: '/contact', name: 'contact', component: ContactView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView }
];

export default createRouter({
    history: createWebHistory(),
    routes
});