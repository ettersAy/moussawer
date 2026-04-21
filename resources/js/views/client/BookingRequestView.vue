<template>
    <div class="booking-request-view">
        <div v-if="loading && !photographer" class="booking-request-view__loading">
            <p>Loading photographer details...</p>
        </div>

        <div v-else-if="success" class="booking-request-view__success">
            <div class="booking-request-view__success-icon">✓</div>
            <h2>Booking Request Sent!</h2>
            <p>The photographer has been notified and will get back to you soon.</p>
            <router-link to="/client/bookings" class="btn btn--primary">View My Bookings</router-link>
        </div>

        <div v-else class="booking-request-view__container">
            <main class="booking-request-view__main">
                <h1 class="booking-request-view__title">Book {{ photographer?.user?.name }}</h1>

                <section class="booking-request-view__section">
                    <ServiceSelector
                        :services="services"
                        v-model="form.photographer_service_id"
                        :error="errors.photographer_service_id?.[0]"
                    />
                </section>

                <section class="booking-request-view__section">
                    <SchedulePicker
                        v-model="form.scheduled_date"
                        :error="errors.scheduled_date?.[0]"
                    />
                </section>

                <section class="booking-request-view__section">
                    <EventDetailsForm
                        v-model:location="form.location"
                        v-model:notes="form.notes"
                        :errors="errors"
                    />
                </section>
            </main>

            <aside class="booking-request-view__sidebar">
                <BookingSummary
                    :photographer="photographer"
                    :selected-service="selectedService"
                    :total="calculateTotal"
                    :loading="loading"
                    @submit="submitBooking"
                />
            </aside>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useBookingForm } from '@/composables/useBookingForm';
import ServiceSelector from '@/components/client/booking/ServiceSelector.vue';
import SchedulePicker from '@/components/client/booking/SchedulePicker.vue';
import EventDetailsForm from '@/components/client/booking/EventDetailsForm.vue';
import BookingSummary from '@/components/client/booking/BookingSummary.vue';

const route = useRoute();
const {
    form,
    photographer,
    services,
    loading,
    errors,
    success,
    initForm,
    submitBooking,
    selectedService,
    calculateTotal
} = useBookingForm();

onMounted(() => {
    initForm(route.params.id);
});
</script>
