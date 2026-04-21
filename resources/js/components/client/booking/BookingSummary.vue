<template>
    <div class="booking-summary">
        <div class="booking-summary__card">
            <h2 class="booking-summary__title">Booking Summary</h2>
            
            <div class="booking-summary__photographer" v-if="photographer">
                <img :src="photographer.avatar_url || '/images/default-avatar.png'" class="booking-summary__avatar" />
                <div>
                    <span class="booking-summary__name">{{ photographer.user?.name }}</span>
                    <span class="booking-summary__rating">★ {{ photographer.rating || 'New' }}</span>
                </div>
            </div>

            <div class="booking-summary__details">
                <div class="booking-summary__row">
                    <span>Service</span>
                    <span v-if="selectedService">{{ selectedService.name }}</span>
                    <span v-else class="booking-summary__placeholder">Not selected</span>
                </div>
                <div class="booking-summary__row">
                    <span>Base Price</span>
                    <span v-if="selectedService">${{ selectedService.price }}</span>
                    <span v-else>$0.00</span>
                </div>
                <div class="booking-summary__row booking-summary__row--total">
                    <span>Total</span>
                    <span>${{ total }}</span>
                </div>
            </div>

            <button
                type="button"
                class="btn btn--primary btn--full"
                :disabled="loading || !selectedService"
                @click="$emit('submit')"
            >
                <span v-if="loading">Sending Request...</span>
                <span v-else>Request Booking</span>
            </button>

            <p class="booking-summary__disclaimer">
                You won't be charged yet. The photographer will review your request first.
            </p>
        </div>
    </div>
</template>

<script setup>
defineProps({
    photographer: {
        type: Object,
        default: null
    },
    selectedService: {
        type: Object,
        default: null
    },
    total: {
        type: Number,
        default: 0
    },
    loading: {
        type: Boolean,
        default: false
    }
});

defineEmits(['submit']);
</script>

<style scoped>
.booking-summary__card {
    background: #fff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid #eee;
}

.booking-summary__title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
}

.booking-summary__photographer {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #eee;
}

.booking-summary__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
}

.booking-summary__name {
    display: block;
    font-weight: 600;
}

.booking-summary__rating {
    font-size: 0.875rem;
    color: #f59e0b;
}

.booking-summary__details {
    margin-bottom: 1.5rem;
}

.booking-summary__row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
    color: #4b5563;
}

.booking-summary__row--total {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
    font-weight: 700;
    font-size: 1.125rem;
    color: #111827;
}

.booking-summary__placeholder {
    color: #9ca3af;
    font-style: italic;
}

.btn--full {
    width: 100%;
}

.booking-summary__disclaimer {
    margin-top: 1rem;
    font-size: 0.75rem;
    color: #6b7280;
    text-align: center;
}
</style>
