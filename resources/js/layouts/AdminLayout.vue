<template>
    <div class="admin-layout">
        <nav class="navbar">
            <div class="navbar-brand">
                <router-link to="/admin/dashboard" class="brand-link">
                    Moussawer Admin
                </router-link>
            </div>
            
            <div class="navbar-content">
                <div class="nav-menu">
                    <router-link to="/admin/dashboard" class="nav-link" active-class="active">
                        Dashboard
                    </router-link>
                </div>
                
                <div class="nav-user">
                    <div class="user-menu">
                        <span class="user-name">{{ authStore.user?.name }}</span>
                        <button @click="logout" class="btn-logout">Logout</button>
                    </div>
                </div>
            </div>
        </nav>
        
        <main class="main-content">
            <slot />
        </main>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
    await authStore.logout()
    router.push({ name: 'login' })
}
</script>

<style scoped>
.admin-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #f5f5f5;
}

.navbar {
    background-color: #1a1a1a;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    position: sticky;
    top: 0;
    z-index: 100;
}

.navbar-brand {
    font-size: 20px;
    font-weight: bold;
}

.brand-link {
    color: #fff;
    text-decoration: none;
    font-weight: bold;
}

.brand-link:hover {
    color: #ffc107;
}

.navbar-content {
    display: flex;
    align-items: center;
    gap: 40px;
    flex: 1;
    margin-left: 40px;
}

.nav-menu {
    display: flex;
    gap: 20px;
}

.nav-link {
    color: #ccc;
    text-decoration: none;
    font-weight: 500;
    padding: 8px 12px;
    border-radius: 4px;
    transition: all 0.3s;
}

.nav-link:hover {
    color: #ffc107;
    background-color: rgba(255, 193, 7, 0.1);
}

.nav-link.active {
    color: #ffc107;
    background-color: rgba(255, 193, 7, 0.1);
    font-weight: bold;
}

.nav-user {
    margin-left: auto;
}

.user-menu {
    display: flex;
    align-items: center;
    gap: 15px;
}

.user-name {
    color: #ccc;
    font-weight: 500;
}

.btn-logout {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: opacity 0.3s;
}

.btn-logout:hover {
    opacity: 0.8;
}

.main-content {
    flex: 1;
    padding: 30px;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
}

@media (max-width: 768px) {
    .navbar {
        flex-direction: column;
        height: auto;
        padding: 15px;
    }

    .navbar-content {
        flex-direction: column;
        width: 100%;
        gap: 15px;
        margin-left: 0;
    }

    .nav-menu {
        flex-direction: column;
        width: 100%;
        gap: 10px;
    }

    .nav-user {
        width: 100%;
        margin-left: 0;
    }

    .user-menu {
        flex-direction: column;
        width: 100%;
    }

    .main-content {
        padding: 15px;
    }
}
</style>
