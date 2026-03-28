import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/public/HomeView.vue';
import ContactView from '@/views/public/ContactView.vue';

const routes = [
    { path: '/', name: 'home', component: HomeView },
    { path: '/contact', name: 'contact', component: ContactView }
];

export default createRouter({
    history: createWebHistory(),
    routes
});