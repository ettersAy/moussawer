<template>
    <nav class="main-nav">
        <div class="nav-links">
            <router-link to="/" class="nav-item">Home</router-link>
            <router-link to="/contact" class="nav-item">Contact</router-link>
           <!--  <router-link to="/admin" class="nav-item admin-link">Admin</router-link> -->
        </div>
    </nav>
</template>

<style scoped>
.main-nav {
    background: #1a1a1a;
    padding: 1rem 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.nav-links {
    display: flex;
    gap: 1.5rem;
    align-items: center;
}
.nav-item {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
}
.nav-item:hover, .router-link-active {
    color: #ffffff;
}
.admin-link {
    background-color: #e63946;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    font-size: 0.9rem;
    color: white !important;
}
</style>