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
.home-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

/* Hero Section */
.hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
    padding: 4rem 0;
    min-height: 80vh;
}

.hero-badge {
    margin-bottom: 1.5rem;
}

.badge-text {
    display: inline-block;
    background: rgba(37, 99, 235, 0.1);
    color: #2563eb;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.1;
    color: #1a1a1a;
    margin-bottom: 1.5rem;
}

.highlight {
    color: #2563eb;
    position: relative;
}

.highlight::after {
    content: '';
    position: absolute;
    bottom: 5px;
    left: 0;
    right: 0;
    height: 8px;
    background: rgba(37, 99, 235, 0.2);
    z-index: -1;
}

.hero-subtitle {
    font-size: 1.25rem;
    color: #6b7280;
    line-height: 1.7;
    margin-bottom: 2.5rem;
    max-width: 500px;
}

.hero-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 3rem;
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.875rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    border-radius: 10px;
    transition: all 0.3s ease;
    gap: 0.5rem;
}

.btn-primary {
    background: #2563eb;
    color: white;
    border: 2px solid #2563eb;
}

.btn-primary:hover {
    background: #1d4ed8;
    border-color: #1d4ed8;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
}

.btn-outline {
    border: 2px solid #e5e7eb;
    color: #374151;
    background: white;
}

.btn-outline:hover {
    border-color: #2563eb;
    color: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.btn-icon {
    font-size: 1.1rem;
}

.hero-stats {
    display: flex;
    gap: 3rem;
    padding-top: 2rem;
    border-top: 1px solid #e5e7eb;
}

.stat {
    display: flex;
    flex-direction: column;
}

.stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #1a1a1a;
    line-height: 1;
}

.stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.5rem;
}

.hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
}

.visual-container {
    width: 100%;
    max-width: 500px;
}

.visual-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    aspect-ratio: 1;
}

.visual-item {
    border-radius: 16px;
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    position: relative;
    overflow: hidden;
}

.visual-item::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.05));
}

.item-1 {
    grid-column: 1;
    grid-row: 1;
}

.item-2 {
    grid-column: 2;
    grid-row: 1;
}

.item-3 {
    grid-column: 1;
    grid-row: 2;
}

.item-4 {
    grid-column: 2;
    grid-row: 2;
}

/* Section Common Styles */
.section-header {
    text-align: center;
    margin-bottom: 4rem;
}

.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 1rem;
}

.section-subtitle {
    font-size: 1.125rem;
    color: #6b7280;
    max-width: 600px;
    margin: 0 auto;
}

/* Features Section */
.features {
    padding: 6rem 0;
    background: #f9fafb;
    margin: 0 -1.5rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    max-width: 1000px;
    margin: 0 auto;
}

.feature-card {
    background: white;
    padding: 2.5rem 2rem;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    text-align: center;
}

.feature-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1.5rem;
    display: inline-block;
}

.feature-card h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 1rem;
}

.feature-card p {
    color: #6b7280;
    line-height: 1.6;
    font-size: 1rem;
}

/* How It Works Section */
.how-it-works {
    padding: 6rem 0;
}

.steps {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    max-width: 1000px;
    margin: 0 auto;
}

.step {
    text-align: center;
    position: relative;
}

.step-number {
    width: 60px;
    height: 60px;
    background: #2563eb;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 auto 1.5rem;
    position: relative;
    z-index: 1;
}

.step h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 1rem;
}

.step p {
    color: #6b7280;
    font-size: 0.95rem;
    line-height: 1.6;
}

/* CTA Section */
.cta {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    color: white;
    padding: 6rem 2rem;
    border-radius: 24px;
    text-align: center;
    margin: 4rem 0;
}

.cta-content {
    max-width: 600px;
    margin: 0 auto;
}

.cta h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
}

.cta p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.25rem;
    margin-bottom: 3rem;
    line-height: 1.6;
}

.cta-actions {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
}

.btn-large {
    padding: 1rem 2.5rem;
    font-size: 1.125rem;
}

.cta .btn-outline {
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
    background: transparent;
}

.cta .btn-outline:hover {
    border-color: white;
    background: rgba(255, 255, 255, 0.1);
}

/* Testimonials Section */
.testimonials {
    padding: 6rem 0;
    background: #f9fafb;
    margin: 0 -1.5rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
}

.testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1000px;
    margin: 0 auto;
}

.testimonial {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.testimonial:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.testimonial-content {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.testimonial-text {
    font-size: 1.125rem;
    color: #374151;
    line-height: 1.6;
    font-style: italic;
    margin-bottom: 1.5rem;
    flex-grow: 1;
}

.testimonial-author {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.author-name {
    font-weight: 600;
    color: #1a1a1a;
    font-size: 1rem;
}

.author-role {
    font-size: 0.875rem;
    color: #6b7280;
}

/* Responsive */
@media (max-width: 1024px) {
    .hero {
        grid-template-columns: 1fr;
        gap: 3rem;
        text-align: center;
        padding: 3rem 0;
    }

    .hero-subtitle {
        margin: 0 auto 2.5rem;
    }

    .hero-actions {
        justify-content: center;
    }

    .hero-stats {
        justify-content: center;
    }

    .visual-container {
        max-width: 400px;
        margin: 0 auto;
    }
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 2.5rem;
    }

    .hero-subtitle {
        font-size: 1.125rem;
    }

    .hero-actions {
        flex-direction: column;
        align-items: center;
    }

    .btn {
        width: 100%;
        max-width: 300px;
    }

    .hero-stats {
        flex-direction: column;
        gap: 1.5rem;
        align-items: center;
    }

    .section-title {
        font-size: 2rem;
    }

    .steps {
        grid-template-columns: 1fr;
        gap: 3rem;
    }

    .step {
        max-width: 300px;
        margin: 0 auto;
    }

    .cta-actions {
        flex-direction: column;
        align-items: center;
    }

    .btn-large {
        width: 100%;
        max-width: 300px;
    }

    .features-grid,
    .testimonials-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .home-container {
        padding: 0 1rem;
    }

    .hero {
        padding: 2rem 0;
        min-height: auto;
    }

    .hero-title {
        font-size: 2rem;
    }

    .section-title {
        font-size: 1.75rem;
    }

    .cta {
        padding: 4rem 1.5rem;
        margin: 3rem 0;
    }

    .cta h2 {
        font-size: 2rem;
    }
}
</style>
