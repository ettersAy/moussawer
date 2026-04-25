<template>
    <transition name="modal">
        <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
            <div class="modal-content pre-submit-modal">
                <div class="modal-header">
                    <h2>Review Your Booking</h2>
                    <button class="close-btn" @click="$emit('close')">&times;</button>
                </div>

                <div class="modal-body">
                    <!-- Photographer Summary -->
                    <section class="pre-submit-modal__section">
                        <h3>Photographer</h3>
                        <div class="pre-submit-modal__photographer">
                            <div class="pre-submit-modal__avatar">
                                {{ photographer?.user?.name?.charAt(0) || '?' }}
                            </div>
                            <div>
                                <p class="pre-submit-modal__name">{{ photographer?.user?.name }}</p>
                                <p class="pre-submit-modal__detail">{{ photographer?.user?.email }}</p>
                            </div>
                        </div>
                    </section>

                    <!-- Service Details -->
                    <section class="pre-submit-modal__section">
                        <h3>Service</h3>
                        <div v-if="selectedService" class="pre-submit-modal__row">
                            <span>{{ selectedService.name }}</span>
                            <span class="pre-submit-modal__price">${{ selectedService.price }}</span>
                        </div>
                        <p v-if="selectedService?.description" class="pre-submit-modal__description">
                            {{ selectedService.description }}
                        </p>
                    </section>

                    <!-- Schedule -->
                    <section class="pre-submit-modal__section">
                        <h3>Schedule</h3>
                        <div class="pre-submit-modal__row">
                            <span>Date & Time</span>
                            <span>{{ formatDateTime(form.scheduled_date) }}</span>
                        </div>
                        <div class="pre-submit-modal__row">
                            <span>Duration</span>
                            <span>{{ form.duration_minutes || selectedService?.duration_minutes || 'N/A' }} minutes</span>
                        </div>
                    </section>

                    <!-- Location -->
                    <section class="pre-submit-modal__section">
                        <h3>Location</h3>
                        <p>{{ form.location || 'Not specified' }}</p>
                    </section>

                    <!-- Notes -->
                    <section v-if="form.notes" class="pre-submit-modal__section">
                        <h3>Special Requests</h3>
                        <p class="pre-submit-modal__notes">{{ form.notes }}</p>
                    </section>

                    <!-- Price Breakdown -->
                    <section class="pre-submit-modal__section pre-submit-modal__section--pricing">
                        <h3>Price Breakdown</h3>
                        <div class="pre-submit-modal__row">
                            <span>{{ selectedService?.name || 'Service' }}</span>
                            <span>${{ selectedService?.price || '0.00' }}</span>
                        </div>
                        <div class="pre-submit-modal__row pre-submit-modal__row--total">
                            <span>Total</span>
                            <span class="pre-submit-modal__total">${{ total }}</span>
                        </div>
                        <p class="pre-submit-modal__disclaimer">
                            You won't be charged yet. The photographer will review your request.
                        </p>
                    </section>
                </div>

                <div class="modal-actions">
                    <button
                        type="button"
                        class="btn-secondary"
                        @click="$emit('close')"
                        :disabled="loading"
                    >
                        Edit Details
                    </button>
                    <button
                        type="button"
                        class="btn-primary"
                        @click="$emit('confirm')"
                        :disabled="loading"
                    >
                        <span v-if="loading" class="spinner"></span>
                        {{ loading ? 'Submitting...' : 'Confirm & Send Request' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
defineProps({
    show: { type: Boolean, default: false },
    photographer: { type: Object, default: null },
    selectedService: { type: Object, default: null },
    form: { type: Object, required: true },
    total: { type: Number, default: 0 },
    loading: { type: Boolean, default: false },
});

defineEmits(['close', 'confirm']);

const formatDateTime = (val) => {
    if (!val) return 'Not selected';
    try {
        const d = new Date(val);
        return d.toLocaleDateString('en-US', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch {
        return val;
    }
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: #fff;
    border-radius: 12px;
    max-width: 560px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
}

.modal-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
}

.modal-body {
    padding: 1.5rem;
}

.pre-submit-modal__section {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f3f4f6;
}

.pre-submit-modal__section:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.pre-submit-modal__section h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
}

.pre-submit-modal__photographer {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.pre-submit-modal__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #3b82f6;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.125rem;
}

.pre-submit-modal__name {
    font-weight: 600;
    margin: 0;
}

.pre-submit-modal__detail {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
}

.pre-submit-modal__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.375rem 0;
    font-size: 0.9375rem;
}

.pre-submit-modal__row--total {
    padding-top: 0.75rem;
    margin-top: 0.5rem;
    border-top: 1px solid #eee;
    font-weight: 700;
    font-size: 1.125rem;
}

.pre-submit-modal__price {
    font-weight: 600;
}

.pre-submit-modal__total {
    color: #3b82f6;
}

.pre-submit-modal__description {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.5rem;
    margin-bottom: 0;
}

.pre-submit-modal__notes {
    color: #4b5563;
    font-style: italic;
    margin: 0;
}

.pre-submit-modal__disclaimer {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 0.75rem;
    margin-bottom: 0;
}

.modal-actions {
    display: flex;
    gap: 0.75rem;
    padding: 1rem 1.5rem 1.5rem;
}

.modal-actions button {
    flex: 1;
    padding: 0.75rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-secondary {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    color: #374151;
}

.btn-secondary:hover:not(:disabled) {
    background: #e5e7eb;
}

.btn-primary {
    background: #3b82f6;
    border: 1px solid #3b82f6;
    color: #fff;
}

.btn-primary:hover:not(:disabled) {
    background: #2563eb;
}

.btn-primary:disabled,
.btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #fff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    margin-right: 0.5rem;
    vertical-align: middle;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
</style>
