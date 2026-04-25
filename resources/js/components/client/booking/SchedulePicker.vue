<template>
    <div class="schedule-picker">
        <h2 class="schedule-picker__title">Select Date & Time</h2>

        <!-- Loading state -->
        <div v-if="loading" class="schedule-picker__loading">
            <p>Loading available dates...</p>
        </div>

        <!-- Info when no photographer selected -->
        <p v-else-if="!photographerId" class="schedule-picker__info">
            Select a service first to see available dates.
        </p>

        <!-- Date selector -->
        <div v-else class="schedule-picker__dates">
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

        <p v-if="availabilityError" class="schedule-picker__error">{{ availabilityError }}</p>
        <p v-if="error" class="schedule-picker__error">{{ error }}</p>
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

const selectTime = (startTime) => {
    selectedTime.value = startTime;
    // Build ISO datetime string for the model
    const dateTime = `${selectedDate.value}T${startTime}`;
    emit('update:modelValue', dateTime);
};

const formatTime = (timeStr) => {
    if (!timeStr) return '';
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

<style scoped>
.schedule-picker__title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.schedule-picker__loading {
    padding: 1rem;
    text-align: center;
    color: #6b7280;
}

.schedule-picker__info {
    color: #6b7280;
    font-size: 0.875rem;
    font-style: italic;
}

.schedule-picker__dates {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
}

.schedule-picker__day {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 64px;
}

.schedule-picker__day:hover:not(:disabled) {
    border-color: #3b82f6;
    background: #f8fafc;
}

.schedule-picker__day--today {
    border-color: #93c5fd;
}

.schedule-picker__day--selected {
    border-color: #3b82f6;
    background: #eff6ff;
    box-shadow: 0 0 0 1px #3b82f6;
}

.schedule-picker__day--available {
    cursor: pointer;
}

.schedule-picker__day--available .schedule-picker__day-number::after {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
    margin: 4px auto 0;
}

.schedule-picker__day--unavailable {
    opacity: 0.4;
    cursor: not-allowed;
}

.schedule-picker__day:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.schedule-picker__day-name {
    font-size: 0.75rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
}

.schedule-picker__day-number {
    font-size: 1rem;
    font-weight: 600;
}

.schedule-picker__times {
    margin-top: 1.5rem;
}

.schedule-picker__subtitle {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
}

.schedule-picker__time-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.schedule-picker__time {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #fff;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
}

.schedule-picker__time:hover {
    border-color: #3b82f6;
    background: #f8fafc;
}

.schedule-picker__time--selected {
    border-color: #3b82f6;
    background: #eff6ff;
    box-shadow: 0 0 0 1px #3b82f6;
}

.schedule-picker__error {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}
</style>
