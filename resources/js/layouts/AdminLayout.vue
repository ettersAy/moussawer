<template>
    <div class="admin-layout">
        <aside class="sidebar">
            <h2>Admin Panel</h2>
            <ul>
                <li><router-link to="/admin">Dashboard</router-link></li>
                <li><router-link to="/admin/users">Manage Users</router-link></li>
                <li><router-link to="/">Back to Home</router-link></li>
            </ul>
            <!-- Logout Button -->
            <div class="sidebar-footer">
                <LogoutButton />
            </div>
        </aside>
        <div class="main-content">
            <header class="admin-header">
                <Navbar />
                <span>Admin Session</span>
                <LogoutButton />
            </header>
            <main>
                <slot />
            </main>
        </div>
    </div>
</template>

<script setup>
import Navbar from '@/components/shared/Navbar.vue';
import LogoutButton from '@/components/shared/auth/LogoutButton.vue';
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

.sidebar-footer {
    margin-top: auto;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-header {
    background-color: white;
    padding: 10px 20px;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
}

main {
    padding: 20px;
}
</style>
