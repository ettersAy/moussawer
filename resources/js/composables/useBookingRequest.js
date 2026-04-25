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
    const bookingId = ref(null);

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
            const payload = { ...form };
            // Ensure date is in correct format
            if (payload.scheduled_date && payload.scheduled_date.includes('T')) {
                payload.scheduled_date = payload.scheduled_date.replace('T', ' ');
            }
            // Ensure duration_minutes is set
            if (!payload.duration_minutes && selectedService.value) {
                payload.duration_minutes = selectedService.value.duration_minutes;
            }
            const response = await api.post('/client/bookings', payload);
            success.value = true;
            bookingId.value = response.data?.data?.id || null;
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
        bookingId,
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
