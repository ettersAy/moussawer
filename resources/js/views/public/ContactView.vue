<template>
    <div class="contact-container">
        <h1 class="page-header">Contact Us</h1>
        
        <div v-if="feedback" :class="['feedback', feedback.type]">
            {{ feedback.message }}
        </div>

        <form @submit.prevent="sendToApi" class="contact-form">
            <div class="form-group">
                <label for="email">Email</label>
                <input 
                    id="email"
                    v-model="form.email" 
                    type="email" 
                    placeholder="your@email.com"
                    required
                >
            </div>
            
            <div class="form-group">
                <label for="message">Message</label>
                <textarea 
                    id="message"
                    v-model="form.message" 
                    placeholder="How can we help you?"
                    required
                    rows="5"
                ></textarea>
            </div>

            <button type="submit" :disabled="isSending" class="submit-btn">
                <span v-if="isSending">Sending...</span>
                <span v-else>Send Message</span>
            </button>
        </form>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
const randomString = Math.random().toString(36).substring(2, 8);
const isSending = ref(false);
const feedback = ref(null);
const form = reactive({
    email: randomString + '@test.com',
    message: 'This is a test message "' + randomString + '"!'  // Add random string to avoid caching issues
});

const sendToApi = async () => {
    isSending.value = true;
    feedback.value = null;

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json' 
            },
            body: JSON.stringify(form)
        });

        const data = await response.json();

        if (response.ok) {
            feedback.value = { type: 'success', message: data.message || 'Message sent successfully!' };
            form.email = '';
            form.message = '';
        } else {
            throw new Error(data.message || 'Validation Error');
        }
    } catch (error) {
        feedback.value = { type: 'error', message: error.message };
    } finally {
        isSending.value = false;
    }
};
</script>

<style scoped>
/* ContactView specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
