<template>
    <div class="event-details-form">
        <h2 class="event-details-form__title">Event Details</h2>
        
        <div class="event-details-form__group">
            <label for="location" class="event-details-form__label">Location / Venue Name</label>
            <input
                id="location"
                type="text"
                :value="location"
                @input="$emit('update:location', $event.target.value)"
                placeholder="e.g. Stanley Park, Vancouver"
                class="event-details-form__input"
                :class="{ 'event-details-form__input--error': errors.location }"
            />
            <p v-if="errors.location" class="error-message">{{ errors.location[0] }}</p>
        </div>

        <div class="event-details-form__group">
            <label for="notes" class="event-details-form__label">Special Requests or Notes</label>
            <textarea
                id="notes"
                :value="notes"
                @input="$emit('update:notes', $event.target.value)"
                placeholder="Share any specific requirements or questions..."
                class="event-details-form__textarea"
                :class="{ 'event-details-form__textarea--error': errors.notes }"
            ></textarea>
            <p v-if="errors.notes" class="error-message">{{ errors.notes[0] }}</p>
        </div>
    </div>
</template>

<script setup>
defineProps({
    location: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    },
    errors: {
        type: Object,
        default: () => ({})
    }
});

defineEmits(['update:location', 'update:notes']);
</script>

<style scoped>
.event-details-form__title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.event-details-form__group {
    margin-bottom: 1.5rem;
}

.event-details-form__label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #374151;
}

.event-details-form__input,
.event-details-form__textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
}

.event-details-form__textarea {
    min-height: 120px;
    resize: vertical;
}

.event-details-form__input--error,
.event-details-form__textarea--error {
    border-color: #ef4444;
}

.error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}
</style>
