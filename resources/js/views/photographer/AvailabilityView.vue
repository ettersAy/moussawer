<template>
  <div class="availability-calendar">
    <!-- Header -->
    <div class="availability-calendar__header">
      <h1 class="availability-calendar__title">Availability Calendar</h1>
      <div class="availability-calendar__nav">
        <button class="availability-calendar__nav-btn" @click="previousMonth" :disabled="loading">
          &larr; Prev
        </button>
        <span class="availability-calendar__month-label">{{ monthLabel }}</span>
        <button class="availability-calendar__nav-btn" @click="nextMonth" :disabled="loading">
          Next &rarr;
        </button>
        <button class="availability-calendar__nav-btn" @click="goToToday" :disabled="loading">
          Today
        </button>
      </div>
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
      <span class="availability-calendar__legend-item">
        <span class="availability-calendar__legend-dot availability-calendar__legend-dot--not-set"></span>
        Not Set
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="availability-calendar__loading">
      <div class="availability-calendar__spinner"></div>
      <p>Loading calendar...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="availability-calendar__error">
      <p>{{ error }}</p>
      <button class="btn-primary" @click="loadCalendar">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasAnySlots" class="availability-calendar__empty">
      <div class="availability-calendar__empty-icon">📅</div>
      <h3>No Availability Set</h3>
      <p>You haven't set any availability slots yet. Click on a day to start managing your schedule.</p>
    </div>

    <!-- Calendar Grid -->
    <div v-else class="availability-calendar__grid">
      <div
        v-for="dayName in dayHeaders"
        :key="dayName"
        class="availability-calendar__day-header"
      >
        {{ dayName }}
      </div>

      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="availability-calendar__day"
        :class="{
          'availability-calendar__day--other-month': !day.isCurrentMonth,
          'availability-calendar__day--today': day.isToday,
          'availability-calendar__day--past': day.isPast,
          'availability-calendar__day--not-set': !day.hasSlots && day.isCurrentMonth,
        }"
        @click="day.isCurrentMonth && !day.isPast ? openDayManager(day.date) : null"
      >
        <span class="availability-calendar__day-number">{{ day.day }}</span>
        <div v-if="day.hasSlots" class="availability-calendar__day-status">
          <div
            v-if="day.available > 0"
            class="availability-calendar__day-status-bar availability-calendar__day-status-bar--available"
            :style="{ width: statusBarWidth(day.available, day.totalSlots) }"
          ></div>
          <div
            v-if="day.unavailable > 0"
            class="availability-calendar__day-status-bar availability-calendar__day-status-bar--unavailable"
            :style="{ width: statusBarWidth(day.unavailable, day.totalSlots) }"
          ></div>
          <div
            v-if="day.booked > 0"
            class="availability-calendar__day-status-bar availability-calendar__day-status-bar--booked"
            :style="{ width: statusBarWidth(day.booked, day.totalSlots) }"
          ></div>
          <span class="availability-calendar__day-count">{{ day.totalSlots }} slot{{ day.totalSlots !== 1 ? 's' : '' }}</span>
        </div>
        <span v-else-if="day.isCurrentMonth" class="availability-calendar__day-count">Not set</span>
      </div>
    </div>

    <!-- Day Slot Manager Modal -->
    <DaySlotManager
      :show="showDayManager"
      :date="selectedDate"
      @close="closeDayManager"
      @updated="onSlotsUpdated"
    />
  </div>
</template>

<script setup>
import '@css/views/photographer/availability.css'
import { ref, computed, onMounted } from 'vue'
import { useAvailabilitySlots } from '@/composables/useAvailabilitySlots'
import DaySlotManager from '@/components/photographer/DaySlotManager.vue'

const {
  loading,
  error,
  currentMonth,
  currentYear,
  fetchCalendar,
  navigateMonth,
  goToToday,
} = useAvailabilitySlots()

const calendarData = ref(null)
const showDayManager = ref(false)
const selectedDate = ref('')

const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const monthLabel = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const hasAnySlots = computed(() => {
  if (!calendarData.value?.days) return false
  return calendarData.value.days.some(d => d.has_slots)
})

const calendarDays = computed(() => {
  if (!calendarData.value?.days) return []

  const days = calendarData.value.days
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1)
  // JavaScript: Sunday=0, Monday=1, ..., Saturday=6
  // We want Monday=0, so adjust: (jsDay + 6) % 7
  const startOffset = (firstDay.getDay() + 6) % 7

  const result = []

  // Add empty cells for days before the 1st
  for (let i = 0; i < startOffset; i++) {
    result.push({
      date: '',
      day: '',
      isCurrentMonth: false,
      isToday: false,
      isPast: true,
      hasSlots: false,
      totalSlots: 0,
      available: 0,
      unavailable: 0,
      booked: 0,
    })
  }

  // Add actual days
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  for (const dayData of days) {
    const isPast = dayData.date < todayStr && !dayData.is_today
    result.push({
      date: dayData.date,
      day: new Date(dayData.date + 'T00:00:00').getDate(),
      isCurrentMonth: true,
      isToday: dayData.is_today,
      isPast: isPast,
      hasSlots: dayData.has_slots,
      totalSlots: dayData.total_slots,
      available: dayData.available,
      unavailable: dayData.unavailable,
      booked: dayData.booked,
    })
  }

  return result
})

const statusBarWidth = (count, total) => {
  if (total === 0) return '0%'
  return `${(count / total) * 100}%`
}

const loadCalendar = async () => {
  try {
    const data = await fetchCalendar(currentMonth.value, currentYear.value)
    calendarData.value = data
  } catch (err) {
    console.error('Failed to load calendar:', err)
    // If the photographer profile doesn't exist (freshly registered),
    // show a helpful message instead of an error
    if (err.response?.status === 404 && err.response?.data?.message?.includes('Photographer profile')) {
      // Clear the error from the composable to show our custom message
      error.value = 'Please create your photographer profile first before managing availability.'
    }
  }
}

const previousMonth = () => {
  navigateMonth(-1)
  loadCalendar()
}

const nextMonth = () => {
  navigateMonth(1)
  loadCalendar()
}

const goToTodayAndLoad = () => {
  goToToday()
  loadCalendar()
}

const openDayManager = (date) => {
  selectedDate.value = date
  showDayManager.value = true
}

const closeDayManager = () => {
  showDayManager.value = false
  selectedDate.value = ''
}

const onSlotsUpdated = () => {
  loadCalendar()
}

onMounted(() => {
  loadCalendar()
})
</script>
