<template>
    <component :is="layout">
        <router-view />
    </component>
</template>

<script setup>
import { computed, defineAsyncComponent, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import PublicLayout from '@/layouts/PublicLayout.vue';

const route = useRoute();

// Mapping layout names from route meta to components
// This follows Open/Closed principle: we can add new layouts by updating the object
const layouts = {
    'public': PublicLayout,
    'admin': defineAsyncComponent(() => import('@/layouts/AdminLayout.vue')),
};

const layout = computed(() => {
    const layoutName = route.meta.layout || 'public';
    return layouts[layoutName] || PublicLayout;
});
</script>
