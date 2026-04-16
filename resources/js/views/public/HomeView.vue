<template>
    <div class="home-container">
        <!-- Hero Section -->
        <section class="hero">
            <div class="hero-content">
                <div class="hero-badge">
                    <span class="badge-text">Professional Photography Platform</span>
                </div>
                <h1 class="hero-title">
                    Capture Your <span class="highlight">Perfect Moment</span>
                </h1>
                <p class="hero-subtitle">
                    Connect with professional photographers for weddings, corporate events, portraits, and more. 
                    Find the perfect eye for your story with our curated network of talent.
                </p>
                <div class="hero-actions">
                    <router-link to="/register" class="btn btn-primary">
                        <span class="btn-icon">📸</span>
                        Find a Photographer
                    </router-link>
                    <router-link to="/login" class="btn btn-outline">
                        <span class="btn-icon">🔑</span>
                        Sign In
                    </router-link>
                </div>
                <div class="hero-stats">
                    <div class="stat">
                        <span class="stat-number">500+</span>
                        <span class="stat-label">Photographers</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">2,000+</span>
                        <span class="stat-label">Events Captured</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">98%</span>
                        <span class="stat-label">Client Satisfaction</span>
                    </div>
                </div>
            </div>
            <div class="hero-visual">
                <div class="visual-container">
                    <div class="visual-grid">
                        <div class="visual-item item-1"></div>
                        <div class="visual-item item-2"></div>
                        <div class="visual-item item-3"></div>
                        <div class="visual-item item-4"></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="features">
            <div class="section-header">
                <h2 class="section-title">Why Choose Moussawer?</h2>
                <p class="section-subtitle">A platform built for photographers and clients alike</p>
            </div>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🎯</div>
                    <h3>Curated Talent</h3>
                    <p>Every photographer is vetted for quality and professionalism. We ensure only the best join our platform.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🤝</div>
                    <h3>Seamless Booking</h3>
                    <p>From discovery to delivery, our platform makes booking photographers simple and stress-free.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">💰</div>
                    <h3>Transparent Pricing</h3>
                    <p>Clear packages and pricing with no hidden fees. Find options for every budget and need.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <h3>Digital Workflow</h3>
                    <p>Manage bookings, communicate, and receive photos through our integrated digital platform.</p>
                </div>
            </div>
        </section>

        <!-- How It Works Section -->
        <section class="how-it-works">
            <div class="section-header">
                <h2 class="section-title">How It Works</h2>
                <p class="section-subtitle">Get started in four simple steps</p>
            </div>
            <div class="steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <h3>Browse & Discover</h3>
                    <p>Explore photographer portfolios, read reviews, and find styles that match your vision.</p>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <h3>Connect & Discuss</h3>
                    <p>Message photographers directly to discuss your project, timeline, and specific requirements.</p>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <h3>Book Securely</h3>
                    <p>Confirm your booking with secure payment and receive a detailed contract and timeline.</p>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <h3>Capture & Enjoy</h3>
                    <p>Relax while professionals capture your moments. Receive edited photos through our platform.</p>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="cta">
            <div class="cta-content">
                <h2>Ready to Capture Your Story?</h2>
                <p>Join thousands of clients and photographers who trust Moussawer for their photography needs.</p>
                <div class="cta-actions">
                    <router-link to="/register" class="btn btn-primary btn-large">
                        Start Your Journey
                    </router-link>
                    <router-link to="/contact" class="btn btn-outline btn-large">
                        Contact Us
                    </router-link>
                </div>
            </div>
        </section>

        <!-- Testimonials Section -->
        <section class="testimonials">
            <div class="section-header">
                <h2 class="section-title">What Our Community Says</h2>
                <p class="section-subtitle">Hear from photographers and clients who use our platform</p>
            </div>
            <div class="testimonials-grid">
                <div class="testimonial">
                    <div class="testimonial-content">
                        <p class="testimonial-text">"Found an amazing photographer for our wedding. The results exceeded our expectations!"</p>
                        <div class="testimonial-author">
                            <span class="author-name">Sarah & Michael</span>
                            <span class="author-role">Wedding Clients</span>
                        </div>
                    </div>
                </div>
                <div class="testimonial">
                    <div class="testimonial-content">
                        <p class="testimonial-text">"Professional, responsive, and incredibly talented. Highly recommend."</p>
                        <div class="testimonial-author">
                            <span class="author-name">James</span>
                            <span class="author-role">Corporate Events</span>
                        </div>
                    </div>
                </div>
                <div class="testimonial">
                    <div class="testimonial-content">
                        <p class="testimonial-text">"Easy to use and found a great photographer within my budget. Very happy!"</p>
                        <div class="testimonial-author">
                            <span class="author-name">Emily</span>
                            <span class="author-role">Portrait Session</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
</script>

<style scoped>
/* HomeView specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
