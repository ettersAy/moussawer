# Task P4-T02: Update `EventDetailsForm` to Include Duration Field

## Context
The current `EventDetailsForm.vue` has `location` and `notes` fields. The new requirement includes "event details capture (location, duration, special requirements)". Duration should be shown as a read-only or editable field based on the selected service's default.

## Changes

### A. Update `EventDetailsForm.vue`
Add a duration selector field. Since the service already sets `duration_minutes`, we show it as pre-filled but allow override.

```vue
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
```

**New prop**: `durationMinutes` (Number, default 60).
**New emit**: `update:durationMinutes`.

### B. Update `BookingRequestView.vue` to wire duration
In the template pass:
```vue
<EventDetailsForm
    v-model:location="form.location"
    v-model:durationMinutes="form.duration_minutes"
    v-model:notes="form.notes"
    :errors="errors"
/>
```

## Validation
- Duration field appears below location, shows service default.
- Changing duration updates `form.duration_minutes`.
- Still backward compatible with existing tests (no validation failure if omitted).
- Hint text clarifies it's an override.

## Files Modified
- `resources/js/components/client/booking/EventDetailsForm.vue`
