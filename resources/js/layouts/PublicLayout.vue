<template>
    <div class="app-container">
        <header>
            <Navbar />
        </header>

        <main style="padding: 20px;">
            <!-- This is where HomeView or ContactView will be injected -->
            <slot /> 
        </main>

        <footer style="margin-top: 50px; border-top: 1px solid #ccc;">
            <p>© 2026 Moussawer - Photography Portal</p>
        </footer>
    </div>
</template>

<script setup>
import Navbar from '@/components/shared/Navbar.vue';
</script>