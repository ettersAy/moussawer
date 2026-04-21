<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  photographer: {
    type: Object,
    required: true
  }
})

const defaultImage = '/images/photographer-placeholder.png'
const displayImage = ref(defaultImage)

onMounted(() => {
  if (props.photographer.portfolio_url) {
    const img = new Image()
    img.src = props.photographer.portfolio_url
    img.onload = () => {
      displayImage.value = props.photographer.portfolio_url
    }
    console.log('Attempting to load image:', props.photographer);
    // If it fails, displayImage stays as defaultImage
    // and we don't set it to the DOM, so no console error from the <img> tag
  }
})
</script>

<template>
  <div class="photographer-card">
    <div class="photographer-card__image-wrapper">
      <img
        :src="displayImage"
        :alt="photographer.user?.name"
        class="photographer-card__image"
      >
    </div>

    <div class="photographer-card__content">
      <h3 class="photographer-card__name">{{ photographer.user?.name }}</h3>

      <div class="photographer-card__rating">
        <span>⭐</span>
        <span>{{ photographer.rating || '5.0' }}</span>
      </div>

      <p class="photographer-card__bio">
        {{ photographer.bio || 'No bio available.' }}
      </p>

      <div class="photographer-card__footer">
        <div class="photographer-card__price">
          Starting at <span class="photographer-card__price-value">${{ photographer.hourly_rate }}/hr</span>
        </div>

        <router-link
          :to="{ name: 'photographer-discovery' }"
          class="btn btn--primary btn--sm"
        >
          View Profile
        </router-link>
      </div>
    </div>
  </div>
</template>
