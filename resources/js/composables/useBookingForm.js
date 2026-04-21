import { ref, reactive, computed } from 'vue';
import api from '@/services/api';

export function useBookingForm() {
    const loading = ref(false);
    const errors = ref({});
    const success = ref(false);
    const photographer = ref(null);
    const services = ref([]);

    const form = reactive({
        photographer_id: null,
        photographer_service_id: null,
        scheduled_date: '',
        location: '',
        notes: '',
    });

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

    const selectedService = computed(() => {
        return services.value.find(s => s.id === form.photographer_service_id);
    });

    const calculateTotal = computed(() => {
        const price = selectedService.value ? selectedService.value.price : 0;
        return Number(price);
    });

    const submitBooking = async () => {
        loading.value = true;
        errors.value = {};
        success.value = false;

        try {
            await api.post('/client/bookings', form);
            success.value = true;
        } catch (err) {
            errors.value = err.response?.data?.errors || { message: 'Failed to submit booking request' };
        } finally {
            loading.value = false;
        }
    };

    return {
        form,
        photographer,
        services,
        loading,
        errors,
        success,
        initForm,
        submitBooking,
        selectedService,
        calculateTotal,
    };
}
