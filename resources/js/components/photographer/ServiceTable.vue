<template>
  <div class="table-container">
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Price</th>
            <th>Duration</th>
            <th>Minimum Hours</th>
            <th>Status</th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6">
              <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading services...</p>
              </div>
            </td>
          </tr>
          <tr v-else-if="services.length === 0">
            <td colspan="6">
              <div class="empty-state">
                <p>No services found.</p>
                <button class="btn-secondary mt-1" @click="$emit('add')">Create your first service</button>
              </div>
            </td>
          </tr>
          <ServiceTableRow 
            v-else 
            v-for="service in services" 
            :key="service.id" 
            :service="service"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
            @toggle="$emit('toggle', $event)"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import ServiceTableRow from './ServiceTableRow.vue'

defineProps({
  services: Array,
  loading: Boolean
})
defineEmits(['edit', 'delete', 'toggle', 'add'])
</script>