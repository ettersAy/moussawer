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
.main-nav {
    background: #ffffff;
    padding: 1rem 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    border-bottom: 1px solid #f0f0f0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.nav-brand {
    display: flex;
    align-items: center;
}

.brand-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    color: #1a1a1a;
    font-weight: 700;
    font-size: 1.25rem;
    transition: color 0.2s ease;
}

.brand-link:hover {
    color: #2563eb;
}

.brand-icon {
    font-size: 1.5rem;
}

.brand-text {
    font-weight: 700;
}

.nav-links {
    display: flex;
    gap: 2rem;
    align-items: center;
}

.nav-item {
    color: #4b5563;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.95rem;
    padding: 0.5rem 0;
    position: relative;
    transition: color 0.2s ease;
}

.nav-item:hover {
    color: #2563eb;
}

.nav-item.active {
    color: #2563eb;
}

.nav-item.active::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    height: 2px;
    background: #2563eb;
    border-radius: 1px;
}

.nav-auth {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.auth-link {
    padding: 0.5rem 1.25rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none;
    transition: all 0.2s ease;
}

.login-link {
    color: #4b5563;
    border: 1px solid #e5e7eb;
}

.login-link:hover {
    background: #f9fafb;
    border-color: #d1d5db;
}

.register-link {
    background: #2563eb;
    color: white;
}

.register-link:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
    .main-nav {
        padding: 1rem;
    }
    
    .nav-container {
        flex-direction: column;
        gap: 1rem;
    }
    
    .nav-links {
        gap: 1.5rem;
    }
    
    .nav-auth {
        gap: 0.75rem;
    }
    
    .auth-link {
        padding: 0.5rem 1rem;
    }
}
</style>
