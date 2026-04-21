<template>
    <div class="service-selector">
        <h2 class="service-selector__title">Select a Service</h2>
        <div class="service-selector__grid">
            <div
                v-for="service in services"
                :key="service.id"
                class="service-selector__item"
                :class="{ 'service-selector__item--selected': modelValue === service.id }"
                @click="$emit('update:modelValue', service.id)"
            >
                <div class="service-selector__item-info">
                    <span class="service-selector__item-name">{{ service.name }}</span>
                    <p class="service-selector__item-description">{{ service.description }}</p>
                </div>
                <div class="service-selector__item-price">
                    ${{ service.price }}
                </div>
            </div>
        </div>
        <p v-if="error" class="error-message">{{ error }}</p>
    </div>
</template>

<script setup>
defineProps({
    services: {
        type: Array,
        required: true
    },
    modelValue: {
        type: [Number, null],
        default: null
    },
    error: {
        type: String,
        default: ''
    }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.service-selector__title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.service-selector__grid {
    display: grid;
    gap: 1rem;
}

.service-selector__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.service-selector__item:hover {
    border-color: #3b82f6;
    background: #f8fafc;
}

.service-selector__item--selected {
    border-color: #3b82f6;
    background: #eff6ff;
    box-shadow: 0 0 0 1px #3b82f6;
}

.service-selector__item-name {
    display: block;
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.service-selector__item-description {
    font-size: 0.875rem;
    color: #666;
    margin: 0;
}

.service-selector__item-price {
    font-weight: 700;
    font-size: 1.125rem;
    color: #1a1a1a;
}

.error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}
</style>
