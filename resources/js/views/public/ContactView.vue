<template>
    <div class="contact-container">
        <h1>Contact Us</h1>
        
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
.contact-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

h1 {
    color: #1a1a1a;
    margin-bottom: 1.5rem;
    text-align: center;
    font-weight: 700;
}

.contact-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

label {
    font-weight: 600;
    color: #4a4a4a;
    font-size: 0.9rem;
}

input, textarea {
    padding: 0.8rem;
    border: 1px solid #e1e1e1;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus, textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.submit-btn {
    padding: 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
    background: #2563eb;
}

.submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.feedback {
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
    text-align: center;
}

.feedback.success {
    background: #ecfdf5;
    color: #065f46;
    border: 1px solid #a7f3d0;
}

.feedback.error {
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
}
</style>