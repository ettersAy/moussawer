<template>
    <div class="availability-calendar__modal-overlay" @click.self="$emit('close')">
        <div class="availability-calendar__modal">
            <div class="availability-calendar__modal-header">
                <h3 class="availability-calendar__modal-title">
                    {{ isEditing ? 'Edit' : 'Add' }} Slots for {{ formattedDate }}
                </h3>
                <button class="availability-calendar__modal-close" @click="$emit('close')">&times;</button>
            </div>

            <div class="availability-calendar__modal-body">
                <!-- Error message -->
                <div v-if="formError" class="availability-calendar__error">
                    {{ formError }}
                </div>

                <!-- Success message -->
                <div v-if="formSuccess" class="availability-calendar__success">
                    {{ formSuccess }}
                </div>

                <!-- Slot form -->
                <form @submit.prevent="handleSubmit" class="availability-calendar__form">
                    <div class="availability-calendar__form-row">
                        <label class="availability-calendar__label">Date</label>
                        <input
                            v-model="form.date"
                            type="date"
                            class="availability-calendar__input"
                            :min="today"
                            required
                        />
                    </div>

                    <div class="availability-calendar__form-row">
                        <label class="availability-calendar__label">Start Time</label>
                        <input
                            v-model="form.start_time"
                            type="time"
                            class="availability-calendar__input"
                            required
                        />
                    </div>

                    <div class="availability-calendar__form-row">
                        <label class="availability-calendar__label">End Time</label>
                        <input
                            v-model="form.end_time"
                            type="time"
                            class="availability-calendar__input"
                            required
                        />
                    </div>

                    <div class="availability-calendar__form-row">
                        <label class="availability-calendar__label">Status</label>
                        <select v-model="form.status" class="availability-calendar__select" required>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                            <option value="booked">Booked</option>
                        </select>
                    </div>

                    <div class="availability-calendar__form-row">
                        <label class="availability-calendar__label">Notes (optional)</label>
                        <textarea
                            v-model="form.notes"
                            class="availability-calendar__textarea"
                            rows="2"
                            maxlength="500"
                            placeholder="Add any notes..."
                        ></textarea>
                    </div>

                    <div class="availability-calendar__form-actions">
                        <button
                            type="button"
                            class="availability-calendar__btn availability-calendar__btn--secondary"
                            @click="$emit('close')"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            class="availability-calendar__btn availability-calendar__btn--primary"
                            :disabled="saving"
                        >
                            {{ saving ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
                        </button>
                        <button
                            v-if="isEditing"
                            type="button"
                            class="availability-calendar__btn availability-calendar__btn--danger"
                            @click="handleDelete"
                            :disabled="deleting"
                        >
                            {{ deleting ? 'Deleting...' : 'Delete' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAvailabilitySlots } from '@/composables/useAvailabilitySlots'

const props = defineProps({
    slot: {
        type: Object,
        default: null,
    },
    date: {
        type: String,
        default: null,
    },
})

const emit = defineEmits(['close', 'saved', 'deleted'])

const { createSlot, updateSlot, deleteSlot } = useAvailabilitySlots()

const today = computed(() => new Date().toISOString().split('T')[0])
const isEditing = computed(() => !!props.slot)

const formattedDate = computed(() => {
    const dateStr = form.value.date || props.date
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
})

const form = ref({
    date: props.slot?.date || props.date || '',
    start_time: props.slot?.start_time || '09:00',
    end_time: props.slot?.end_time || '17:00',
    status: props.slot?.status || 'available',
    notes: props.slot?.notes || '',
})

const formError = ref(null)
const formSuccess = ref(null)
const saving = ref(false)
const deleting = ref(false)

watch(() => props.slot, (newSlot) => {
    if (newSlot) {
        form.value = {
            date: newSlot.date,
            start_time: newSlot.start_time,
            end_time: newSlot.end_time,
            status: newSlot.status,
            notes: newSlot.notes || '',
        }
    }
}, { immediate: true })

async function handleSubmit() {
    formError.value = null
    formSuccess.value = null
    saving.value = true

    try {
        if (isEditing.value) {
            await updateSlot(props.slot.id, form.value)
            formSuccess.value = 'Slot updated successfully!'
        } else {
            await createSlot(form.value)
            formSuccess.value = 'Slot created successfully!'
            // Reset form for another entry
            form.value = {
                date: props.date || '',
                start_time: '09:00',
                end_time: '17:00',
                status: 'available',
                notes: '',
            }
        }
        emit('saved')
    } catch (err) {
        formError.value = err.response?.data?.message || 'An error occurred.'
    } finally {
        saving.value = false
    }
}

async function handleDelete() {
    if (!confirm('Are you sure you want to delete this slot?')) return

    formError.value = null
    deleting.value = true

    try {
        await deleteSlot(props.slot.id)
        emit('deleted')
        emit('close')
    } catch (err) {
        formError.value = err.response?.data?.message || 'Failed to delete slot.'
    } finally {
        deleting.value = false
    }
}
</script>
