<template>
    <div class="availability-calendar">
        <div class="availability-calendar__header">
            <h1 class="availability-calendar__title">Availability Calendar</h1>
            <p class="availability-calendar__subtitle">
                Manage your availability slots. Green dates are available, red are unavailable, and blue are booked.
            </p>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="availability-calendar__loading">
            Loading availability data...
        </div>

        <!-- Error state -->
        <div v-if="error" class="availability-calendar__error">
            {{ error }}
        </div>

        <!-- Calendar Navigation -->
        <div class="availability-calendar__nav">
            <button class="availability-calendar__nav-btn" @click="previousMonth">&larr; Previous</button>
            <h2 class="availability-calendar__month-year">{{ monthName }} {{ currentYear }}</h2>
            <button class="availability-calendar__nav-btn" @click="nextMonth">Next &rarr;</button>
        </div>

        <!-- Legend -->
        <div class="availability-calendar__legend">
            <span class="availability-calendar__legend-item">
                <span class="availability-calendar__legend-dot availability-calendar__legend-dot--available"></span>
                Available
            </span>
            <span class="availability-calendar__legend-item">
                <span class="availability-calendar__legend-dot availability-calendar__legend-dot--unavailable"></span>
                Unavailable
            </span>
            <span class="availability-calendar__legend-item">
                <span class="availability-calendar__legend-dot availability-calendar__legend-dot--booked"></span>
                Booked
            </span>
        </div>

        <!-- Calendar Grid -->
        <div class="availability-calendar__grid">
            <div class="availability-calendar__day-header" v-for="day in dayHeaders" :key="day">
                {{ day }}
            </div>

            <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="availability-calendar__day"
                :class="{
                    'availability-calendar__day--empty': !day,
                    'availability-calendar__day--today': day && isToday(day),
                    'availability-calendar__day--available': day && getDayStatus(day) === 'available',
                    'availability-calendar__day--unavailable': day && getDayStatus(day) === 'unavailable',
                    'availability-calendar__day--booked': day && getDayStatus(day) === 'booked',
                    'availability-calendar__day--past': day && isPast(day),
                }"
                @click="day && !isPast(day) && openDayManager(day)"
            >
                <span v-if="day" class="availability-calendar__day-number">{{ day.getDate() }}</span>
                <span v-if="day && getDayStatus(day)" class="availability-calendar__day-indicator"></span>
            </div>
        </div>

        <!-- Day Slot Manager Modal -->
        <DaySlotManager
            v-if="showModal"
            :date="selectedDate"
            :slot="selectedSlot"
            @close="closeModal"
            @saved="onSaved"
            @deleted="onDeleted"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAvailabilitySlots } from '@/composables/useAvailabilitySlots'
import DaySlotManager from '@/components/photographer/DaySlotManager.vue'

const { slots, loading, error, fetchSlots } = useAvailabilitySlots()

const currentDate = ref(new Date())
const currentMonth = ref(currentDate.value.getMonth())
const currentYear = ref(currentDate.value.getFullYear())
const showModal = ref(false)
const selectedDate = ref(null)
const selectedSlot = ref(null)

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const monthName = computed(() => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ]
    return months[currentMonth.value]
})

const calendarDays = computed(() => {
    const firstDay = new Date(currentYear.value, currentMonth.value, 1)
    const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
    const startPadding = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days = []

    // Add empty cells for padding
    for (let i = 0; i < startPadding; i++) {
        days.push(null)
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentYear.value, currentMonth.value, i))
    }

    return days
})

function isToday(date) {
    const today = new Date()
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
}

function isPast(date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
}

function getDayStatus(date) {
    const dateStr = date.toISOString().split('T')[0]
    const daySlots = slots.value.filter(s => s.date === dateStr)
    if (daySlots.length === 0) return null

    // Prioritize: booked > unavailable > available
    if (daySlots.some(s => s.status === 'booked')) return 'booked'
    if (daySlots.some(s => s.status === 'unavailable')) return 'unavailable'
    return 'available'
}

function openDayManager(date) {
    const dateStr = date.toISOString().split('T')[0]
    const daySlots = slots.value.filter(s => s.date === dateStr)

    if (daySlots.length === 1) {
        selectedSlot.value = daySlots[0]
    } else {
        selectedSlot.value = null
    }

    selectedDate.value = dateStr
    showModal.value = true
}

function closeModal() {
    showModal.value = false
    selectedDate.value = null
    selectedSlot.value = null
}

function previousMonth() {
    if (currentMonth.value === 0) {
        currentMonth.value = 11
        currentYear.value--
    } else {
        currentMonth.value--
    }
    loadSlots()
}

function nextMonth() {
    if (currentMonth.value === 11) {
        currentMonth.value = 0
        currentYear.value++
    } else {
        currentMonth.value++
    }
    loadSlots()
}

async function loadSlots() {
    await fetchSlots(currentMonth.value + 1, currentYear.value)
}

function onSaved() {
    loadSlots()
}

function onDeleted() {
    loadSlots()
}

onMounted(() => {
    loadSlots()
})
</script>
