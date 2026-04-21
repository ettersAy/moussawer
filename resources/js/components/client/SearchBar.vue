<script setup>
const props = defineProps({
  location: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:location', 'search'])

const onInput = (event) => {
  emit('update:location', event.target.value)
}

const onKeydown = (event) => {
  if (event.key === 'Enter') {
    emit('search')
  }
}
</script>

<template>
  <div class="search-bar">
    <div class="search-bar__input-group">
      <span class="search-bar__icon">📍</span>
      <input
        type="text"
        class="search-bar__input"
        placeholder="Search by location (e.g. Paris, London...)"
        :value="location"
        @input="onInput"
        @keydown="onKeydown"
      >
    </div>
    <button class="btn btn--primary" @click="emit('search')">
      Search
    </button>
  </div>
</template>
