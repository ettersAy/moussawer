<template>
    <div class="schedule-picker">
        <h2 class="schedule-picker__title">Select Date & Time</h2>
        <div class="schedule-picker__input-group">
            <input
                type="datetime-local"
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
                class="schedule-picker__input"
                :class="{ 'schedule-picker__input--error': error }"
            />
        </div>
        <p v-if="error" class="error-message">{{ error }}</p>
    </div>
</template>

<script setup>
defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    error: {
        type: String,
        default: ''
    }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.schedule-picker__title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.schedule-picker__input-group {
    width: 100%;
}

.schedule-picker__input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
}

.schedule-picker__input--error {
    border-color: #ef4444;
}

.error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}
</style>
