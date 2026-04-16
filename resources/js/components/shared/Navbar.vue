<template>
    <nav class="main-nav">
        <div class="nav-container">
            <div class="nav-brand">
                <router-link to="/" class="brand-link">
                    <span class="brand-icon">📷</span>
                    <span class="brand-text">Moussawer</span>
                </router-link>
            </div>
            
            <div class="nav-links">
                <router-link to="/" class="nav-item" active-class="active">Home</router-link>
                <router-link to="/contact" class="nav-item" active-class="active">Contact</router-link>
            </div>
            
            <div class="nav-auth">
                <router-link to="/login" class="auth-link login-link">Login</router-link>
                <router-link to="/register" class="auth-link register-link">Register</router-link>
            </div>
        </div>
    </nav>
</template>

<style scoped>
/* Navbar specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
