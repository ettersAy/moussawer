<template>
    <div class="booking-request-view">
        <!-- Loading state -->
        <div v-if="loading && !photographer" class="booking-request-view__loading">
            <p>Loading photographer details...</p>
        </div>

        <!-- Success state -->
        <div v-else-if="success" class="booking-request-view__success">
            <div class="booking-request-view__success-icon">✓</div>
            <h2>Booking Request Sent!</h2>
            <p>The photographer has been notified and will get back to you soon.</p>
            <p v-if="bookingId" class="booking-request-view__success-id">Reference #{{ bookingId }}</p>
            <router-link to="/client/bookings" class="btn btn--primary">View My Bookings</router-link>
        </div>

        <!-- Form -->
        <div v-else class="booking-request-view__container">
            <main class="booking-request-view__main">
                <h1 class="booking-request-view__title">Book {{ photographer?.user?.name }}</h1>

                <section class="booking-request-view__section">
                    <ServiceSelector
                        :services="services"
                        v-model="form.photographer_service_id"
                        :error="getFieldError('photographer_service_id')"
                        @update:model-value="updateDurationFromService"
                    />
                </section>

                <section class="booking-request-view__section">
                    <SchedulePicker
                        v-model="form.scheduled_date"
                        :photographer-id="form.photographer_id"
                        :duration-minutes="form.duration_minutes || 60"
                        :error="getFieldError('scheduled_date')"
                    />
                </section>

                <section class="booking-request-view__section">
                    <EventDetailsForm
                        v-model:location="form.location"
                        v-model:durationMinutes="form.duration_minutes"
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
                    @review="openSummaryModal"
                />
            </aside>
        </div>

        <!-- Pre-submission Summary Modal -->
        <PreSubmitSummaryModal
            :show="showSummaryModal"
            :photographer="photographer"
            :selected-service="selectedService"
            :form="form"
            :total="calculateTotal"
            :loading="loading && !success"
            @close="closeSummaryModal"
            @confirm="submitBooking"
        />
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useBookingRequest } from '@/composables/useBookingRequest';
import ServiceSelector from '@/components/client/booking/ServiceSelector.vue';
import SchedulePicker from '@/components/client/booking/SchedulePicker.vue';
import EventDetailsForm from '@/components/client/booking/EventDetailsForm.vue';
import BookingSummary from '@/components/client/booking/BookingSummary.vue';
import PreSubmitSummaryModal from '@/components/client/booking/PreSubmitSummaryModal.vue';

const route = useRoute();
const {
    form,
    photographer,
    services,
    loading,
    errors,
    success,
    showSummaryModal,
    bookingId,
    initForm,
    submitBooking,
    selectedService,
    calculateTotal,
    updateDurationFromService,
    openSummaryModal,
    closeSummaryModal,
    hasFieldError,
    getFieldError,
} = useBookingRequest();

onMounted(() => {
    initForm(route.params.id);
});
</script>
