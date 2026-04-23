<template>
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content day-slot-manager">
        <div class="modal-header">
          <h2>Manage Slots</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <div class="modal-body">
          <div class="day-slot-manager__date">
            {{ formatDateTitle }}
          </div>

          <!-- Quick Actions -->
          <div class="day-slot-manager__quick-actions">
            <button
              class="day-slot-manager__quick-btn day-slot-manager__quick-btn--available"
              @click="markFullDay('available')"
              :disabled="saving"
            >
              Mark Full Day Available
            </button>
            <button
              class="day-slot-manager__quick-btn day-slot-manager__quick-btn--unavailable"
              @click="markFullDay('unavailable')"
              :disabled="saving"
            >
              Mark Full Day Unavailable
            </button>
          </div>

          <!-- Success/Error Messages -->
          <div v-if="feedbackMessage" class="day-slot-manager__success" v-show="feedbackType === 'success'">
            {{ feedbackMessage }}
          </div>
          <div v-if="feedbackMessage" class="day-slot-manager__error" v-show="feedbackType === 'error'">
            {{ feedbackMessage }}
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="day-slot-manager__loading">
            <div class="spinner"></div>
          </div>

          <!-- Slot List -->
          <div v-else-if="daySlots.length > 0" class="day-slot-manager__slots">
            <div
              v-for="slot in daySlots"
              :key="slot.id"
              class="day-slot-manager__slot-item"
            >
              <div class="day-slot-manager__slot-info">
                <span
                  class="day-slot-manager__slot-time"
                  :class="{ 'day-slot-manager__slot-time--full-day': !slot.start_time }"
                >
                  {{ slot.start_time ? `${slot.start_time} - ${slot.end_time}` : 'Full Day' }}
                </span>
                <span
                  class="day-slot-manager__slot-status"
                  :class="`day-slot-manager__slot-status--${slot.status}`"
                >
                  {{ getStatusLabel(slot.status) }}
                </span>
              </div>
              <div class="day-slot-manager__slot-actions">
                <button
                  v-if="slot.status !== 'booked'"
                  class="day-slot-manager__slot-btn"
                  @click="editSlotStatus(slot)"
                  :disabled="saving"
                >
                  Edit
                </button>
                <button
                  v-if="slot.status !== 'booked'"
                  class="day-slot-manager__slot-btn day-slot-manager__slot-btn--delete"
                  @click="confirmDeleteSlot(slot)"
                  :disabled="saving"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="day-slot-manager__no-slots">
            No slots set for this day. Use the quick actions above or add a custom slot below.
          </div>

          <!-- Add Slot Form -->
          <div class="day-slot-manager__add-form">
            <h4 style="margin: 0 0 0.75rem; font-size: 0.95rem; color: #0f172a;">Add Custom Slot</h4>
            <div class="day-slot-manager__form-row">
              <div class="day-slot-manager__form-group">
                <label for="slot-start">Start Time</label>
                <input
                  id="slot-start"
                  type="time"
                  v-model="newSlot.start_time"
                  :disabled="saving"
                />
              </div>
              <div class="day-slot-manager__form-group">
                <label for="slot-end">End Time</label>
                <input
                  id="slot-end"
                  type="time"
                  v-model="newSlot.end_time"
                  :disabled="saving"
                />
              </div>
            </div>
            <div class="day-slot-manager__form-group" style="margin-bottom: 0.75rem;">
              <label for="slot-status">Status</label>
              <select id="slot-status" v-model="newSlot.status" :disabled="saving">
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            <div class="day-slot-manager__form-actions">
              <button
                type="button"
                class="btn-secondary"
                @click="resetForm"
                :disabled="saving"
              >
                Clear
              </button>
              <button
                type="button"
                class="btn-primary"
                @click="addSlot"
                :disabled="saving || !isFormValid"
              >
                <span v-if="saving" class="spinner"></span>
                Add Slot
              </button>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="closeModal">
            Close
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import '@css/components/modals.css'
import { ref, computed, watch } from 'vue'
import { useAvailabilitySlots } from '@/composables/useAvailabilitySlots'

const props = defineProps({
  show: Boolean,
  date: String,
})

const emit = defineEmits(['close', 'updated'])

const { slots, loading, createSlot, createSlots, updateSlot, deleteSlot, fetchSlots } = useAvailabilitySlots()
const saving = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('success')

const newSlot = ref({
  start_time: '',
  end_time: '',
  status: 'available',
})

const daySlots = computed(() => {
  return slots.value.filter(s => s.date === props.date)
})

const formatDateTitle = computed(() => {
  if (!props.date) return ''
  const d = new Date(props.date + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const isFormValid = computed(() => {
  return newSlot.value.start_time && newSlot.value.end_time && newSlot.value.status
})

const getStatusLabel = (status) => {
  const labels = {
    available: 'Available',
    unavailable: 'Unavailable',
    booked: 'Booked',
  }
  return labels[status] || status
}

const showFeedback = (message, type = 'success') => {
  feedbackMessage.value = message
  feedbackType.value = type
  setTimeout(() => {
    feedbackMessage.value = ''
  }, 3000)
}

const loadDaySlots = async () => {
  if (!props.date) return
  await fetchSlots(props.date, props.date)
}

const addSlot = async () => {
  if (!isFormValid.value) return

  saving.value = true
  try {
    await createSlot({
      date: props.date,
      start_time: newSlot.value.start_time,
      end_time: newSlot.value.end_time,
      status: newSlot.value.status,
    })
    showFeedback('Slot added successfully!', 'success')
    resetForm()
    await loadDaySlots()
    emit('updated')
  } catch (err) {
    showFeedback(err.response?.data?.message || 'Failed to add slot', 'error')
  } finally {
    saving.value = false
  }
}

const markFullDay = async (status) => {
  saving.value = true
  try {
    await createSlot({
      date: props.date,
      status: status,
    })
    showFeedback(`Day marked as ${getStatusLabel(status)}!`, 'success')
    await loadDaySlots()
    emit('updated')
  } catch (err) {
    showFeedback(err.response?.data?.message || 'Failed to mark day', 'error')
  } finally {
    saving.value = false
  }
}

const editSlotStatus = async (slot) => {
  const newStatus = slot.status === 'available' ? 'unavailable' : 'available'
  saving.value = true
  try {
    await updateSlot(slot.id, { status: newStatus })
    showFeedback(`Slot updated to ${getStatusLabel(newStatus)}!`, 'success')
    await loadDaySlots()
    emit('updated')
  } catch (err) {
    showFeedback(err.response?.data?.message || 'Failed to update slot', 'error')
  } finally {
    saving.value = false
  }
}

const confirmDeleteSlot = async (slot) => {
  if (!confirm(`Delete this slot?`)) return

  saving.value = true
  try {
    await deleteSlot(slot.id)
    showFeedback('Slot deleted successfully!', 'success')
    await loadDaySlots()
    emit('updated')
  } catch (err) {
    showFeedback(err.response?.data?.message || 'Failed to delete slot', 'error')
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  newSlot.value = {
    start_time: '',
    end_time: '',
    status: 'available',
  }
}

const closeModal = () => {
  emit('close')
}

// Close on Escape key
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.show) {
    closeModal()
  }
}

// Watch for show changes
watch(() => props.show, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleKeydown)
    loadDaySlots()
    resetForm()
    feedbackMessage.value = ''
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>
