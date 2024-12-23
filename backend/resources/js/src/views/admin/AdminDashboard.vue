<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    <p>Welcome to the admin dashboard</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Admin Dashboard mounted')
})
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style>
