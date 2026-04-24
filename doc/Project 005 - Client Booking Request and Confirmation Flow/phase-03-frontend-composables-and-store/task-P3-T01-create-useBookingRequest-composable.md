# Task P3-T01: Create `useBookingRequest` Composable (Refactored from `useBookingForm`)

## Context
The current `useBookingForm` composable (`resources/js/composables/useBookingForm.js`) handles init, service selection, total calculation, and submission. However, it has several issues:
1. **No real-time availability validation** — the `SchedulePicker` only captures a datetime-local value without verifying against the photographer's slots.
2. **No modal/summary pre-submission** — the current `BookingSummary` directly sends the request. We need a pre-submission summary modal with price breakdown.
3. **No `duration_minutes`** field in the form.

## Changes

### A. Refactor `useBookingForm` → `useBookingRequest`
Create `resources/js/composables/useBookingRequest.js`, migrating + extending the existing logic.

```javascript
import { ref, reactive, computed } from 'vue';
import api from '@/services/api';

export function useBookingRequest() {
    const loading = ref(false);
    const checkingAvailability = ref(false);
    const errors = ref({});
    const success = ref(false);
    const photographer = ref(null);
    const services = ref([]);
    const availableSlots = ref([]);
    const availabilityError = ref('');

    // --- Form State (v-model compatible) ---
    const form = reactive({
        photographer_id: null,
        photographer_service_id: null,
        scheduled_date: '',
        location: '',
        duration_minutes: null,
        notes: '',
    });

    // Modal state for pre-submission summary
    const showSummaryModal = ref(false);

    // --- Computed ---
    const selectedService = computed(() => {
        return services.value.find(s => s.id === form.photographer_service_id);
    });

    const calculateTotal = computed(() => {
        const price = selectedService.value ? Number(selectedService.value.price) : 0;
        return price;
    });

    const isFormValid = computed(() => {
        return form.photographer_service_id
            && form.scheduled_date
            && form.location
            && form.location.trim().length > 0;
    });

    // --- Initialization ---
    const initForm = async (photographerId) => {
        loading.value = true;
        errors.value = {};
        try {
            const response = await api.get(`/photographers/${photographerId}`);
            photographer.value = response.data.data;
            services.value = response.data.data.services || [];
            form.photographer_id = photographerId;
        } catch (err) {
            errors.value = err.response?.data?.errors || { message: 'Failed to load photographer details' };
        } finally {
            loading.value = false;
        }
    };

    // --- Availability Check ---
    const checkAvailability = async (datetime, duration) => {
        checkingAvailability.value = true;
        availabilityError.value = '';
        try {
            const response = await api.get(
                `/photographers/${form.photographer_id}/availability/check`,
                { params: { datetime, duration_minutes: duration } }
            );
            if (!response.data.available) {
                availabilityError.value = response.data.message || 'This time slot is not available.';
                return false;
            }
            return true;
        } catch (err) {
            availabilityError.value = 'Failed to verify availability. Please try again.';
            return false;
        } finally {
            checkingAvailability.value = false;
        }
    };

    const fetchAvailableSlots = async (from, to) => {
        try {
            const response = await api.get(
                `/photographers/${form.photographer_id}/availability/slots`,
                { params: { from, to } }
            );
            availableSlots.value = response.data.data || [];
        } catch (err) {
            console.error('Failed to fetch available slots:', err);
            availableSlots.value = [];
        }
    };

    // --- Form Handling ---
    const updateDurationFromService = () => {
        if (selectedService.value) {
            form.duration_minutes = selectedService.value.duration_minutes || null;
        }
    };

    const openSummaryModal = () => {
        showSummaryModal.value = true;
    };

    const closeSummaryModal = () => {
        showSummaryModal.value = false;
    };

    // --- Submission ---
    const submitBooking = async () => {
        loading.value = true;
        errors.value = {};
        success.value = false;

        try {
            await api.post('/client/bookings', {
                ...form,
                // Ensure date is in correct format
                scheduled_date: form.scheduled_date.replace('T', ' '),
            });
            success.value = true;
            showSummaryModal.value = false;
        } catch (err) {
            errors.value = err.response?.data?.errors || { message: 'Failed to submit booking request' };
        } finally {
            loading.value = false;
        }
    };

    // --- Errors ---
    const hasFieldError = (field) => {
        return errors.value[field] && errors.value[field].length > 0;
    };

    const getFieldError = (field) => {
        return errors.value[field]?.[0] || '';
    };

    return {
        // State
        form,
        photographer,
        services,
        availableSlots,
        loading,
        checkingAvailability,
        errors,
        success,
        availabilityError,
        showSummaryModal,
        // Computed
        selectedService,
        calculateTotal,
        isFormValid,
        // Methods
        initForm,
        checkAvailability,
        fetchAvailableSlots,
        updateDurationFromService,
        openSummaryModal,
        closeSummaryModal,
        submitBooking,
        hasFieldError,
        getFieldError,
    };
}
```

## Key Changes vs `useBookingForm`
| Aspect | Old `useBookingForm` | New `useBookingRequest` |
|--------|---------------------|------------------------|
| Availability | None | `checkAvailability()` + `fetchAvailableSlots()` |
| Duration | None | `duration_minutes` in form, auto-fills from service |
| Summary Modal | No control | `showSummaryModal` state + open/close |
| Form Validation | None | `isFormValid` computed |
| Error helpers | Raw errors obj | `hasFieldError()` / `getFieldError()` |

## Validation
- The composable can be imported without errors.
- It provides all reactive state and methods needed by the view.

## Files Created
- `resources/js/composables/useBookingRequest.js` (NEW — keep `useBookingForm.js` for backward compat during transition, delete at end)
