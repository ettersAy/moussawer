<template>
    <div class="event-details-form">
        <h2 class="event-details-form__title">Event Details</h2>

        <!-- Location -->
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
            <p v-if="errors.location" class="event-details-form__error">{{ errors.location[0] }}</p>
        </div>

        <!-- Duration -->
        <div class="event-details-form__group">
            <label for="duration" class="event-details-form__label">Duration (minutes)</label>
            <input
                id="duration"
                type="number"
                :value="durationMinutes"
                @input="$emit('update:durationMinutes', parseInt($event.target.value) || 60)"
                min="30"
                max="1440"
                step="30"
                class="event-details-form__input"
                :class="{ 'event-details-form__input--error': errors.duration_minutes }"
            />
            <p class="event-details-form__hint">
                Based on the selected service. Adjust if your event needs more time.
            </p>
            <p v-if="errors.duration_minutes" class="event-details-form__error">{{ errors.duration_minutes[0] }}</p>
        </div>

        <!-- Notes -->
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
            <p v-if="errors.notes" class="event-details-form__error">{{ errors.notes[0] }}</p>
        </div>
    </div>
</template>

<script setup>
defineProps({
    location: { type: String, default: '' },
    durationMinutes: { type: Number, default: 60 },
    notes: { type: String, default: '' },
    errors: { type: Object, default: () => ({}) },
});

defineEmits(['update:location', 'update:durationMinutes', 'update:notes']);
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

.event-details-form__error {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

.event-details-form__hint {
    color: #6b7280;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    margin-bottom: 0;
}
</style>
