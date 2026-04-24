# Task P3-T02: Replace `SchedulePicker` with Real-Time Availability-Aware Component

## Context
The current `SchedulePicker.vue` is a simple `<input type="datetime-local">` with no integration with the photographer's availability slots. The new flow requires:
1. Show available date/time slots from the photographer.
2. Disable or warn on unavailable times.
3. Show loading state during availability check.

## Changes

### A. Rewrite `SchedulePicker.vue`
Replace with a two-step calendar:
- **Step 1**: Date picker showing available dates (green dots for available, gray for unavailable).
- **Step 2**: Time slot picker — show available time slots for the selected date.

The component remains `v-model` compatible (`modelValue` / `update:modelValue`).

```vue
<template>
    <div class="schedule-picker">
        <h2 class="schedule-picker__title">Select Date & Time</h2>

        <!-- Date selector -->
        <div class="schedule-picker__dates">
            <button
                v-for="day in visibleDays"
                :key="day.date"
                class="schedule-picker__day"
                :class="{
                    'schedule-picker__day--selected': selectedDate === day.date,
                    'schedule-picker__day--available': day.hasSlots,
                    'schedule-picker__day--unavailable': !day.hasSlots,
                    'schedule-picker__day--today': day.isToday,
                }"
                :disabled="!day.hasSlots || day.isPast"
                @click="selectDate(day.date)"
            >
                <span class="schedule-picker__day-name">{{ day.dayName }}</span>
                <span class="schedule-picker__day-number">{{ day.dayNumber }}</span>
            </button>
        </div>

        <!-- Time slots for selected date -->
        <div v-if="selectedDate && timeSlots.length > 0" class="schedule-picker__times">
            <h3 class="schedule-picker__subtitle">Available Times</h3>
            <div class="schedule-picker__time-grid">
                <button
                    v-for="slot in timeSlots"
                    :key="slot.id"
                    class="schedule-picker__time"
                    :class="{ 'schedule-picker__time--selected': selectedTime === slot.start_time }"
                    @click="selectTime(slot.start_time, slot.end_time)"
                >
                    {{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}
                </button>
            </div>
        </div>

        <!-- Hidden input for v-model compatibility -->
        <input
            type="hidden"
            :value="modelValue"
        />

        <p v-if="availabilityError" class="schedule-picker__error">{{ availabilityError }}</p>
        <p v-if="!photographerId" class="schedule-picker__info">Select a service first to see available dates.</p>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import api from '@/services/api';

const props = defineProps({
    modelValue: { type: String, default: '' },
    error: { type: String, default: '' },
    photographerId: { type: [Number, null], default: null },
    durationMinutes: { type: Number, default: 60 },
});

const emit = defineEmits(['update:modelValue', 'checking']);

// --- State ---
const availableSlots = ref([]);
const loading = ref(false);
const availabilityError = ref('');
const selectedDate = ref('');
const selectedTime = ref('');

// Compute next 14 days for the calendar
const visibleDays = computed(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const daySlots = availableSlots.value.filter(
            s => s.date === dateStr
        );
        days.push({
            date: dateStr,
            dayName: date.toLocaleDateString('en', { weekday: 'short' }),
            dayNumber: date.getDate(),
            isToday: i === 0,
            isPast: i < 0,
            hasSlots: daySlots.length > 0,
        });
    }
    return days;
});

// Time slots for the selected date
const timeSlots = computed(() => {
    if (!selectedDate.value) return [];
    return availableSlots.value.filter(s => s.date === selectedDate.value);
});

// --- Methods ---
const fetchSlots = async () => {
    if (!props.photographerId) return;
    loading.value = true;
    availabilityError.value = '';
    emit('checking', true);
    try {
        const from = new Date().toISOString().split('T')[0];
        const to = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const response = await api.get(
            `/photographers/${props.photographerId}/availability/slots`,
            { params: { from, to } }
        );
        availableSlots.value = response.data.data || [];
    } catch (err) {
        availabilityError.value = 'Unable to load available dates.';
    } finally {
        loading.value = false;
        emit('checking', false);
    }
};

const selectDate = (date) => {
    selectedDate.value = date;
    selectedTime.value = '';
};

const selectTime = (startTime, endTime) => {
    selectedTime.value = startTime;
    // Build ISO datetime string for the model
    const dateTime = `${selectedDate.value}T${startTime}`;
    emit('update:modelValue', dateTime);
};

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // timeStr could be "14:00" or "14:00:00"
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1] || '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
};

// Watch for photographer changes
watch(() => props.photographerId, (newVal) => {
    if (newVal) fetchSlots();
});

// Initial fetch
onMounted(() => {
    if (props.photographerId) fetchSlots();
});
</script>
```

## Props Changes
| Prop | Old | New |
|------|-----|-----|
| `modelValue` | String | String (same) |
| `error` | String | String (same) |
| `photographerId` | — | Number (NEW) |
| `durationMinutes` | — | Number (NEW, default 60) |

## Integration
The parent `BookingRequestView` passes `photographerId` and `durationMinutes` (from service) to `<SchedulePicker>`. The composable's `checkAvailability()` will be called after the user reaches the summary step (not on every pick).

## Validation
- Calendar shows 14 days with dot indicators for availability.
- Clicking an unavailable date does nothing.
- Selecting a date shows time slots.
- Selecting a time populates the v-model datetime.

## Files Created/Modified
- `resources/js/components/client/booking/SchedulePicker.vue` (REWRITTEN)
