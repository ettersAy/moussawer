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
.app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.main-content {
    flex: 1;
    padding: 0;
}

.app-footer {
    background: #1a1a1a;
    color: rgba(255, 255, 255, 0.8);
    padding: 3rem 2rem;
    margin-top: 4rem;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
}

.footer-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.footer-icon {
    font-size: 1.5rem;
}

.footer-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
}

.footer-tagline {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 1rem;
}

.footer-copyright {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 1.5rem;
}

.footer-links {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
}

.footer-link {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.2s ease;
}

.footer-link:hover {
    color: white;
}

/* Responsive */
@media (max-width: 768px) {
    .app-footer {
        padding: 2rem 1rem;
    }
    
    .footer-links {
        gap: 1.5rem;
    }
}
</style>
