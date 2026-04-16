<template>
    <div class="app-container">
        <header>
            <Navbar />
        </header>

        <main class="main-content">
            <!-- This is where HomeView or ContactView will be injected -->
            <slot /> 
        </main>

        <footer class="app-footer">
            <div class="footer-content">
                <div class="footer-brand">
                    <span class="footer-icon">📷</span>
                    <span class="footer-text">Moussawer</span>
                </div>
                <p class="footer-tagline">Capture Your Perfect Moment</p>
                <p class="footer-copyright">© 2026 Moussawer - Professional Photography Portal</p>
                <div class="footer-links">
                    <router-link to="/" class="footer-link">Home</router-link>
                    <router-link to="/contact" class="footer-link">Contact</router-link>
                    <router-link to="/login" class="footer-link">Login</router-link>
                    <router-link to="/register" class="footer-link">Register</router-link>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup>
import Navbar from '@/components/shared/Navbar.vue';
</script>

<style scoped>
/* PublicLayout specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
