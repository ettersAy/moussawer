<template>
    <div class="admin-layout">
        <aside class="sidebar">
            <h2>Admin Panel</h2>
            <ul>
                <li><router-link to="/admin">Dashboard</router-link></li>
                <li><router-link to="/admin/users">Manage Users</router-link></li>
                <li><router-link to="/">Back to Home</router-link></li>
            </ul>
        </aside>
        <div class="main-content">
            <header class="admin-header">
                <Navbar />
                <span>Admin Session</span>
            </header>
            <main>
                <slot />
            </main>
        </div>
    </div>
</template>

<script setup>
import Navbar from '@/components/navigation/Navbar.vue';
</script>

<style scoped>
.admin-layout {
    display: flex;
    min-height: 100vh;
}
.sidebar {
    width: 250px;
    background-color: #2c3e50;
    color: white;
    padding: 20px;
}
.main-content {
    flex-grow: 1;
    background-color: #f4f7f6;
}
.admin-header {
    background-color: white;
    padding: 10px 20px;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
main {
    padding: 20px;
}
</style>
